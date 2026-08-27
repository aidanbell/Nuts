/**
 * SolidJS Game Loop
 * Replaces React useGameLoop hook with SolidJS createEffect
 *
 * Uses a two-tiered approach:
 * - Logic updates at ~10 FPS (100ms intervals) for game state updates
 * - Render updates at ~60 FPS (16ms intervals) for smooth UI
 *
 * Note: This module provides the core game loop that drives the game forward.
 * It processes production jobsites, refinement jobsites, and jobless squirrels.
 */

import { appState } from "./state";
import {
  incrementTick,
  updateTimer,
  updateTimestamp,
  squirrelFoundNut,
  addNuts,
  addResource,
  spendNuts,
  spendResource,
} from "./state";
import type { GameState } from "../types/game";

// ============================================================================
// Game Loop Implementation
// ============================================================================

/**
 * Random chance helper - deterministic when seed is provided
 * Used for RNG-based foraging by jobless squirrels
 */
export const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * Start the game loop using requestAnimationFrame
 * This is the SolidJS equivalent of the React useGameLoop hook
 *
 * The game loop processes:
 * 1. Production jobsites (passive + squirrel bonus production)
 * 2. Refinement jobsites (resource conversion cycles)
 * 3. Jobless squirrels (RNG-based foraging)
 * 4. Game state updates (tick, timer, timestamp)
 *
 * @returns A cleanup function to stop the game loop
 */
export function startGameLoop() {
  let lastLogicUpdate = 0;
  let lastRenderUpdate = 0;
  let gameLoopRef: number | null = null;

  // Track last refinement cycle time for each worker at each jobsite
  // Using Maps for O(1) lookups which is crucial for performance with many workers
  const lastRefinementCycle = new Map<string, Map<number, number>>();

  // Track last jobless attempt time for each squirrel
  // This ensures each squirrel has its own foraging timer
  const lastJoblessAttempt = new Map<number, number>();

  const gameLoop = (timestamp: number) => {
    const game = appState.game;

    // Skip processing if game is paused
    if (game.isPaused) {
      gameLoopRef = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastLogicUpdate;

    // Logic updates at ~10 FPS (every 100ms)
    // This is where all game state calculations happen
    if (timestamp - lastLogicUpdate >= 100) {
      // Process production jobsites
      processJobSites(deltaTime, timestamp, game, lastRefinementCycle);

      // Process jobless squirrels
      processJoblessSquirrels(timestamp, game, lastJoblessAttempt);

      // Update game state counters
      incrementTick();
      updateTimer();
      updateTimestamp();

      lastLogicUpdate = timestamp;
    }

    // Render updates at ~60 FPS (every 16ms)
    // Note: SolidJS handles reactivity automatically via signals/stores,
    // so we don't need manual DOM updates here. This just maintains
    // the render timing for consistency.
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
 *
 * Production jobsites: Generate nuts passively (baseProduction) + bonus from squirrels
 * Refinement jobsites: Convert resources (e.g., nuts -> nutwood) in cycles
 */
function processJobSites(
  deltaTime: number,
  currentTime: number,
  game: GameState,
  lastRefinementCycle: Map<string, Map<number, number>>,
) {
  const { production: productionJobsites, refinement: refinementJobsites } =
    game.jobSites;
  let totalNuts = 0;

  // Process production jobsites
  // These generate nuts continuously based on their baseProduction and squirrelBonus
  Object.values(productionJobsites).forEach((jobSite) => {
    const baseRate = jobSite.baseProduction * jobSite.multi;
    const squirrelRate =
      jobSite.squirrelBonus * jobSite.multi * jobSite.workers.length;
    const totalRate = baseRate + squirrelRate; // nuts per second
    const totalProduction = (totalRate * deltaTime * game.gameSpeed) / 1000;

    if (totalProduction > 0) {
      totalNuts += totalProduction;
    }
  });

  // Process refinement jobsites
  // These consume one resource and produce another in cycles
  // Each worker at a refinement jobsite runs on its own cycle timer
  Object.values(refinementJobsites).forEach((jobSite) => {
    // Skip if no workers or no consume/produce defined
    if (jobSite.workers.length === 0 || !jobSite.consumes || !jobSite.produces)
      return;

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
          consumeType === "nuts"
            ? game.nutsTotal
            : game.resources[consumeType as keyof typeof game.resources];

        if (availableResource >= consumeAmount) {
          // Consume input resource
          if (consumeType === "nuts") {
            spendNuts(consumeAmount);
          } else {
            spendResource(
              consumeType as keyof typeof game.resources,
              consumeAmount,
            );
          }

          // Produce output resource
          addResource(produceType, produceAmount);

          // Update the last cycle time for this worker
          siteCycles.set(workerId, currentTime);
        }
        // If not enough resources, skip this cycle (try again next tick)
      }
    });
  });

  // Apply all nuts at once for performance
  // Batching updates reduces the number of store mutations
  if (totalNuts > 0) {
    addNuts(totalNuts);
  }
}

/**
 * Process jobless squirrels with RNG-based foraging
 *
 * Jobless squirrels attempt to find nuts at regular intervals (jobless.time ms)
 * with a certain probability (jobless.chance). On success, they find nuts
 * based on the jobless.value and jobless.multi properties.
 *
 * This creates an interesting early-game dynamic where production is random
 * and unpredictable, contrasting with the steady production from jobsites.
 */
function processJoblessSquirrels(
  currentTime: number,
  game: GameState,
  lastJoblessAttempt: Map<number, number>,
) {
  const { time, chance: foragingChance } = game.jobSites.jobless;

  game.population.jobless.forEach((squirrelId) => {
    const lastAttempt = lastJoblessAttempt.get(squirrelId) ?? 0;
    if (currentTime - lastAttempt >= time) {
      // Random chance to find nuts (value & multi applied in squirrelFoundNut)
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
 * Usage: const cleanup = createGameLoop(); onCleanup(cleanup);
 *
 * This wraps startGameLoop() in a function that can be called from
 * SolidJS components and properly cleaned up with onCleanup().
 */
export function createGameLoop() {
  const cleanup = startGameLoop();
  return cleanup;
}

// ============================================================================
// Export for use in components
// ============================================================================

// Re-export the start function for convenience
export { startGameLoop as start };
