/**
 * SolidJS Hooks for Game Logic
 * Replaces React hooks with Solid equivalents using the engine store.
 */

import { createEffect, createSignal, onCleanup, createMemo } from "solid-js";
import {
  appState,
  addNuts,
  spendNuts,
  spendResource,
  researchIdea,
  updateIdeaVisibility,
  completeCheckpoint,
  queueStories,
  addLog,
  loadSaveData,
} from "./state";
import { createGameLoop } from "./gameLoop";
import { processEffects } from "./effectProcessor";
import { saveGame, loadGame } from "./saveSystem";
import type { GameState } from "../types/game";
import type { Idea } from "../types/ideas";
import type {
  StoryCheckpoint,
  CheckpointCondition,
} from "../types/story";

// ============================================================================
// useGameLoop
// ============================================================================

/**
 * Starts the two-tiered game loop. Cleanup is registered via onCleanup.
 */
export function useSolidGameLoop() {
  const cleanup = createGameLoop();
  onCleanup(cleanup);
}

// ============================================================================
// useAutoSave
// ============================================================================

export function useSolidAutoSave() {
  // Load once on mount
  createEffect(() => {
    const savedData = loadGame();
    if (savedData) {
      loadSaveData(savedData);
    }
  });

  createEffect(() => {
    const autoSaveEnabled =
      localStorage.getItem("debug_autosave_enabled") !== "false";

    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      saveGame();
      console.log("Auto-saved game state");
    }, 30000);

    const handleBeforeUnload = () => {
      if (localStorage.getItem("debug_autosave_enabled") !== "false") {
        saveGame();
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
// useStoryCheckpoints
// ============================================================================

function checkCondition(condition: CheckpointCondition): boolean {
  const game = appState.game;
  const story = appState.story;
  const ideas = appState.ideas;
  const { type, value, operator = ">=" } = condition;
  let currentValue: number | string = 0;

  switch (type) {
    case "nuts_collected":
      currentValue = game.nutsTotal;
      break;
    case "time_elapsed":
      currentValue = game.timer.m * 60000 + game.timer.s * 1000 + game.timer.ms;
      break;
    case "squirrels_count":
      currentValue = Object.keys(game.squirrels).length;
      break;
    case "jobsites_purchased": {
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

  if (typeof value === "string" && typeof currentValue === "string") {
    return operator === "==" ? currentValue === value : false;
  }

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

function shouldTriggerCheckpoint(checkpoint: StoryCheckpoint): boolean {
  if (checkpoint.completed && checkpoint.oneTime) {
    return false;
  }

  if (checkpoint.requirements) {
    const allRequirementsMet = checkpoint.requirements.every((req) =>
      checkCondition(req),
    );
    if (!allRequirementsMet) {
      return false;
    }
  }

  if (checkpoint.triggers) {
    return checkpoint.triggers.some((trigger) => checkCondition(trigger));
  }

  return false;
}

function processCheckpoints() {
  const checkpointsToCheck = Object.values(appState.story.checkpoints)
    .filter((cp) => !cp.completed || cp.repeatable)
    .sort((a, b) => b.priority - a.priority);

  const triggeredCheckpoints: StoryCheckpoint[] = [];

  for (const checkpoint of checkpointsToCheck) {
    if (shouldTriggerCheckpoint(checkpoint)) {
      triggeredCheckpoints.push(checkpoint);
    }
  }

  if (triggeredCheckpoints.length === 0) return;

  const checkpointIds: string[] = [];

  for (const checkpoint of triggeredCheckpoints) {
    addLog(`Story checkpoint: ${checkpoint.name}`, "success");
    completeCheckpoint(checkpoint.id);
    processEffects(checkpoint.effects, {
      sourceName: checkpoint.name,
      sourceType: "checkpoint",
      checkpointId: checkpoint.id,
    });

    if (checkpoint.effects.showStory && checkpoint.story) {
      checkpointIds.push(checkpoint.id);
    }
  }

  if (checkpointIds.length > 0) {
    queueStories(checkpointIds);
  }
}

export function useSolidStoryCheckpoints() {
  createEffect(() => {
    const interval = setInterval(() => {
      processCheckpoints();
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    // Track values that commonly trigger checkpoints
    void appState.game.nutsTotal;
    void Object.keys(appState.game.squirrels).length;
    void appState.game.resources?.nutwood;
    void appState.story.currentEra;
    processCheckpoints();
  });
}

// ============================================================================
// useIdeas
// ============================================================================

export function useSolidIdeas() {
  createEffect(() => {
    updateIdeaVisibility({
      nutsCollected: appState.game.nutsTotal,
      squirrelsCount: Object.keys(appState.game.squirrels).length,
      currentEra: appState.story.currentEra || "WOOD_AGE",
    });
  });

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

  const research = (ideaId: string) => {
    const idea = appState.ideas.ideas[ideaId];
    if (!idea || idea.researched || !canAfford(idea)) return;

    const nutCost = idea.cost.nuts || 0;
    const woodCost = idea.cost.nutwood || 0;
    const stoneCost = idea.cost.stone || 0;
    const bronzeCost = idea.cost.bronze || 0;
    if (nutCost > 0) spendNuts(nutCost);
    if (woodCost > 0) spendResource("nutwood", woodCost);
    if (stoneCost > 0) spendResource("stone", stoneCost);
    if (bronzeCost > 0) spendResource("bronze", bronzeCost);

    researchIdea(ideaId);
    addLog(`Researched: ${idea.name}`, "success");

    processEffects(idea.effects, {
      sourceName: idea.name,
      sourceType: "idea",
      suppressLogs: true,
    });
  };

  const visibleIdeas = createMemo(() =>
    Object.values(appState.ideas.ideas).filter((idea) => idea.visible),
  );

  const researchedIdeas = createMemo(() =>
    Object.values(appState.ideas.ideas).filter((idea) => idea.researched),
  );

  const affordableIdeas = createMemo(() =>
    visibleIdeas().filter((idea) => !idea.researched && canAfford(idea)),
  );

  return {
    ideas: () => Object.values(appState.ideas.ideas),
    visibleIdeas,
    researchedIdeas,
    affordableIdeas,
    researchedCount: () => appState.ideas.researchedCount,
    canAfford,
    research,
  };
}

// ============================================================================
// useGoldenNut
// ============================================================================

const joblessNutsPerSecond = (jobless: GameState["jobSites"]["jobless"]) => {
  const attemptsPerSec = 1000 / jobless.time;
  return attemptsPerSec * jobless.chance * jobless.value * jobless.multi;
};

export const calculateGoldenNutReward = (
  joblessSite: GameState["jobSites"]["jobless"],
  joblessCount: number,
): number => {
  const perSquirrel = joblessNutsPerSecond(joblessSite);
  const burst = perSquirrel * Math.max(1, joblessCount) * 15;
  const countBonus = 1 + Math.log2(1 + Math.max(0, joblessCount - 1)) * 0.15;
  return Math.max(5, Math.round(burst * countBonus));
};

export interface GoldenNutState {
  id: number;
  x: number;
  y: number;
  reward: number;
  spawnedAt: number;
  expiresAt: number;
  durationMs: number;
}

const MIN_SPAWN_DELAY_MS = 20_000;
const MAX_SPAWN_DELAY_MS = 45_000;
const FIRST_SPAWN_MIN_MS = 8_000;
const FIRST_SPAWN_MAX_MS = 15_000;
const LIFETIME_MS = 13_000;
const FADE_MS = 2_000;
const MARGIN_PERCENT = 8;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const randomPosition = () => ({
  x: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
  y: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
});

export function useSolidGoldenNut() {
  const [goldenNut, setGoldenNut] = createSignal<GoldenNutState | null>(null);
  const nextSpawnAtRef = {
    current: Date.now() + randomBetween(FIRST_SPAWN_MIN_MS, FIRST_SPAWN_MAX_MS),
  };
  const idRef = { current: 0 };
  const pauseStartedAtRef = { current: null as number | null };

  const hasJobless = createMemo(
    () => appState.game.population.jobless.length > 0,
  );

  const scheduleNextSpawn = (fromTime: number = Date.now()) => {
    nextSpawnAtRef.current =
      fromTime + randomBetween(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
  };

  const spawnGoldenNut = () => {
    const joblessIds = appState.game.population.jobless;
    if (joblessIds.length === 0) return;

    const now = Date.now();
    const { x, y } = randomPosition();
    const reward = calculateGoldenNutReward(
      appState.game.jobSites.jobless,
      joblessIds.length,
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
    addLog(
      `Lucky find! Grabbed a glowing nut for ${gn.reward} nuts.`,
      "success",
    );
    clearGoldenNut();
  };

  createEffect(() => {
    if (!hasJobless() && goldenNut()) {
      setGoldenNut(null);
      scheduleNextSpawn();
    }
  });

  createEffect(() => {
    const isPaused = appState.game.isPaused;

    const tick = () => {
      if (appState.game.isPaused) return;

      const now = Date.now();
      const gn = goldenNut();

      if (gn && now >= gn.expiresAt) {
        setGoldenNut(null);
        scheduleNextSpawn(now);
        return;
      }

      if (
        !gn &&
        appState.game.population.jobless.length > 0 &&
        now >= nextSpawnAtRef.current
      ) {
        spawnGoldenNut();
      }
    };

    void isPaused;
    const interval = window.setInterval(tick, 250);
    onCleanup(() => window.clearInterval(interval));
  });

  createEffect(() => {
    const isPaused = appState.game.isPaused;

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
