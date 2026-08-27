/**
 * Global game store — single source of truth for all game state.
 */

import { createStore, type SetStoreFunction } from "solid-js/store";
import type {
  GameState,
  JobSite,
  JoblessJobSite,
  Population,
  Squirrel,
} from "../types/game";
import type { IdeasState } from "../types/ideas";
import type { StoryState } from "../types/story";
import type { GameLogState } from "../types/gameLog";
import { ideas } from "../data/ideas";
import { storyCheckpoints } from "../data/storyCheckpoints";
import { productionJobsites, refinementJobsites } from "../data/jobsites";

// ============================================================================
// Initial State
// ============================================================================

const initialGameState: GameState = {
  // Core resources
  nutsTotal: 0,
  nutsAllTime: 0,
  goldNuts: {
    total: 0,
    multi: 0.12,
  },

  // Refined resources
  resources: {
    nutwood: 0,
    stone: 0,
    bronze: 0,
    iron: 0,
  },

  // Population and jobs
  squirrels: {
    0: {
      _id: 0,
      employed: false,
      jobSite: null,
      total: 0,
    },
  },
  nextSquirrelId: 1,
  population: {
    jobless: [0],
  },

  // JobSites
  jobSites: {
    jobless: {
      time: 1500, // Milliseconds between foraging attempts
      value: 1, // Nuts found per successful forage
      chance: 0.5, // 50% chance
      multi: 1,
      level: 0,
      cost: 0,
      method: "ground",
    },
    production: {},
    refinement: {},
  },

  // Get button
  getButton: {
    value: 1,
    mult: 1,
  },

  // Game settings
  gameSpeed: 1,
  isPaused: false,
  tick: 0,
  lastUpdate: Date.now(),

  // UI state
  activeTab: "home",
  unlockedTabs: ["home"],

  // Timer
  timer: {
    ms: 0,
    s: 0,
    m: 0,
  },
};

const initialIdeasState: IdeasState = {
  ideas: ideas,
  researchedIdeas: [],
  researchedCount: 0,
  totalResearchPoints: 0,
};

const initialStoryState: StoryState = {
  checkpoints: storyCheckpoints,
  activeStory: null,
  storyQueue: [],
  completedCheckpoints: [],
  currentEra: "PREHISTORY",
  storyProgress: 0,
  eraBonuses: {},
  pendingChoice: null,
};

const initialGameLogState: GameLogState = {
  logs: [],
  maxLogs: 50,
};

// ============================================================================
// Combined App State
// ============================================================================

export interface AppState {
  game: GameState;
  ideas: IdeasState;
  story: StoryState;
  gameLog: GameLogState;
}

const initialAppState: AppState = {
  game: initialGameState,
  ideas: initialIdeasState,
  story: initialStoryState,
  gameLog: initialGameLogState,
};

// ============================================================================
// Create SolidJS Store
// ============================================================================

// Create the store with deep merging for nested updates
const [appState, setAppState] = createStore<AppState>(initialAppState);

// Helper to set nested state with type safety
export type SetAppState = SetStoreFunction<AppState>;

// ============================================================================
// Game State Accessors
// ============================================================================

export const gameState = () => appState.game;
export const ideasState = () => appState.ideas;
export const storyState = () => appState.story;
export const gameLogState = () => appState.gameLog;

// ============================================================================
// Actions
// ============================================================================

// Core resource actions
export const addNuts = (amount: number) => {
  setAppState("game", "nutsTotal", (prev) => prev + amount);
  setAppState("game", "nutsAllTime", (prev) => prev + amount);
};

export const spendNuts = (amount: number) => {
  setAppState("game", "nutsTotal", (prev) => prev - amount);
};

// Resource actions
export const addResource = (
  resource: keyof GameState["resources"],
  amount: number,
) => {
  setAppState("game", "resources", resource, (prev) => prev + amount);
};

export const spendResource = (
  resource: keyof GameState["resources"],
  amount: number,
) => {
  setAppState("game", "resources", resource, (prev) => prev - amount);
};

// Squirrel actions
export const createSquirrel = () => {
  const game = appState.game;
  const id = game.nextSquirrelId;

  setAppState("game", "squirrels", id, {
    _id: id,
    employed: false,
    jobSite: null,
    total: 0,
  });
  setAppState("game", "population", "jobless", (prev) => [...prev, id]);
  setAppState("game", "nextSquirrelId", id + 1);
};

