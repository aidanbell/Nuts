/**
 * SolidJS Hooks for Game Logic
 * These replace the React hooks (useGameLoop, useGoldenNut, etc.)
 * with SolidJS equivalents using createEffect, createSignal, etc.
 */

import { createEffect, createSignal, onCleanup, createMemo } from "solid-js";
import {
  appState,
  setAppState,
  addNuts,
  spendNuts,
  addResource,
  spendResource,
  squirrelFoundNut,
  createSquirrel,
  unlockJobsites,
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
  batchUpdate,
  incrementTick,
  updateTimer,
  setGameSpeed,
  pauseGame,
  resumeGame,
  setActiveTab,
  unlockTab,
  unlockTabs,
  hibernate,
  loadSaveData,
  updateTimestamp,
  researchIdea,
  showIdea,
  showIdeas,
  updateIdeaVisibility,
  resetIdeas,
  loadIdeasState,
  completeCheckpoint,
  showStory,
  dismissStory,
  queueStory,
  queueStories,
  setEra,
  setPendingChoice,
  makeChoice,
  resetCheckpoints,
  loadCheckpointState,
  addLog,
  clearLogs,
} from "./state";
import type { GameState, Squirrel, JobSite, Population } from "../types/game";
import type {
  StoryState,
  StoryCheckpoint,
  CheckpointCondition,
} from "../types/story";
import { processEffects } from "../utils/effectProcessor";

// ============================================================================
// useGameLoop - SolidJS Version
// ============================================================================

/**
 * Random chance helper
 */
const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * SolidJS game loop hook
 * Replaces React useGameLoop with createEffect
 *
 * Note: In SolidJS, we use createEffect which automatically tracks dependencies.
 * However, for game loops, we use requestAnimationFrame directly since
 * createEffect doesn't provide the timestamp parameter.
 */
