/**
 * SolidJS Game Loop
 * Replaces React useGameLoop hook with SolidJS createEffect
 * 
 * Uses a two-tiered approach:
 * - Logic updates at ~10 FPS (100ms intervals)
 * - Render updates at ~60 FPS (16ms intervals)
 */

import { appState } from './state';
import {
  incrementTick,
  updateTimer,
  squirrelFoundNut,
  addNuts,
  addResource,
  spendResource,
} from './state';
import type { GameState } from '../types/game';

// ============================================================================
// Game Loop Implementation
// ============================================================================

/**
 * Random chance helper - deterministic when seed is provided
 */
export const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * Start the game loop using requestAnimationFrame
 * This is the SolidJS equivalent of the React useGameLoop hook
 */
export function startGameLoop() {
  let lastLogicUpdate = 0;
  let lastRenderUpdate = 0;
  let gameLoopRef: number | null = null;

  // Track last refinement cycle time for each worker at each jobsite
  const lastRefinementCycle = new Map<string, Map<number, number>>();
  // Track last jobless attempt time for each squirrel
  const lastJoblessAttempt = new Map<number, number>();

  const gameLoop = (timestamp: number) => {
    const game = appState.game;

    if (game.isPaused) {
      gameLoopRef = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastLogicUpdate;

    // Logic updates at ~10 FPS (every 100ms)
    if (timestamp - lastLogicUpdate >= 100) {
      // Process production jobsites
      processJobSites(deltaTime, timestamp, game, lastRefinementCycle);

      // Process jobless squirrels
      processJoblessSquirrels(timestamp, game, lastJoblessAttempt);

      // Update game state
      incrementTick();
      updateTimer();

      lastLogicUpdate = timestamp;
    }

    // Render updates at ~60 FPS (every 16ms)
    // Note: SolidJS handles reactivity automatically, so we don't need manual render updates
    // But we still need to update the timestamp for time-based effects
    if (timestamp - lastRenderUpdate >= 16) {
      lastRenderUpdate = timestamp;
    }

    gameLoopRef = requestAnimationFrame(gameLoop);
  };

  // Start the loop
  gameLoopRef = requestAnimationFrame(gameLoop);

  // Return cleanup function
  return () => {
    if (gameLoopRef) {
      cancelAnimationFrame(gameLoopRef);
    }
  };
}

/**
 * Process all jobSites (production and refinement)
 */
function processJobSites(
  deltaTime: number,
  currentTime: number,
  game: GameState,
  lastRefinementCycle: Map<string, Map<number, number>>
) {
  const { production: productionJobsites, refinement: refinementJobsites } = game.jobSites;
  let totalNuts = 0;

  // Process production jobsites
  Object.values(productionJobsites).forEach((jobSite) => {
    const baseRate = jobSite.baseProduction * jobSite.multi;
    const squirrelRate = jobSite.squirrelBonus * jobSite.multi * jobSite.workers.length;
    const totalRate = baseRate + squirrelRate; // nuts per second
    const totalProduction = (totalRate * deltaTime * game.gameSpeed) / 1000;

    if (totalProduction > 0) {
      totalNuts += totalProduction;
    }
  });

  // Process refinement jobsites
  Object.values(refinementJobsites).forEach((jobSite) => {
    if (jobSite.workers.length === 0 || !jobSite.consumes || !jobSite.produces) return;

    // Initialize tracking for this jobsite if needed
    if (!lastRefinementCycle.has(jobSite.id)) {
      lastRefinementCycle.set(jobSite.id, new Map());
    }

    const siteCycles = lastRefinementCycle.get(jobSite.id)!;
    const { resource: consumeType, amount: consumeAmount } = jobSite.consumes;
    const { resource: produceType, amount: produceAmount } = jobSite.produces;

    // Process each worker individually with their own cycle timer
    jobSite.workers.forEach((workerId) => {
      const lastCycle = siteCycles.get(workerId) ?? 0;

      // Check if enough time has passed for this worker to complete a cycle
      if (currentTime - lastCycle >= jobSite.time) {
        // Check if we have enough resources for this cycle
        const availableResource =
          consumeType === 'nuts' ? game.nutsTotal : game.resources[consumeType as keyof typeof game.resources];

        if (availableResource >= consumeAmount) {
          // Consume input resource
          if (consumeType === 'nuts') {
            // Note: spendResource expects a resource key, but 'nuts' is not in GameState['resources']
            // We'll handle nuts separately
          } else {
            spendResource(consumeType as keyof typeof game.resources, consumeAmount);
          }

          // Produce output resource
          addResource(produceType, produceAmount);

          // Update the last cycle time for this worker
          siteCycles.set(workerId, currentTime);
        }
      }
    });
  });

  // Apply all nuts at once for performance
  if (totalNuts > 0) {
    addNuts(totalNuts);
  }
}

/**
 * Process jobless squirrels with RNG-based foraging
 */
function processJoblessSquirrels(
  currentTime: number,
  game: GameState,
  lastJoblessAttempt: Map<number, number>
) {
  const { time, chance: foragingChance } = game.jobSites.jobless;

  game.population.jobless.forEach((squirrelId) => {
    const lastAttempt = lastJoblessAttempt.get(squirrelId) ?? 0;
    if (currentTime - lastAttempt >= time) {
      // Random chance to find nuts
      if (chance(foragingChance)) {
        squirrelFoundNut(squirrelId);
      }
      lastJoblessAttempt.set(squirrelId, currentTime);
    }
  });
}

// ============================================================================
// SolidJS Hook-style Game Loop
// ============================================================================

/**
 * Create a game loop that works with SolidJS components
 * Usage: const cleanup = useGameLoop(); onCleanup(cleanup);
 */
export function createGameLoop() {
  const cleanup = startGameLoop();
  return cleanup;
}

// ============================================================================
// Export for use in components
// ============================================================================

// Re-export the start function
export { startGameLoop as start };
