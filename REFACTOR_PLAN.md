# Nuts: Performance Refactor Plan

_Incremental Game Optimization for Scale and Stability_

---

## **🎯 Goals &amp; Non-Negotiables**

### **Core Objectives**

- **Performance:** Handle **1000+ squirrels** across **50+ jobsites** with **zero jank** (60 FPS).
- **Stability:** No crashes, no memory leaks, **100% deterministic** game logic.
- **Premium Feel:** Smooth animations, instant UI feedback, **no perceived lag**.
- **Maintainability:** Easy to add new features (e.g., new resources, jobsites, mechanics).
- **Tooling:** Modern, fast, and **zero-config** where possible.

### **Non-Negotiables**

- **No Redux** (too slow for high-frequency updates).
- **No React** (virtual DOM overhead is unnecessary).
- **No jQuery** (too slow, outdated).
- **No manual DOM updates in loops** (use reactive primitives).
- **No global state mutations** (centralized state only).

---

## **🛠 Tech Stack**

| Layer         | Technology               | Why?                                                                           |
| ------------- | ------------------------ | ------------------------------------------------------------------------------ |
| **Framework** | SolidJS                  | Fine-grained reactivity, **no virtual DOM**, \~7KB, React-like syntax.         |
| **State**     | SolidJS Signals + Stores | Built-in reactivity, **no boilerplate**, optimized for high-frequency updates. |
| **Styling**   | Tailwind CSS v4          | Utility-first, **zero runtime**, fast to iterate.                              |
| **Bundler**   | Vite                     | **Instant HMR**, tiny bundles, plugins for everything.                         |
| **Language**  | TypeScript               | Type safety for complex game logic.                                            |
| **Dev Tools** | ESLint, Prettier, pnpm   | Consistent code, **fast installs**, workspace support.                         |

---

## **🏗 Architecture Overview**

### **1. State Management**

- **Single Source of Truth:** One `gameState` object (TypeScript interface) for all game data.
- **Reactive Primitives:** SolidJS `createSignal` for local UI state, `createStore` for global game state.
- **No Immer/Redux:** Direct mutations (SolidJS handles reactivity automatically).

#### **State Structure**

```typescript
// types/game.ts
interface GameState {
  // Core resources
  nutsTotal: number;
  nutsAllTime: number;
  resources: Record<ResourceType, number>; // nutwood, stone, etc.

  // Squirrels
  squirrels: Map<number, Squirrel>; // Map for O(1) lookups
  nextSquirrelId: number;

  // JobSites
  jobSites: {
    production: Map<string, ProductionJobSite>;
    refinement: Map<string, RefinementJobSite>;
    jobless: JoblessJobSite;
  };

  // Game meta
  gameSpeed: number;
  isPaused: boolean;
  tick: number;
  timer: { ms: number; s: number; m: number };

  // UI
  activeTab: string;
  unlockedTabs: string[];
}
```

---

### **2. Game Loop (Engine)**

- **Two-Tiered Loop:** Separate **logic** (10 FPS) and **render** (60 FPS) updates.
- **Priority-Based:** Critical updates (e.g., `nutsTotal`) run more frequently than non-critical (e.g., animations).
- **Deterministic:** Same inputs → same outputs (no `Math.random()` in pure logic).

#### **Loop Design**

```typescript
// engine/gameLoop.ts
import { gameState } from "./state";

let lastLogicUpdate = 0;
let lastRenderUpdate = 0;

function startGameLoop() {
  const loop = (timestamp: number) => {
    // Logic updates (10 FPS)
    if (timestamp - lastLogicUpdate >= 100) {
      updateGameState(timestamp);
      lastLogicUpdate = timestamp;
    }

    // Render updates (60 FPS)
    if (timestamp - lastRenderUpdate >= 16) {
      renderGameState();
      lastRenderUpdate = timestamp;
    }

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function updateGameState(timestamp: number) {
  // 1. Process jobless squirrels (RNG-based)
  processJoblessSquirrels(timestamp);

  // 2. Process production jobsites (deterministic)
  processProductionJobSites(timestamp);

  // 3. Process refinement jobsites (cycle-based)
  processRefinementJobSites(timestamp);

  // 4. Update timers
  gameState.timer = updateTimer(gameState.timer);
  gameState.tick++;
}

function renderGameState() {
  // SolidJS handles reactivity automatically via signals/stores.
  // No manual DOM updates needed!
}
```

---

### **3. State Updates (Optimized)**

- **Batch Updates:** Group similar updates (e.g., all `nutsTotal` changes in a frame).
- **Lazy Evaluations:** Only recalculate derived values (e.g., `nutsPerSecond`) when dependencies change.
- **Debounce Rapid Changes:** Throttle UI updates for values that change &gt;10x/second.

#### **Example: Batch Nuts Updates**

