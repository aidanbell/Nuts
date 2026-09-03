/**
 * Idea affordability and research (cost + effects). Lives outside state.ts
 * so actions do not import the effect processor (circular).
 */

import type { Idea } from "../types/ideas";
import {
  appState,
  canEnterEra,
  refreshIdeaCatalog,
  researchIdea,
  spendNuts,
  spendResource,
  addLog,
} from "./state";
import { processEffects } from "./effectProcessor";

export function meetsIdeaRequirements(idea: Idea): boolean {
  const reqs = idea.requirements;
  if (!reqs) return true;

  const game = appState.game;

  if (reqs.era && reqs.era !== (appState.story.currentEra || "PREHISTORY")) {
    return false;
  }
  if (reqs.maxEraAvailable && !canEnterEra(reqs.maxEraAvailable)) {
    return false;
  }
  if (reqs.nutsCollected && game.nutsTotal < reqs.nutsCollected) {
    return false;
  }
  if (
    reqs.squirrelsCount &&
    Object.keys(game.squirrels).length < reqs.squirrelsCount
  ) {
    return false;
  }
  if (reqs.jobsitesPurchased) {
    const levels =
      Object.values(game.jobSites.production).reduce((t, s) => t + s.level, 0) +
      Object.values(game.jobSites.refinement).reduce((t, s) => t + s.level, 0);
    if (levels < reqs.jobsitesPurchased) return false;
  }
  if (reqs.ideasResearched) {
    if (
      !reqs.ideasResearched.every((id) => appState.ideas.ideas[id]?.researched)
    ) {
      return false;
    }
  }
  return true;
}

export function canAffordIdea(idea: Idea): boolean {
  if (idea.researched) return false;
  if (!meetsIdeaRequirements(idea)) return false;

  const game = appState.game;
  const nutCost = idea.cost.nuts || 0;
  const woodCost = idea.cost.nutwood || 0;
  const stoneCost = idea.cost.stone || 0;
  const bronzeCost = idea.cost.bronze || 0;
  const resinCost = idea.cost.researchResin || 0;
  return (
    game.nutsTotal >= nutCost &&
    game.resources.nutwood >= woodCost &&
    game.resources.stone >= stoneCost &&
    game.resources.bronze >= bronzeCost &&
    game.resources.researchResin >= resinCost
  );
}

export function tryResearch(ideaId: string): boolean {
  const idea = appState.ideas.ideas[ideaId];
  if (!idea || idea.researched || !canAffordIdea(idea)) return false;

  const nutCost = idea.cost.nuts || 0;
  const woodCost = idea.cost.nutwood || 0;
  const stoneCost = idea.cost.stone || 0;
  const bronzeCost = idea.cost.bronze || 0;
  const resinCost = idea.cost.researchResin || 0;
  if (nutCost > 0) spendNuts(nutCost);
  if (woodCost > 0) spendResource("nutwood", woodCost);
  if (stoneCost > 0) spendResource("stone", stoneCost);
  if (bronzeCost > 0) spendResource("bronze", bronzeCost);
  if (resinCost > 0) spendResource("researchResin", resinCost);

  researchIdea(ideaId);
  addLog(`Researched: ${idea.name}`, "success");

  processEffects(idea.effects, {
    sourceName: idea.name,
    sourceType: "idea",
    suppressLogs: true,
  });

  refreshIdeaCatalog();
  return true;
}