export const squirrelFoundNut = (squirrelId: number) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite = game.jobSites.jobless;

  if (squirrel && jobSite) {
    const amount = Math.max(0, jobSite.value * jobSite.multi);
    setAppState(
      "game",
      "squirrels",
      squirrelId,
      "total",
      (prev) => prev + amount,
    );
    addNuts(amount);
  }
};

// JobSite actions
export const unlockJobsites = (jobsiteIds: string[]) => {
  const game = appState.game;

  // Unlock jobsites tab if not already unlocked
  if (!game.unlockedTabs.includes("jobsites")) {
    setAppState("game", "unlockedTabs", (prev) => [...prev, "jobsites"]);
  }

  jobsiteIds.forEach((id) => {
    // Find the jobsite in the master list
    const jobsiteTemplate =
      productionJobsites.find((js) => js.id === id) ||
      refinementJobsites.find((js) => js.id === id);

    if (jobsiteTemplate) {
      // Create a new jobsite instance from the template
      const newJobsite: JobSite = {
        ...jobsiteTemplate,
        unlocked: true,
        maxSquirrels: jobsiteTemplate.maxSquirrels,
        workers: [],
        level: 0,
        // Production values
        baseProduction: jobsiteTemplate.baseProduction,
        squirrelBonus: jobsiteTemplate.squirrelBonus,
        // Cost growth properties
        cost: jobsiteTemplate.baseCost,
        costGrowthRate: jobsiteTemplate.costGrowthRate,
        baseCost: jobsiteTemplate.baseCost,
        // Refinement properties (if applicable)
        consumes: jobsiteTemplate.consumes,
        produces: jobsiteTemplate.produces,
      };

      // Add to the appropriate category
      if (newJobsite.type === "production") {
        setAppState("game", "jobSites", "production", id, newJobsite);
      } else if (newJobsite.type === "refinement") {
        setAppState("game", "jobSites", "refinement", id, newJobsite);
      }
    }
  });
};

export const buyJobSiteCapacity = (jobSiteId: string) => {
  const game = appState.game;
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  if (jobSite && game.nutsTotal >= jobSite.cost) {
    spendNuts(jobSite.cost);

    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "level",
      (prev) => prev + 1,
    );

    // Every 5 levels, increase max squirrels by 1
    const newLevel = jobSite.level + 1;
    if (newLevel % 5 === 0) {
      setAppState(
        "game",
        "jobSites",
        jobSite.type,
        jobSiteId,
        "maxSquirrels",
        (prev) => prev + 1,
      );
    }

    // Every level, slightly increase production (5% boost to both base and bonus)
    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "baseProduction",
      (prev) => prev * 1.05,
    );
    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "squirrelBonus",
      (prev) => prev * 1.05,
    );

    // Calculate next cost using exponential growth formula
    const newCost = Math.floor(
      jobSite.baseCost * Math.pow(jobSite.costGrowthRate, newLevel),
    );
    setAppState("game", "jobSites", jobSite.type, jobSiteId, "cost", newCost);
  }
};

export const assignSquirrelToJobSite = (
  squirrelId: number,
  jobSiteId: string,
) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  if (squirrel && jobSite && jobSite.workers.length < jobSite.maxSquirrels) {
    // Remove from jobless
    setAppState("game", "population", "jobless", (prev) =>
      prev.filter((id) => id !== squirrelId),
    );

    // Add to jobsite workers
    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "workers",
      (prev) => [...prev, squirrelId],
    );
    setAppState("game", "squirrels", squirrelId, "employed", true);
    setAppState("game", "squirrels", squirrelId, "jobSite", jobSiteId);

    // Initialize population array for this jobsite if needed
    if (!game.population[jobSiteId]) {
      setAppState("game", "population", jobSiteId, []);
    }
    setAppState("game", "population", jobSiteId, (prev: number[] = []) => [
      ...prev,
      squirrelId,
    ]);
  }
};

