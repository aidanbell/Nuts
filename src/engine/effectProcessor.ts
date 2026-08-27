/**
 * SolidJS Effect Processor
 * Centralized effect processing for game effects from ideas and checkpoints
 *
 * This replaces the React effectProcessor with a SolidJS-compatible version
 * that works directly with the SolidJS store.
 */

import {
  createSquirrel,
  pauseGame,
  unlockTabs,
  addNuts,
  unlockJobsites,
  showStory,
  setEra,
  addLog,
} from "./state";
import type {
  GameEffect,
  EffectProcessorOptions,
} from "../utils/effectProcessor";

/**
 * Unified effect structure that can be used by both story checkpoints and ideas
 * This is imported from the utils for compatibility
 */
export type { GameEffect, EffectProcessorOptions };

/**
 * Centralized effect processor for game effects
 * Can be used by both story checkpoints and ideas systems
 *
 * Unlike the React version which required dispatch, this version calls
 * the SolidJS store actions directly.
 *
 * @param effects - The effects to apply
 * @param options - Additional options for processing
 */
export const processEffects = (
  effects: GameEffect,
  options: EffectProcessorOptions = {},
): void => {
  const { sourceName, checkpointId, suppressLogs = false } = options;

  // Unlock squirrels
  if (effects.unlockSquirrels) {
    for (let i = 0; i < effects.unlockSquirrels; i++) {
      createSquirrel();
    }
    if (!suppressLogs && sourceName) {
      addLog({
        message: `🐿️ ${effects.unlockSquirrels} squirrel(s) joined! (${sourceName})`,
        level: "success",
      });
    }
  }

  // Unlock jobsites
  if (effects.unlockJobsites && effects.unlockJobsites.length > 0) {
    unlockJobsites(effects.unlockJobsites);
    if (!suppressLogs) {
      addLog({
        message: `🏗️ Unlocked jobsites: ${effects.unlockJobsites.join(", ")}`,
        level: "success",
      });
    }
  }

  // Unlock buildings
  if (effects.unlockBuildings && effects.unlockBuildings.length > 0) {
    // TODO: Implement building unlocking when building system is complete
    if (!suppressLogs) {
      addLog({
        message: `🏭 Unlocked buildings: ${effects.unlockBuildings.join(", ")}`,
        level: "info",
      });
    }
  }

  // Unlock tabs
  if (effects.unlockTabs && effects.unlockTabs.length > 0) {
    unlockTabs(effects.unlockTabs);
    if (!suppressLogs) {
      addLog({
        message: `📊 Unlocked tabs: ${effects.unlockTabs.join(", ")}`,
        level: "info",
      });
    }
  }

  // Award nut reward
  if (effects.nutReward) {
    addNuts(effects.nutReward);
    if (!suppressLogs) {
      addLog({
        message: `+${effects.nutReward} nuts${sourceName ? ` (${sourceName})` : ""}`,
        level: "success",
      });
    }
  }

  // Unlock feature (tab)
  if (effects.unlockFeature) {
    unlockTabs([effects.unlockFeature]);
    if (!suppressLogs) {
      addLog({
        message: `📊 Unlocked: ${effects.unlockFeature}`,
        level: "info",
      });
    }
  }

  // Set era
  if (effects.setEra) {
    setEra(effects.setEra);
    if (!suppressLogs) {
      addLog({
        message: `🌍 Entered ${effects.setEra}!`,
        level: "success",
      });
    }
  }

  // Pause game if needed
  if (effects.pauseGame) {
    pauseGame();
  }

  // Show story modal if configured (for checkpoints)
  if (effects.showStory && checkpointId) {
    showStory(checkpointId);
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
