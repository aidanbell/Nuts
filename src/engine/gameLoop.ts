/**
 * Game loop — logic at ~10 Hz via an injected Clock.
 *
 * Drives production jobsites, refinement cycles, and jobless foraging.
 */

import { appState, runTransaction } from "./runtime";
import {
  incrementTick,
  updateTimer,
  updateTimestamp,
  squirrelFoundNut,
  addNuts,
  addResource,
  spendNuts,
  spendResource,
  tryBonfireAttraction,
} from "./state";
import type { GameState } from "../types/game";
import { getBonfireStats } from "../data/town";
import type { Clock } from "./platform";

export const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * Start the game loop.
 *
 * Processes:
 * 1. Production jobsites
 * 2. Refinement jobsites
 * 3. Jobless squirrels
 * 4. Tick / timer / timestamp
 *
 * @returns Cleanup function to stop the loop
 */
export function startGameLoop(clock: Clock) {
  let lastLogicUpdate = 0;
  let stopped = false;
  let cancelFrame: (() => void) | null = null;

  const lastRefinementCycle = new Map<string, Map<number, number>>();
  const lastJoblessAttempt = new Map<number, number>();
  let lastBonfireCheck = 0;

  const gameLoop = (timestamp: number) => {
    if (stopped) return;

    const game = appState.game;

    if (game.isPaused) {
      lastLogicUpdate = timestamp;
      cancelFrame = clock.nextFrame(gameLoop);
      return;
    }

    if (lastLogicUpdate === 0) {
      lastLogicUpdate = timestamp;
      lastBonfireCheck = timestamp;
      cancelFrame = clock.nextFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastLogicUpdate;

    if (timestamp - lastLogicUpdate >= 100) {
      runTransaction(() => {
        processJobSites(deltaTime, timestamp, game, lastRefinementCycle);
        processJoblessSquirrels(timestamp, game, lastJoblessAttempt);
        lastBonfireCheck = processBonfire(timestamp, game, lastBonfireCheck);

        incrementTick();
        updateTimer(deltaTime);
        updateTimestamp();
      });

      lastLogicUpdate = timestamp;
    }

    cancelFrame = clock.nextFrame(gameLoop);
  };

  cancelFrame = clock.nextFrame(gameLoop);

  return () => {
    stopped = true;
    cancelFrame?.();
  };
}

function processJobSites(
  deltaTime: number,
  currentTime: number,
  game: GameState,
  lastRefinementCycle: Map<string, Map<number, number>>,
) {
  const { production: productionJobsites, refinement: refinementJobsites } =
    game.jobSites;
  let totalNuts = 0;

  Object.values(productionJobsites).forEach((jobSite) => {
    if (jobSite.level < 1) return;

    const goldMulti = appState.meta.goldForageMulti;
    const baseRate = jobSite.baseProduction * jobSite.multi * goldMulti;
    const squirrelRate =
      jobSite.squirrelBonus *
      jobSite.multi *
      jobSite.workers.length *
      goldMulti;
    const totalRate = baseRate + squirrelRate;
    const totalProduction = (totalRate * deltaTime * game.gameSpeed) / 1000;

    if (totalProduction > 0) {
      totalNuts += totalProduction;
    }
  });

  Object.values(refinementJobsites).forEach((jobSite) => {
    if (
      jobSite.level < 1 ||
      jobSite.workers.length === 0 ||
      !jobSite.consumes ||
      !jobSite.produces
    )
      return;

    if (!lastRefinementCycle.has(jobSite.id)) {
      lastRefinementCycle.set(jobSite.id, new Map());
    }

    const siteCycles = lastRefinementCycle.get(jobSite.id)!;
    const { resource: consumeType, amount: consumeAmount } = jobSite.consumes;
    const { resource: produceType, amount: produceAmount } = jobSite.produces;

    jobSite.workers.forEach((workerId) => {
      const lastCycle = siteCycles.get(workerId) ?? 0;

      if (currentTime - lastCycle >= jobSite.time) {
        const availableResource =
          consumeType === "nuts"
            ? game.nutsTotal
            : game.resources[consumeType as keyof typeof game.resources];

        if (availableResource >= consumeAmount) {
          if (consumeType === "nuts") {
            spendNuts(consumeAmount);
          } else {
            spendResource(
              consumeType as keyof typeof game.resources,
              consumeAmount,
            );
          }

          addResource(produceType, produceAmount);
          siteCycles.set(workerId, currentTime);
        }
      }
    });
  });

  if (totalNuts > 0) {
    addNuts(totalNuts);
  }
}

function processBonfire(
  currentTime: number,
  game: GameState,
  lastBonfireCheck: number,
): number {
  const stats = getBonfireStats(game.town?.bonfireLevel ?? 0);
  if (!stats) return lastBonfireCheck;

  if (currentTime - lastBonfireCheck < stats.checkIntervalMs) {
    return lastBonfireCheck;
  }

  tryBonfireAttraction();
  return currentTime;
}

function processJoblessSquirrels(
  currentTime: number,
  game: GameState,
  lastJoblessAttempt: Map<number, number>,
) {
  const { time, chance: foragingChance } = game.jobSites.jobless;

  game.population.jobless.forEach((squirrelId) => {
    const lastAttempt = lastJoblessAttempt.get(squirrelId) ?? 0;
    if (currentTime - lastAttempt >= time) {
      if (chance(foragingChance)) {
        squirrelFoundNut(squirrelId);
      }
      lastJoblessAttempt.set(squirrelId, currentTime);
    }
  });
}