```typescript
// engine/updates.ts
let nutsDelta = 0;

function addNuts(amount: number) {
  nutsDelta += amount;
}

function flushNutsUpdates() {
  if (nutsDelta !== 0) {
    gameState.nutsTotal += nutsDelta;
    gameState.nutsAllTime += nutsDelta;
    nutsDelta = 0;
  }
}

// Call `flushNutsUpdates()` at the end of each logic tick.
```

---

### **4. UI Layer (SolidJS)**

- **Component-Based:** Reuse React-like components (but with SolidJS’s performance).
- **Reactive:** Automatic updates via `createSignal`/`createStore`.
- **Optimized:** No virtual DOM diffing (direct DOM updates).

#### **Example: Nuts Counter**

```tsx
// components/NutsCounter.tsx
import { createEffect, onCleanup } from "solid-js";
import { gameState } from "../engine/state";

export default function NutsCounter() {
  // Animate the counter for a premium feel
  let displayValue = gameState.nutsTotal;

  createEffect(() => {
    const target = gameState.nutsTotal;
    const animate = () => {
      if (displayValue < target) {
        displayValue += (target - displayValue) * 0.1; // Ease in
        requestAnimationFrame(animate);
      }
    };
    animate();
    onCleanup(() => cancelAnimationFrame(animate));
  });

  return (
    <div class="text-4xl font-bold">
      {Math.floor(displayValue).toLocaleString()}
    </div>
  );
}
```

---

## **📦 Tooling Setup**

### **1. Project Structure**

```
nuts/
├── src/
│   ├── engine/          # Game logic (state, loop, updates)
│   │   ├── state.ts     # Central game state (SolidJS store)
│   │   ├── gameLoop.ts  # Main game loop
│   │   ├── updates.ts   # Batch update helpers
│   │   └── workers/     # Web Workers for heavy logic
│   │
│   ├── components/      # SolidJS components
│   │   ├── ui/          # Reusable UI (buttons, modals)
│   │   ├── game/        # Game-specific (NutsCounter, JobSiteCard)
│   │   └── App.tsx      # Root component
│   │
│   ├── styles/          # Tailwind CSS
│   │   └── global.css   # Global styles + Tailwind directives
│   │
│   ├── types/           # TypeScript interfaces
│   │   └── game.ts      # Game state types
│   │
│   ├── utils/           # Utilities (save/load, math helpers)
│   │   ├── saveSystem.ts
│   │   └── math.ts
│   │
│   └── index.tsx        # Entry point
│
├── public/              # Static assets
├── vite.config.ts       # Vite config
├── package.json
└── tsconfig.json
```

### **2. `package.json` Dependencies**

```json
{
  "name": "nuts",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "solid-js": "^1.8.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-plugin-solid": "^0.13.0",
    "postcss": "^8.4.32",
    "prettier": "^3.2.5",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-solid": "^3.0.0"
  }
}
```

