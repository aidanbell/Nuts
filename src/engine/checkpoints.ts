/**
 * Story checkpoint processing — clock-driven, no Solid effects.
 */

import type { StoryCheckpoint, CheckpointCondition } from "../types/story";
import { STORY_MODAL_HIBERNATION_LIMIT } from "../types/meta";
import {
  appState,
  completeCheckpoint,
  queueStories,
  addLog,
  markWinterIncoming,
} from "./state";
import { processEffects, type GameEffect } from "./effectProcessor";
import type { Clock } from "./platform";

export function checkCondition(condition: CheckpointCondition): boolean {
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
      currentValue = appState.meta.hibernations;
      break;
    case "jobsite_level": {
      const id = condition.jobsiteId || "gatherer";
      const site = game.jobSites.production[id] || game.jobSites.refinement[id];
      currentValue = site?.level ?? 0;
      break;
    }
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
    case "wooden_houses":
      currentValue = game.town?.woodenHouses ?? 0;
      break;
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

function seasonAllowsCheckpoint(checkpoint: StoryCheckpoint): boolean {
  const season = appState.meta.seasonIndex;
  if (checkpoint.minSeason !== undefined && season < checkpoint.minSeason) {
    return false;
  }
  if (checkpoint.maxSeason !== undefined && season > checkpoint.maxSeason) {
    return false;
  }
  return true;
}

function shouldTriggerCheckpoint(checkpoint: StoryCheckpoint): boolean {
  if (checkpoint.completed && checkpoint.oneTime) {
    return false;
  }

  if (!seasonAllowsCheckpoint(checkpoint)) {
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

function shouldUseStoryModal(): boolean {
  return appState.meta.hibernations < STORY_MODAL_HIBERNATION_LIMIT;
}

function presentCheckpointStory(checkpoint: StoryCheckpoint): boolean {
  if (!checkpoint.effects.showStory || !checkpoint.story) return false;

  if (shouldUseStoryModal()) {
    return true;
  }

  const { title, body } = checkpoint.story;
  addLog(`📖 ${title} — ${body}`, "info");
  return false;
}

function effectsForSeason(effects: GameEffect): GameEffect {
  if (appState.meta.hibernations >= 1 && effects.nutReward) {
    const { nutReward: _nutReward, ...rest } = effects;
    return rest;
  }
  return effects;
}

export function processCheckpoints(): void {
  if (Date.now() < appState.meta.suppressCheckpointsUntil) {
    return;
  }

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
  const useModal = shouldUseStoryModal();

  for (const checkpoint of triggeredCheckpoints) {
    addLog(`Story checkpoint: ${checkpoint.name}`, "success");
    completeCheckpoint(checkpoint.id);

    const effects = effectsForSeason(checkpoint.effects);
    const effectsToApply: GameEffect = {
      ...effects,
      pauseGame: Boolean(effects.pauseGame && useModal && effects.showStory),
    };

    processEffects(effectsToApply, {
      sourceName: checkpoint.name,
      sourceType: "checkpoint",
      checkpointId: checkpoint.id,
    });

    if (
      checkpoint.id === "winterApproaching" ||
      checkpoint.id === "secondWinterApproaching"
    ) {
      markWinterIncoming();
    }

    if (presentCheckpointStory(checkpoint)) {
      checkpointIds.push(checkpoint.id);
    }
  }

  if (checkpointIds.length > 0) {
    queueStories(checkpointIds);
  }
}

export function startCheckpoints(clock: Clock): () => void {
  return clock.every(1000, processCheckpoints);
}
