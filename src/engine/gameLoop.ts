/**
 * Game loop — two-tiered logic (~10 FPS) and render cadence (~60 FPS).
 *
 * Drives production jobsites, refinement cycles, and jobless foraging.
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
 * Random chance helper for jobless foraging.
 */
export const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * Start the game loop with requestAnimationFrame.
 *
 * Processes:
 * 1. Production jobsites
 * 2. Refinement jobsites
 * 3. Jobless squirrels
 * 4. Tick / timer / timestamp
 *
 * @returns Cleanup function to stop the loop
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

    // Skip processing if game is paused (keep clocks fresh to avoid catch-up spike)
    if (game.isPaused) {
      lastLogicUpdate = timestamp;
      lastRenderUpdate = timestamp;
      gameLoopRef = requestAnimationFrame(gameLoop);
      return;
    }

    // Seed timing on first frame so we don't apply a huge delta
    if (lastLogicUpdate === 0) {
      lastLogicUpdate = timestamp;
      lastRenderUpdate = timestamp;
      gameLoopRef = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastLogicUpdate;

    // Logic updates at ~10 FPS (every 100ms)
    if (timestamp - lastLogicUpdate >= 100) {
      processJobSites(deltaTime, timestamp, game, lastRefinementCycle);
      processJoblessSquirrels(timestamp, game, lastJoblessAttempt);

      incrementTick();
      updateTimer(deltaTime);
      updateTimestamp();

      lastLogicUpdate = timestamp;
    }

    // Render cadence bookkeeping (~60 FPS); Solid handles DOM reactively
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
    // Unbuilt sites produce nothing
    if (jobSite.level < 1) return;

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
    // Skip if unbuilt, no workers, or no consume/produce defined
    if (
      jobSite.level < 1 ||
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
 * Start the game loop; returns a cleanup function for onCleanup().
 */
export function createGameLoop() {
  return startGameLoop();
}