export function useSolidGameLoop() {
  // Track last refinement cycle time for each worker at each jobsite
  const lastRefinementCycle = new Map<string, Map<number, number>>();
  // Track last jobless attempt time for each squirrel
  const lastJoblessAttempt = new Map<number, number>();

  createEffect(() => {
    const game = appState.game;
    let lastLogicUpdate = 0;
    let lastRenderUpdate = 0;
    let gameLoopRef: number | null = null;

    // Get current state values that we need
    const gameSpeed = game.gameSpeed;
    const isPaused = game.isPaused;

    const gameLoop = (timestamp: number) => {
      const currentGame = appState.game;

      if (currentGame.isPaused) {
        gameLoopRef = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = timestamp - lastLogicUpdate;

      // Logic updates at ~10 FPS (every 100ms)
      if (timestamp - lastLogicUpdate >= 100) {
        const { production, refinement } = currentGame.jobSites;

        Object.values(game.jobSites.production).forEach((jobSite) => {
          const baseRate = jobSite.baseProduction * jobSite.multi;
          const squirrelRate =
            jobSite.squirrelBonus * jobSite.multi * jobSite.workers.length;
          const totalRate = baseRate + squirrelRate; // nuts per second
          const totalProduction =
            (totalRate * deltaTime * currentGame.gameSpeed) / 1000;

          if (totalProduction > 0) {
            totalNuts += totalProduction;
          }
        });

        // Process refinement jobsites
        Object.values(game.jobSites.refinement).forEach((jobSite) => {
          if (
            jobSite.workers.length === 0 ||
            !jobSite.consumes ||
            !jobSite.produces
          )
            return;

          // Initialize tracking for this jobsite if needed
          if (!lastRefinementCycle.has(jobSite.id)) {
            lastRefinementCycle.set(jobSite.id, new Map());
          }

          const siteCycles = lastRefinementCycle.get(jobSite.id)!;
          const { resource: consumeType, amount: consumeAmount } =
            jobSite.consumes;
          const { resource: produceType, amount: produceAmount } =
            jobSite.produces;

          // Process each worker individually with their own cycle timer
          jobSite.workers.forEach((workerId) => {
            const lastCycle = siteCycles.get(workerId) ?? 0;

            // Check if enough time has passed for this worker to complete a cycle
            if (timestamp - lastCycle >= jobSite.time) {
              // Check if we have enough resources for this cycle
              const availableResource =
                consumeType === "nuts"
                  ? currentGame.nutsTotal
                  : currentGame.resources[
                      consumeType as keyof typeof currentGame.resources
                    ];

              if (availableResource >= consumeAmount) {
                // Consume input resource
                if (consumeType === "nuts") {
                  spendNuts(consumeAmount);
                } else {
                  spendResource(
                    consumeType as keyof typeof currentGame.resources,
                    consumeAmount,
                  );
                }

                // Produce output resource
                addResource(produceType, produceAmount);

                // Update the last cycle time for this worker
                siteCycles.set(workerId, timestamp);
              }
            }
          });
        });

        // Apply all nuts at once for performance
        if (totalNuts > 0) {
          addNuts(totalNuts);
        }

        // Process jobless squirrels - RNG-BASED FORAGING
        const { time, chance: foragingChance } = currentGame.jobSites.jobless;
        currentGame.population.jobless.forEach((squirrelId) => {
          const lastAttempt = lastJoblessAttempt.get(squirrelId) ?? 0;
          if (timestamp - lastAttempt >= time) {
            // Random chance to find nuts (value & multi applied in squirrelFoundNut)
            if (chance(foragingChance)) {
              squirrelFoundNut(squirrelId);
            }
            lastJoblessAttempt.set(squirrelId, timestamp);
          }
        });

        // Update game state
        incrementTick();
        updateTimer();
        updateTimestamp();

        lastLogicUpdate = timestamp;
      }

      // Render updates at ~60 FPS (every 16ms)
      if (timestamp - lastRenderUpdate >= 16) {
        lastRenderUpdate = timestamp;
      }

      gameLoopRef = requestAnimationFrame(gameLoop);
    };

    // Start the loop
    gameLoopRef = requestAnimationFrame(gameLoop);

    // Cleanup on effect disposal
    onCleanup(() => {
      if (gameLoopRef) {
        cancelAnimationFrame(gameLoopRef);
      }
    });
  });
}

// ============================================================================
// useAutoSave - SolidJS Version
// ============================================================================

/**
 * SolidJS auto-save hook
 * Replaces the React useAutoSave in App.tsx
 */
export function useSolidAutoSave() {
  createEffect(() => {
    const game = appState.game;

    // Load game on mount
    const savedData = loadGame();
    if (savedData) {
      loadSaveData(savedData);
    }

    // Auto-save every 30 seconds
    const autoSaveEnabled =
      localStorage.getItem("debug_autosave_enabled") !== "false";

    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      saveGame(game);
      console.log("Auto-saved game state");
    }, 30000);

    // Save on beforeunload
    const handleBeforeUnload = () => {
      if (autoSaveEnabled) {
        saveGame(game);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    onCleanup(() => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
  });
}

// ============================================================================
// useStoryCheckpoints - SolidJS Version
// ============================================================================

/**
 * Check if a condition is met
 */
function checkCondition(condition: CheckpointCondition): boolean {
  const game = appState.game;
  const story = appState.story;
  const ideas = appState.ideas; // Reference for type access
  const { type, value, operator = ">=" } = condition;
  let currentValue: number | string = 0;

  switch (type) {
    case "nuts_collected":
      currentValue = game.nutsTotal;
      break;

    case "time_elapsed":
      // Convert timer to milliseconds
      currentValue = game.timer.m * 60000 + game.timer.s * 1000 + game.timer.ms;
      break;

    case "squirrels_count":
      currentValue = Object.keys(game.squirrels).length;
      break;

    case "jobsites_purchased": {
      // Count total level across all jobsites (production and refinement)
      const productionLevel = Object.values(game.jobSites.production).reduce(
        (total, jobsite) => total + jobsite.level,
        0,
      );
      const refinementLevel = Object.values(game.jobSites.refinement).reduce(
        (total, jobsite) => total + jobsite.level,
        0,
      );
      currentValue = productionLevel + refinementLevel;
      break;
    }
    case "era_reached":
      currentValue = story.currentEra || "";
      break;

    case "building_built":
      // TODO: Implement building tracking when building system is complete
      return false;

    case "idea_researched":
      return ideas.ideas[value as string]?.researched || false;

    case "hibernations_completed":
      currentValue = game.goldNuts?.total || 0;
      break;

    case "resource_count": {
      const resourceType = condition.resource;
      if (resourceType && game.resources && resourceType in game.resources) {
        currentValue =
          game.resources[resourceType as keyof typeof game.resources];
      } else {
        return false;
      }
      break;
    }

    default:
      return false;
  }

  // Handle string comparisons (for era_reached)
  if (typeof value === "string" && typeof currentValue === "string") {
    return operator === "==" ? currentValue === value : false;
  }

  // Handle numeric comparisons
  if (typeof value === "number" && typeof currentValue === "number") {
    switch (operator) {
      case ">=":
        return currentValue >= value;
      case ">":
        return currentValue > value;
      case "==":
        return currentValue === value;
      case "<":
        return currentValue < value;
      case "<=":
        return currentValue <= value;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Check if checkpoint should trigger
 */
function shouldTriggerCheckpoint(checkpoint: StoryCheckpoint): boolean {
  // Don't retrigger completed one-time checkpoints
  if (checkpoint.completed && checkpoint.oneTime) {
    return false;
  }

  // Check requirements (AND logic - all must be true)
  if (checkpoint.requirements) {
    const allRequirementsMet = checkpoint.requirements.every((req) =>
      checkCondition(req),
    );
    if (!allRequirementsMet) {
      return false;
    }
  }

  // Check triggers (OR logic - any one triggers)
  if (checkpoint.triggers) {
    return checkpoint.triggers.some((trigger) => checkCondition(trigger));
  }

  return false;
}

/**
 * Process all checkpoints
 */
function processCheckpoints() {
  const story = appState.story;

  // Get uncompleted checkpoints sorted by priority
  const checkpointsToCheck = Object.values(appState.story.checkpoints)
    .filter((cp) => !cp.completed || cp.repeatable)
    .sort((a, b) => b.priority - a.priority);

  // Collect all triggered checkpoints
  const triggeredCheckpoints: StoryCheckpoint[] = [];

  for (const checkpoint of checkpointsToCheck) {
    if (shouldTriggerCheckpoint(checkpoint)) {
      triggeredCheckpoints.push(checkpoint);
    }
  }

  // Process all triggered checkpoints
  if (triggeredCheckpoints.length > 0) {
    const checkpointIds: string[] = [];

    for (const checkpoint of triggeredCheckpoints) {
      addLog(`Story checkpoint: ${checkpoint.name}`, "success");

      // Mark as completed
      completeCheckpoint(checkpoint.id);

      // Apply effects using centralized processor
      processEffects(checkpoint.effects, {
        sourceName: checkpoint.name,
        sourceType: "checkpoint",
        checkpointId: checkpoint.id,
      });

      // Add to queue if it has a story to show
      if (checkpoint.effects.showStory && checkpoint.story) {
        checkpointIds.push(checkpoint.id);
      }
    }

    // Queue all stories at once (in priority order)
    if (checkpointIds.length > 0) {
      queueStories(checkpointIds);
    }
  }
}

/**
 * SolidJS story checkpoints hook
 * Checks for and triggers story checkpoints based on game state
 */
export function useSolidStoryCheckpoints() {
  createEffect(() => {
    const game = appState.game;
    const story = appState.story;

    // Check for checkpoints every second
    const interval = setInterval(() => {
      processCheckpoints();
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  // Also check immediately when game state changes significantly
  createEffect(() => {
    const game = appState.game;
    const story = appState.story;

    // Track specific values that might trigger checkpoints
    const squirrelCount = Object.keys(game.squirrels).length;
    const nutwoodCount = game.resources?.nutwood || 0;

    // Check when these values change
    processCheckpoints();
  });
}

// ============================================================================
// useIdeas - SolidJS Version
// ============================================================================

/**
 * SolidJS ideas hook
 * Manages ideas/research system
 */
export function useSolidIdeas() {
  // Update idea visibility based on game state
  createEffect(() => {
    const game = appState.game;
    const story = appState.story;

    updateIdeaVisibility({
      nutsCollected: game.nutsTotal,
      squirrelsCount: Object.keys(game.squirrels).length,
      currentEra: story.currentEra || "WOOD_AGE",
    });
  });

  // Check if player can afford an idea
  const canAfford = (idea: Idea): boolean => {
    if (idea.researched) return false;

    const game = appState.game;
    const nutCost = idea.cost.nuts || 0;
    const woodCost = idea.cost.nutwood || 0;
    const stoneCost = idea.cost.stone || 0;
    const bronzeCost = idea.cost.bronze || 0;
    return (
      game.nutsTotal >= nutCost &&
      game.resources.nutwood >= woodCost &&
      game.resources.stone >= stoneCost &&
      game.resources.bronze >= bronzeCost
    );
  };

  // Research an idea
  const research = (ideaId: string) => {
    const ideas = appState.ideas; // Reference for type access
    const idea = appState.ideas.ideas[ideaId];
    if (!idea || idea.researched || !canAfford(idea)) return;

    const game = appState.game;

    // Deduct costs
    const nutCost = idea.cost.nuts || 0;
    const woodCost = idea.cost.nutwood || 0;
    const stoneCost = idea.cost.stone || 0;
    const bronzeCost = idea.cost.bronze || 0;
    if (nutCost > 0) spendNuts(nutCost);
    if (woodCost > 0) spendResource("nutwood", woodCost);
    if (stoneCost > 0) spendResource("stone", stoneCost);
    if (bronzeCost > 0) spendResource("bronze", bronzeCost);

    // Mark as researched
    researchIdea(ideaId);
    addLog(`Researched: ${idea.name}`, "success");

    // Apply dispatch-requiring effects using centralized processor
    processEffects(idea.effects, {
      sourceName: idea.name,
      sourceType: "idea",
      suppressLogs: true,
    });
  };

  // Get visible ideas
  const visibleIdeas = createMemo(() => {
    return Object.values(appState.ideas.ideas).filter((idea) => idea.visible);
  });

  // Get researched ideas
  const researchedIdeas = createMemo(() => {
    return Object.values(appState.ideas.ideas).filter(
      (idea) => idea.researched,
    );
  });

  // Get affordable ideas
  const affordableIdeas = createMemo(() => {
    return visibleIdeas().filter((idea) => !idea.researched && canAfford(idea));
  });

  return {
    ideas: Object.values(appState.ideas.ideas),
    visibleIdeas,
    researchedIdeas,
    affordableIdeas,
    researchedCount: appState.ideas.researchedCount,
    canAfford,
    research,
  };
}

// ============================================================================
// useGoldenNut - SolidJS Version
// ============================================================================

/**
 * Expected nuts/sec for one jobless squirrel
 */
const joblessNutsPerSecond = (jobless: GameState["jobSites"]["jobless"]) => {
  const attemptsPerSec = 1000 / jobless.time;
  return attemptsPerSec * jobless.chance * jobless.value * jobless.multi;
};

/**
 * Burst reward: ~15s of all jobless production, scaled up slightly with count
 */
export const calculateGoldenNutReward = (
  joblessSite: GameState["jobSites"]["jobless"],
  joblessCount: number,
): number => {
  const perSquirrel = joblessNutsPerSecond(joblessSite);
  const burst = perSquirrel * Math.max(1, joblessCount) * 15;
  // Slight bonus for keeping more jobless squirrels around
  const countBonus = 1 + Math.log2(1 + Math.max(0, joblessCount - 1)) * 0.15;
  return Math.max(5, Math.round(burst * countBonus));
};

export interface GoldenNutState {
  id: number;
  x: number; // percent of viewport width
  y: number; // percent of viewport height
  reward: number;
  spawnedAt: number;
  expiresAt: number;
  /** CSS lifetime for the current appearance (updated after pause) */
  durationMs: number;
}

const MIN_SPAWN_DELAY_MS = 20_000;
const MAX_SPAWN_DELAY_MS = 45_000;
const FIRST_SPAWN_MIN_MS = 8_000;
const FIRST_SPAWN_MAX_MS = 15_000;
const LIFETIME_MS = 13_000;
const FADE_MS = 2_000;
const MARGIN_PERCENT = 8; // keep away from edges

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const randomPosition = () => ({
  x: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
  y: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
});

/**
 * SolidJS golden nut hook
 */
export function useSolidGoldenNut() {
  const game = appState.game;
  const [goldenNut, setGoldenNut] = createSignal<GoldenNutState | null>(null);
  const nextSpawnAtRef = {
    current: Date.now() + randomBetween(FIRST_SPAWN_MIN_MS, FIRST_SPAWN_MAX_MS),
  };
  const idRef = { current: 0 };
  const hasJobless = createMemo(() => game.population.jobless.length > 0);

  const scheduleNextSpawn = (fromTime: number = Date.now()) => {
    nextSpawnAtRef.current =
      fromTime + randomBetween(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
  };

  const spawnGoldenNut = () => {
    if (game.population.jobless.length === 0) return;

    const now = Date.now();
    const { x, y } = randomPosition();
    const reward = calculateGoldenNutReward(
      game.jobSites.jobless,
      game.population.jobless.length,
    );

    idRef.current += 1;
    setGoldenNut({
      id: idRef.current,
      x,
      y,
      reward,
      spawnedAt: now,
      expiresAt: now + LIFETIME_MS,
      durationMs: LIFETIME_MS,
    });
  };

  const clearGoldenNut = () => {
    setGoldenNut(null);
    scheduleNextSpawn();
  };

  const collectGoldenNut = () => {
    const gn = goldenNut();
    if (!gn) return;

    addNuts(gn.reward);
    addLog({
      message: `Lucky find! Grabbed a glowing nut for ${gn.reward} nuts.`,
      level: "success",
    });
    clearGoldenNut();
  };

  // Despawn if player no longer has any jobless squirrels
  createEffect(() => {
    if (!hasJobless() && goldenNut()) {
      setGoldenNut(null);
      scheduleNextSpawn();
    }
  });

  // Spawn / expire loop
  createEffect(() => {
    const isPaused = game.isPaused;
    const gn = goldenNut();
    const hasJoblessVal = hasJobless();

    const tick = () => {
      if (isPaused) return;

      const now = Date.now();

      if (gn && now >= gn.expiresAt) {
        setGoldenNut(null);
        scheduleNextSpawn(now);
        return;
      }

      if (!gn && hasJoblessVal && now >= nextSpawnAtRef.current) {
        spawnGoldenNut();
      }
    };

    const interval = window.setInterval(tick, 250);
    onCleanup(() => window.clearInterval(interval));
  });

  // While paused, push spawn/expiry timers forward so pause doesn't eat the wait
  const pauseStartedAtRef = { current: null as number | null };
  createEffect(() => {
    const isPaused = game.isPaused;

    if (isPaused) {
      pauseStartedAtRef.current = Date.now();
      return;
    }

    if (pauseStartedAtRef.current !== null) {
      const pausedFor = Date.now() - pauseStartedAtRef.current;
      nextSpawnAtRef.current += pausedFor;
      setGoldenNut((current) => {
        if (!current) return null;
        const newExpiresAt = current.expiresAt + pausedFor;
        return {
          ...current,
          expiresAt: newExpiresAt,
          durationMs: Math.max(FADE_MS, newExpiresAt - Date.now()),
        };
      });
      pauseStartedAtRef.current = null;
    }
  });

  return {
    goldenNut,
    collectGoldenNut,
    fadeMs: FADE_MS,
  };
}

// ============================================================================
// Re-exports from state for convenience
// ============================================================================

export {
  appState,
  setAppState,
  addNuts,
  spendNuts,
  addResource,
  spendResource,
  squirrelFoundNut,
  createSquirrel,
  unlockJobsites,
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
  batchUpdate,
  incrementTick,
  updateTimer,
  setGameSpeed,
  pauseGame,
  resumeGame,
  setActiveTab,
  unlockTab,
  unlockTabs,
  hibernate,
  loadSaveData,
  updateTimestamp,
  researchIdea,
  showIdea,
  showIdeas,
  updateIdeaVisibility,
  resetIdeas,
  loadIdeasState,
  completeCheckpoint,
  showStory,
  dismissStory,
  queueStory,
  queueStories,
  setEra,
  setPendingChoice,
  makeChoice,
  resetCheckpoints,
  loadCheckpointState,
  addLog,
  clearLogs,
};

// Re-export types
export type { GameState, Squirrel, JobSite, Population };
export type { IdeasState, Idea };
export type { StoryState, StoryCheckpoint, CheckpointCondition };
