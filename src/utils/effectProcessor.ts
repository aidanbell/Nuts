import type { Dispatch } from "@reduxjs/toolkit";
import {
  createSquirrel,
  pauseGame,
  unlockTabs,
  addNuts,
  unlockJobsites,
} from "../store/gameSlice";
import { addLog } from "../store/gameLogSlice";
import { showStory, setEra } from "../store/storySlice";

/**
 * Unified effect structure that can be used by both story checkpoints and ideas
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
  sourceName?: string; // Name of the source (idea name, checkpoint name, etc.)
  sourceType?: "idea" | "checkpoint" | "other";
  checkpointId?: string; // For story checkpoints that need to show story
  suppressLogs?: boolean; // Whether to suppress automatic log messages
}

/**
 * Centralized effect processor for game effects
 * Can be used by both story checkpoints and ideas systems
 *
 * @param effects - The effects to apply
 * @param dispatch - Redux dispatch function
 * @param options - Additional options for processing
 */
export const processEffects = (
  effects: GameEffect,
  dispatch: Dispatch,
  options: EffectProcessorOptions = {},
): void => {
  const { sourceName, checkpointId, suppressLogs = false } = options;

  // Unlock squirrels
  if (effects.unlockSquirrels) {
    for (let i = 0; i < effects.unlockSquirrels; i++) {
      dispatch(createSquirrel());
    }
    if (!suppressLogs && sourceName) {
      dispatch(
        addLog({
          message: `🐿️ ${effects.unlockSquirrels} squirrel(s) joined! (${sourceName})`,
          level: "success",
        }),
      );
    }
  }

  // Unlock jobsites
  if (effects.unlockJobsites && effects.unlockJobsites.length > 0) {
    dispatch(unlockJobsites(effects.unlockJobsites));
    if (!suppressLogs) {
      dispatch(
        addLog({
          message: `🏭 Unlocked jobsites: ${effects.unlockJobsites.join(", ")}`,
          level: "success",
        }),
      );
    }
  }

  // Unlock buildings
  if (effects.unlockBuildings && effects.unlockBuildings.length > 0) {
    // TODO: Implement building unlocking when building system is complete
    if (!suppressLogs) {
      dispatch(
        addLog({
          message: `🏗️ Unlocked buildings: ${effects.unlockBuildings.join(", ")}`,
          level: "info",
        }),
      );
    }
  }

  // Unlock tabs
  if (effects.unlockTabs && effects.unlockTabs.length > 0) {
    dispatch(unlockTabs(effects.unlockTabs));
    if (!suppressLogs) {
      dispatch(
        addLog({
          message: `📂 Unlocked tabs: ${effects.unlockTabs.join(", ")}`,
          level: "info",
        }),
      );
    }
  }

  // Award nut reward
  if (effects.nutReward) {
    dispatch(addNuts(effects.nutReward));
    if (!suppressLogs) {
      dispatch(
        addLog({
          message: `+${effects.nutReward} nuts${sourceName ? ` (${sourceName})` : ""}`,
          level: "success",
        }),
      );
    }
  }

  // Unlock feature (tab)
  if (effects.unlockFeature) {
    dispatch(unlockTabs([effects.unlockFeature]));
    if (!suppressLogs) {
      dispatch(
        addLog({
          message: `📂 Unlocked: ${effects.unlockFeature}`,
          level: "info",
        }),
      );
    }
  }

  // Set era
  if (effects.setEra) {
    dispatch(setEra(effects.setEra));
    if (!suppressLogs) {
      dispatch(
        addLog({
          message: `🌟 Entered ${effects.setEra}!`,
          level: "success",
        }),
      );
    }
  }

  // Pause game if needed
  if (effects.pauseGame) {
    dispatch(pauseGame());
  }

  // Show story modal if configured (for checkpoints)
  if (effects.showStory && checkpointId) {
    dispatch(showStory(checkpointId));
  }
};

/**
 * Helper to log effect application for debugging
 */
export const logEffects = (effects: GameEffect, source: string): void => {
  const appliedEffects = Object.entries(effects)
    .filter(([_, value]) => value !== undefined && value !== null)
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
