# Contributing to Nuts (Agent Guidelines)

## Rules

- **Always preserve Git history**: Edit files in-place, never rewrite the repo.
- **Follow the refactor plan**: See `docs/REFACTOR_PLAN.md`.
- **Commit atomically**: One logical change per commit (e.g., "Migrate gameSlice to SolidJS store").
- **TypeScript strict**: No `any`, use interfaces from `types/game.ts`.
- **Test changes**: Run `pnpm typecheck` and `pnpm lint` before committing.

## File Structure

- **Do not modify**: `src/store/` (deprecated), `src/components/App.tsx` (until Phase 4).
- **Focus first**: `src/engine/` (new game loop/state), `src/types/` (shared interfaces).

## Code Style

- **SolidJS**: Use `createSignal` for local state, `createStore` for global state.
- **Tailwind**: Use utility classes (no custom CSS unless necessary).
- **Comments**: Add `// TODO: AGENT` for questions or incomplete work.
