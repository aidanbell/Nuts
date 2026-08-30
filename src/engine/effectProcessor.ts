/**
 * SolidJS Effect Processor
 * Centralized effect processing for game effects from ideas and checkpoints.
 */

import {
  createSquirrel,
  pauseGame,
  unlockTabs,
  unlockTownBuildings,
  addNuts,
  unlockJobsites,
  setEra,
  addLog,
} from "./state";

/**
 * Unified effect structure used by story checkpoints and ideas.
 */
export interface GameEffect {
  unlockSquirrels?: number;
  unlockJobsites?: string[];
  unlockBuildings?: string[];
  unlockTabs?: string[];
  nutReward?: number;
  pauseGame?: boolean;
  showStory?: boolean;
  setEra?: string;
  upgradeJobsite?: {
    jobsiteId: string;
    property: string;
    amount: number;
  };
  globalEfficiency?: number;
  increaseGatherMulti?: number;
  reduceJobsiteCost?: number;
  unlockFeature?: string;
  increaseGetButton?: number;
  unlockSquirrelCapacity?: number;
  unlockRefinement?: string[];
}

export interface EffectProcessorOptions {
  sourceName?: string;
  sourceType?: "idea" | "checkpoint" | "other";
  checkpointId?: string;
  suppressLogs?: boolean;
}

/**
 * Apply game effects directly against the Solid store.
 */
export const processEffects = (
  effects: GameEffect,
  options: EffectProcessorOptions = {},
): void => {
  const { sourceName, suppressLogs = false } = options;

  if (effects.unlockSquirrels) {
    let joined = 0;
    for (let i = 0; i < effects.unlockSquirrels; i++) {
      if (createSquirrel()) joined += 1;
    }
    if (!suppressLogs && sourceName && joined > 0) {
      addLog(`🐿️ ${joined} squirrel(s) joined! (${sourceName})`, "success");
    }
  }

  if (effects.unlockJobsites && effects.unlockJobsites.length > 0) {
    unlockJobsites(effects.unlockJobsites);
    if (!suppressLogs) {
      addLog(
        `🏗️ Unlocked jobsites: ${effects.unlockJobsites.join(", ")}`,
        "success",
      );
    }
  }

  if (effects.unlockBuildings && effects.unlockBuildings.length > 0) {
    unlockTownBuildings(effects.unlockBuildings);
    if (!suppressLogs) {
      addLog(
        `🏭 Unlocked buildings: ${effects.unlockBuildings.join(", ")}`,
        "success",
      );
    }
  }

  if (effects.unlockTabs && effects.unlockTabs.length > 0) {
    unlockTabs(effects.unlockTabs);
    if (!suppressLogs) {
      addLog(`📊 Unlocked tabs: ${effects.unlockTabs.join(", ")}`, "info");
    }
  }

  if (effects.nutReward) {
    addNuts(effects.nutReward);
    if (!suppressLogs) {
      addLog(
        `+${effects.nutReward} nuts${sourceName ? ` (${sourceName})` : ""}`,
        "success",
      );
    }
  }

  if (effects.unlockRefinement && effects.unlockRefinement.length > 0) {
    unlockJobsites(effects.unlockRefinement);
    unlockTabs(["refinement"]);
    if (!suppressLogs) {
      addLog(
        `🪵 Unlocked refinement: ${effects.unlockRefinement.join(", ")}`,
        "success",
      );
    }
  }

  if (effects.unlockFeature) {
    unlockTabs([effects.unlockFeature]);
    if (!suppressLogs) {
      addLog(`📊 Unlocked: ${effects.unlockFeature}`, "info");
    }
  }

  if (effects.setEra) {
    setEra(effects.setEra);
    if (!suppressLogs) {
      addLog(`🌍 Entered ${effects.setEra}!`, "success");
    }
  }

  if (effects.pauseGame) {
    pauseGame();
  }

  // Stories are queued by createStoryCheckpoints via queueStories —
  // do not set activeStory here or multi-checkpoint batches overwrite each other.
};

export const logEffects = (effects: GameEffect, source: string): void => {
  const appliedEffects = Object.entries(effects)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.join(", ")}]`;
      }
      return `${key}: ${value}`;
    });

  if (appliedEffects.length > 0) {
    console.log(`[Effects] Applied from ${source}:`, appliedEffects.join(", "));
  }
};