export const removeSquirrelFromJobSite = (
  squirrelId: number,
  jobSiteId: string,
) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  if (squirrel && jobSite) {
    // Remove from jobsite workers
    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "workers",
      (prev) => prev.filter((id) => id !== squirrelId),
    );

    // Remove from population
    if (game.population[jobSiteId]) {
      setAppState("game", "population", jobSiteId, (prev) =>
        prev.filter((id) => id !== squirrelId),
      );
    }

    // Add back to jobless
    setAppState("game", "population", "jobless", (prev) => [
      ...prev,
      squirrelId,
    ]);
    setAppState("game", "squirrels", squirrelId, "employed", false);
    setAppState("game", "squirrels", squirrelId, "jobSite", null);
  }
};

// Manual refinement (craft one at a time)
export const craftRefinement = (refinementId: string) => {
  const game = appState.game;
  const refinement = refinementJobsites.find((js) => js.id === refinementId);

  if (!refinement || !refinement.consumes || !refinement.produces) return;

  const { resource: consumeType, amount: consumeAmount } = refinement.consumes;
  const { resource: produceType, amount: produceAmount } = refinement.produces;

  // Check if we have enough resources
  const availableResource =
    consumeType === "nuts"
      ? game.nutsTotal
      : game.resources[consumeType as keyof typeof game.resources];

  if (availableResource >= consumeAmount) {
    // Consume input resource
    if (consumeType === "nuts") {
      spendNuts(consumeAmount);
    } else {
      spendResource(consumeType as keyof typeof game.resources, consumeAmount);
    }

    // Produce output resource
    addResource(produceType, produceAmount);
  }
};