### **3. `vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: "esnext",
    minify: true,
  },
  server: {
    port: 3000,
  },
});
```

---

## **🚀 Migration Plan**

### **Phase 1: Setup &amp; Foundation (1-2 days)**

- [ ] Initialize new **Vite + SolidJS + TypeScript** project.
- [ ] Set up **Tailwind CSS v4** (follow [Tailwind v4 docs](https://tailwindcss.com/docs/installation)).
- [ ] Configure **ESLint + Prettier** for SolidJS.
- [ ] Port **types** (`types/game.ts`) from current project.
- [ ] Create **`gameState` store** in SolidJS (`createStore`).

### **Phase 2: Core Game Loop (2-3 days)**

- [ ] Implement **two-tiered game loop** (`engine/gameLoop.ts`).
- [ ] Port **jobless squirrels logic** to new loop.
- [ ] Port **production jobsites logic** to new loop.
- [ ] Port **refinement jobsites logic** to new loop.
- [ ] Add **batch updates** for `nutsTotal` and other high-frequency values.

### **Phase 3: State Migration (2-3 days)**

- [ ] Replace Redux with **SolidJS `createStore`** for global state.
- [ ] Migrate **all reducers** to direct state mutations.
- [ ] Replace `useSelector`/`useDispatch` with **SolidJS signals/stores**.
- [ ] Test **determinism** (same actions → same state).

### **Phase 4: UI Migration (3-5 days)**

- [ ] Port **`App.tsx`** to SolidJS.
- [ ] Convert **React components** to SolidJS (1:1 mapping for most).
- [ ] Add **animations** for counters (e.g., `nutsTotal` easing).
- [ ] Implement **Tailwind CSS** for styling.

### **Phase 5: Performance Optimizations (2-3 days)**

- [ ] Profile with **Chrome DevTools Performance Tab**.
- [ ] Optimize **hot paths** (e.g., squirrel/jobsite lookups with `Map`).
- [ ] Offload **heavy logic** (e.g., refinement cycles) to **Web Workers**.
- [ ] Add **throttling** for rapid UI updates.

### **Phase 6: Polish &amp; Testing (2-3 days)**

- [ ] Add **save/load system** (use `localStorage` or IndexedDB).
- [ ] Test **edge cases** (e.g., 1000 squirrels, max jobsites).
- [ ] Stress-test **memory usage** (no leaks after 1 hour of gameplay).
- [ ] Add **error boundaries** for crashes.

---

## **⚡ Performance Targets**

| Metric                | Target        | Measurement Tool                |
| --------------------- | ------------- | ------------------------------- |
| FPS                   | 60            | Chrome DevTools Performance Tab |
| Logic Loop Frequency  | 10 FPS        | `performance.now()`             |
| Render Loop Frequency | 60 FPS        | `requestAnimationFrame`         |
| DOM Updates           | &lt;100/frame | Chrome DevTools Performance Tab |
| Memory Usage          | &lt;200MB     | Chrome DevTools Memory Tab      |
| State Update Latency  | &lt;1ms       | `console.time`                  |

---

## **🛡 Stability Guarantees**

### **1. Deterministic Logic**

- **No `Math.random()` in pure logic** (seed RNG for reproducibility).
- **Pure functions** for calculations (e.g., `calculateNutsPerSecond`).
- **Immutable inputs** for critical paths (e.g., `jobSites` lookups).

### **2. Error Handling**

- **Try/catch** all game loop logic.
- **Validate state** on load (e.g., no negative `nutsTotal`).
- **Graceful degradation** (e.g., skip updates if tab is backgrounded).

#### **Example: Safe Game Loop**

```typescript
function updateGameState(timestamp: number) {
  try {
    processJoblessSquirrels(timestamp);
    processProductionJobSites(timestamp);
    processRefinementJobSites(timestamp);
  } catch (error) {
    console.error("Game loop error:", error);
    // Pause game and show error to user
    gameState.isPaused = true;
    showErrorModal("Game Error: Please reload.");
  }
}
```

### **3. Memory Management**

- **Clean up event listeners** in SolidJS `onCleanup`.
- **Avoid closures** in loops (e.g., use `WeakMap` for temporary data).
- **Use `Map`/`Set`** for large collections (faster than objects/arrays for lookups).

---

## **🎨 Premium UI/UX**

### **1. Animations**

- **Smooth counters:** Ease-in for `nutsTotal` updates.
- **Visual feedback:** Highlight buttons on click (Tailwind `active:`).
- **Particle effects:** Use `<canvas>` for nuts flying into counter (optional).

### **2. Responsive Design**

- **Mobile-first:** Touch-friendly buttons, scalable text.
- **Dark mode:** Tailwind `dark:` variant for theme switching.

### **3. Accessibility**

- **Keyboard navigation** for all interactive elements.
- **ARIA labels** for screen readers.
- **Color contrast** (Tailwind’s default palette is AA-compliant).

---

## **📊 Benchmarking Checklist**

- [ ] **FPS:** Stays at 60 in Chrome DevTools.
- [ ] **Memory:** No leaks after 1 hour of gameplay.
- [ ] **State Updates:** 1000 squirrels → &lt;5ms per logic tick.
- [ ] **Load Time:** &lt;1s for first render (Vite + SolidJS).
- [ ] **Save/Load:** &lt;100ms for 1MB save files.

---

## **🚨 Risk Mitigation**

| Risk                      | Mitigation Strategy                                                        |
| ------------------------- | -------------------------------------------------------------------------- |
| Migration breaks gameplay | Keep old React version in a branch until new version is tested.            |
| Performance regressions   | Profile before/after each phase.                                           |
| State corruption          | Add **deep freeze** checks in dev mode (e.g., `Object.freeze(gameState)`). |
| UI jank                   | Use SolidJS `untrack` for derived values to avoid unnecessary re-renders.  |
| Web Worker issues         | Fall back to main thread if Workers aren’t supported.                      |

---

## **📅 Timeline (Estimate: 2-3 Weeks)**

| Phase               | Duration | Focus Areas                           |
| ------------------- | -------- | ------------------------------------- |
| **Setup**           | 1-2 days | Tooling, project structure, types.    |
| **Game Loop**       | 2-3 days | Logic/render separation, determinism. |
| **State Migration** | 2-3 days | Replace Redux, test edge cases.       |
| **UI Migration**    | 3-5 days | Convert components, add animations.   |
| **Optimizations**   | 2-3 days | Profiling, Web Workers, throttling.   |
| **Polish**          | 2-3 days | Save/load, error handling, testing.   |

---

## **🎯 Next Steps**

1. **Approve this plan** (or suggest changes).
2. **Set up the new project** (Vite + SolidJS + Tailwind).
3. **Start with Phase 1** (foundation).
4. **Daily standups** (optional) to sync on progress/blockers.

---

## **💬 Questions for You**

- Should we **prioritize any specific feature** (e.g., save/load, Web Workers)?
- Do you want to **keep any React components** temporarily during migration?
- Should we **add a feature freeze** during the refactor?
- Any **non-negotiable UI/UX** elements (e.g., specific animations)?

---

_Let’s build a game that scales as fast as your squirrels collect nuts. 🐿️_