// Batch update for performance
export interface GameUpdate {
  type: "ADD_NUTS" | "UPDATE_SQUIRREL" | "UPDATE_JOBSITE";
  data: {
    amount?: number;
    id?: number | string;
    changes?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export const batchUpdate = (updates: GameUpdate[]) => {
  updates.forEach((update) => {
    switch (update.type) {
      case "ADD_NUTS":
        if (update.data.amount !== undefined) {
          addNuts(update.data.amount);
        }
        break;
      case "UPDATE_SQUIRREL":
        if (update.data.id !== undefined && update.data.changes) {
          setAppState(
            "game",
            "squirrels",
            update.data.id as number,
            (prev) => ({
              ...prev,
              ...update.data.changes,
            }),
          );
        }
        break;
      case "UPDATE_JOBSITE":
        if (update.data.id !== undefined) {
          const js =
            appState.game.jobSites.production[update.data.id as string];
          if (js) {
            setAppState(
              "game",
              "jobSites",
              "production",
              update.data.id as string,
              (prev) => ({ ...prev, ...update.data.changes }),
            );
          }
        }
        break;
    }
  });
};

// Game control actions
export const incrementTick = () => {
  setAppState("game", "tick", (prev) => prev + 1);
};

export const updateTimer = () => {
  setAppState("game", "timer", (prev) => {
    const newMs = prev.ms + 1;
    const newS = newMs >= 100 ? prev.s + 1 : prev.s;
    const newM = newS >= 60 ? prev.m + 1 : prev.m;
    const finalMs = newMs >= 100 ? 0 : newMs;
    const finalS = newS >= 60 ? 0 : newS;
    return { ms: finalMs, s: finalS, m: newM };
  });
};

export const setGameSpeed = (speed: number) => {
  setAppState("game", "gameSpeed", speed);
};

export const pauseGame = () => {
  setAppState("game", "isPaused", true);
};

export const resumeGame = () => {
  setAppState("game", "isPaused", false);
};

export const setActiveTab = (tab: string) => {
  setAppState("game", "activeTab", tab);
};

export const unlockTab = (tab: string) => {
  setAppState("game", "unlockedTabs", (prev) => {
    if (!prev.includes(tab)) {
      return [...prev, tab];
    }
    return prev;
  });
};

export const unlockTabs = (tabs: string[]) => {
  setAppState("game", "unlockedTabs", (prev) => {
    const newTabs = [...prev];
    tabs.forEach((tab) => {
      if (!newTabs.includes(tab)) {
        newTabs.push(tab);
      }
    });
    return newTabs;
  });
};

// Hibernate action
export const hibernate = () => {
  const game = appState.game;
  const goldenNutsEarned = Math.floor(
    (game.nutsAllTime / Math.pow(10, 6)) * game.goldNuts.multi,
  );

  // Update gold nuts
  setAppState("game", "goldNuts", "total", (prev) => prev + goldenNutsEarned);

  // Reset game state
  setAppState("game", (prev) => ({
    ...prev,
    nutsTotal: 0,
    nutsAllTime: 0,
    squirrels: {},
    nextSquirrelId: 1,
    population: { jobless: [] },
    jobSites: initialGameState.jobSites,
    timer: { ms: 0, s: 0, m: 0 },
    tick: 0,
  }));
};

// Update timestamp
export const updateTimestamp = () => {
  setAppState("game", "lastUpdate", Date.now());
};

// Load save data
export const loadSaveData = (data: Partial<GameState>) => {
  setAppState("game", (prev) => ({ ...prev, ...data }));
};

// ============================================================================
// Ideas Actions
// ============================================================================

export const researchIdea = (ideaId: string) => {
  const idea = appState.ideas.ideas[ideaId];

  if (!idea || idea.researched) return;

  setAppState("ideas", "ideas", ideaId, "researched", true);
  setAppState("ideas", "ideas", ideaId, "researchedAt", Date.now());
  setAppState("ideas", "researchedIdeas", (prev) => [...prev, ideaId]);
  setAppState("ideas", "researchedCount", (prev) => prev + 1);

  // Apply research effects that mutate game state
  const effects = idea.effects;

  if (effects.upgradeJobsite) {
    const { jobsiteId, property, amount } = effects.upgradeJobsite;

    if (jobsiteId === "jobless") {
      const jobless = appState.game.jobSites.jobless;
      if (property === "multi") {
        setAppState("game", "jobSites", "jobless", "multi", jobless.multi + amount);
      } else if (property === "value") {
        setAppState("game", "jobSites", "jobless", "value", jobless.value + amount);
      } else if (property === "time") {
        setAppState("game", "jobSites", "jobless", "time", jobless.time - amount);
      } else if (property === "chance") {
        setAppState("game", "jobSites", "jobless", "chance", jobless.chance + amount);
      }
    } else if (appState.game.jobSites.production[jobsiteId]) {
      if (property === "multi") {
        setAppState(
          "game",
          "jobSites",
          "production",
          jobsiteId,
          "multi",
          (prev) => prev + amount,
        );
      }
    } else if (appState.game.jobSites.refinement[jobsiteId]) {
      if (property === "multi") {
        setAppState(
          "game",
          "jobSites",
          "refinement",
          jobsiteId,
          "multi",
          (prev) => prev + amount,
        );
      }
    }
  }

  if (effects.globalEfficiency) {
    const efficiencyBoost = effects.globalEfficiency;
    setAppState(
      "game",
      "jobSites",
      "jobless",
      "multi",
      (prev) => prev + efficiencyBoost,
    );
    Object.keys(appState.game.jobSites.production).forEach((id) => {
      setAppState(
        "game",
        "jobSites",
        "production",
        id,
        "multi",
        (prev) => prev + efficiencyBoost,
      );
    });
    Object.keys(appState.game.jobSites.refinement).forEach((id) => {
      setAppState(
        "game",
        "jobSites",
        "refinement",
        id,
        "multi",
        (prev) => prev + efficiencyBoost,
      );
    });
  }

  if (effects.increaseGatherMulti) {
    setAppState(
      "game",
      "getButton",
      "mult",
      (prev) => prev + effects.increaseGatherMulti!,
    );
  }

  if (effects.increaseGetButton) {
    setAppState(
      "game",
      "getButton",
      "value",
      (prev) => prev + effects.increaseGetButton!,
    );
  }
};

export const showIdea = (ideaId: string) => {
  setAppState("ideas", "ideas", ideaId, "visible", true);
};

export const showIdeas = (ideaIds: string[]) => {
  ideaIds.forEach((ideaId) => {
    setAppState("ideas", "ideas", ideaId, "visible", true);
  });
};

export const updateIdeaVisibility = (params: {
  nutsCollected: number;
  squirrelsCount: number;
  currentEra: string;
}) => {
  const { nutsCollected, squirrelsCount, currentEra } = params;
  const ideasList = appState.ideas.ideas;

  Object.keys(ideasList).forEach((ideaId) => {
    const idea = ideasList[ideaId];
    if (idea.visible || idea.researched) return;

    const reqs = idea.requirements;
    if (!reqs) {
      setAppState("ideas", "ideas", ideaId, "visible", true);
      return;
    }

    let meetsRequirements = true;

    if (reqs.era && reqs.era !== currentEra) {
      meetsRequirements = false;
    }
    if (reqs.nutsCollected && nutsCollected < reqs.nutsCollected) {
      meetsRequirements = false;
    }
    if (reqs.squirrelsCount && squirrelsCount < reqs.squirrelsCount) {
      meetsRequirements = false;
    }
    if (reqs.ideasResearched) {
      const allResearched = reqs.ideasResearched.every(
        (reqId) => appState.ideas.ideas[reqId]?.researched,
      );
      if (!allResearched) {
        meetsRequirements = false;
      }
    }

    if (meetsRequirements) {
      setAppState("ideas", "ideas", ideaId, "visible", true);
    }
  });
};

export const resetIdeas = () => {
  const ideasList = appState.ideas.ideas;
  Object.keys(ideasList).forEach((ideaId) => {
    setAppState("ideas", "ideas", ideaId, "researched", false);
    setAppState("ideas", "ideas", ideaId, "researchedAt", undefined);
    setAppState(
      "ideas",
      "ideas",
      ideaId,
      "visible",
      !ideasList[ideaId].requirements,
    );
  });
  setAppState("ideas", "researchedCount", 0);
};

export const loadIdeasState = (data: Partial<IdeasState>) => {
  setAppState("ideas", (prev) => ({ ...prev, ...data }));
};

// ============================================================================
// Story Actions
// ============================================================================

export const completeCheckpoint = (checkpointId: string) => {
  const story = appState.story;
  const checkpoint = story.checkpoints[checkpointId];

  if (checkpoint && !checkpoint.completed) {
    setAppState("story", "checkpoints", checkpointId, "completed", true);
    setAppState(
      "story",
      "checkpoints",
      checkpointId,
      "completedAt",
      Date.now(),
    );
    setAppState("story", "completedCheckpoints", (prev) => [
      ...prev,
      checkpointId,
    ]);

    // Calculate story progress after this checkpoint is counted
    const totalCheckpoints = Object.keys(story.checkpoints).length;
    const completedCount = story.completedCheckpoints.length + 1;
    const progress = Math.floor((completedCount / totalCheckpoints) * 100);
    setAppState("story", "storyProgress", progress);
  }
};

export const showStory = (checkpointId: string) => {
  setAppState("story", "activeStory", checkpointId);
};

export const dismissStory = () => {
  const story = appState.story;
  setAppState("story", "activeStory", null);

  // Show next story in queue if available
  if (story.storyQueue.length > 0) {
    const nextStoryId = story.storyQueue[0];
    setAppState("story", "storyQueue", (prev) => prev.slice(1));
    if (nextStoryId) {
      setAppState("story", "activeStory", nextStoryId);
    }
  }
};

export const queueStory = (checkpointId: string) => {
  const story = appState.story;

  // Don't queue if already in queue or currently active
  if (
    story.activeStory === checkpointId ||
    story.storyQueue.includes(checkpointId)
  ) {
    return;
  }

  // If no active story, show immediately
  if (!story.activeStory) {
    setAppState("story", "activeStory", checkpointId);
  } else {
    // Otherwise add to queue
    setAppState("story", "storyQueue", (prev) => [...prev, checkpointId]);
  }
};

export const queueStories = (checkpointIds: string[]) => {
  const story = appState.story;

  // Filter out any that are already active or queued
  const newStories = checkpointIds.filter(
    (id) => id !== story.activeStory && !story.storyQueue.includes(id),
  );

  if (newStories.length === 0) return;

  // If no active story, show the first one
  if (!story.activeStory) {
    setAppState("story", "activeStory", newStories[0]);
    // Add the rest to queue
    setAppState("story", "storyQueue", (prev) => [
      ...prev,
      ...newStories.slice(1),
    ]);
  } else {
    // Add all to queue
    setAppState("story", "storyQueue", (prev) => [...prev, ...newStories]);
  }
};

export const setEra = (era: string) => {
  setAppState("story", "currentEra", era);
};

export const setPendingChoice = (checkpointId: string | null) => {
  setAppState("story", "pendingChoice", checkpointId);
};

export const makeChoice = (checkpointId: string, choiceId: string) => {
  const story = appState.story;
  const checkpoint = story.checkpoints[checkpointId];

  if (!checkpoint?.story?.choices) return;

  const choice = checkpoint.story.choices.find((c) => c.id === choiceId);
  if (!choice?.effects) return;

  // Apply choice effects
  if (choice.effects.setEra) {
    setAppState("story", "currentEra", choice.effects.setEra);
  }

  if (choice.effects.grantBonus) {
    const { type, value, target } = choice.effects.grantBonus;
    if (type === "era_multiplier" && target) {
      setAppState(
        "story",
        "eraBonuses",
        target,
        (prev: number = 1) => prev * value,
      );
    }
  }

  // Mark checkpoint as complete
  if (!checkpoint.completed && checkpoint.oneTime) {
    setAppState("story", "checkpoints", checkpointId, "completed", true);
    setAppState(
      "story",
      "checkpoints",
      checkpointId,
      "completedAt",
      Date.now(),
    );
    setAppState("story", "completedCheckpoints", (prev) => [
      ...prev,
      checkpointId,
    ]);

    // Calculate story progress after this checkpoint is counted
    const totalCheckpoints = Object.keys(story.checkpoints).length;
    const completedCount = story.completedCheckpoints.length + 1;
    const progress = Math.floor((completedCount / totalCheckpoints) * 100);
    setAppState("story", "storyProgress", progress);
  }

  // Clear pending choice
  setAppState("story", "pendingChoice", null);
  setAppState("story", "activeStory", null);

  // Show next story in queue if available
  if (story.storyQueue.length > 0) {
    const nextStoryId = story.storyQueue[0];
    setAppState("story", "storyQueue", (prev) => prev.slice(1));
    if (nextStoryId) {
      setAppState("story", "activeStory", nextStoryId);
    }
  }
};

export const resetCheckpoints = () => {
  const checkpoints = appState.story.checkpoints;
  Object.keys(checkpoints).forEach((checkpointId) => {
    setAppState("story", "checkpoints", checkpointId, "completed", false);
    setAppState("story", "checkpoints", checkpointId, "completedAt", undefined);
  });
  setAppState("story", "completedCheckpoints", []);
  setAppState("story", "storyProgress", 0);
  setAppState("story", "activeStory", null);
  setAppState("story", "storyQueue", []);
  setAppState("story", "currentEra", "PREHISTORY");
  setAppState("story", "eraBonuses", {});
  setAppState("story", "pendingChoice", null);
};

export const loadCheckpointState = (data: {
  completedCheckpoints: string[];
  currentEra: string;
}) => {
  setAppState("story", "completedCheckpoints", data.completedCheckpoints);
  setAppState("story", "currentEra", data.currentEra);

  // Mark checkpoints as completed
  data.completedCheckpoints.forEach((checkpointId) => {
    if (appState.story.checkpoints[checkpointId]) {
      setAppState("story", "checkpoints", checkpointId, "completed", true);
    }
  });

  // Calculate progress
  const totalCheckpoints = Object.keys(appState.story.checkpoints).length;
  const progress = Math.floor(
    (data.completedCheckpoints.length / totalCheckpoints) * 100,
  );
  setAppState("story", "storyProgress", progress);
};

// ============================================================================
// Game Log Actions
// ============================================================================

export type LogLevel = "info" | "success" | "warning" | "error";

export const addLog = (
  messageOrPayload: string | { message: string; level?: LogLevel },
  level: LogLevel = "info",
) => {
  const message =
    typeof messageOrPayload === "string"
      ? messageOrPayload
      : messageOrPayload.message;
  const resolvedLevel =
    typeof messageOrPayload === "string"
      ? level
      : (messageOrPayload.level ?? "info");

  const newLog = {
    id: `${Date.now()}-${Math.random()}`,
    message,
    level: resolvedLevel,
    timestamp: Date.now(),
  };

  setAppState("gameLog", "logs", (prev) => [...prev, newLog]);

  // Keep only the last maxLogs entries
  const maxLogs = appState.gameLog.maxLogs;
  if (appState.gameLog.logs.length > maxLogs) {
    setAppState("gameLog", "logs", (prev) => prev.slice(-maxLogs));
  }
};

export const clearLogs = () => {
  setAppState("gameLog", "logs", []);
};

// ============================================================================
// Store Export
// ============================================================================

// Export the store for direct access
export { appState, setAppState };

// Re-export types for convenience
export type { GameState, Squirrel, JobSite, JoblessJobSite, Population };
export type { IdeasState };
export type { StoryState };
export type { GameLogState };
// Removed duplicate AppState export - it conflicts with interface above
