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
import type { Idea, IdeaEra, IdeasState } from "../types/ideas";
import type { StoryState } from "../types/story";
import type { GameLogState } from "../types/gameLog";
import {
  INITIAL_META_STATE,
  STORY_MODAL_HIBERNATION_LIMIT,
  SEASON_ZERO_SQUIRREL_CAP,
  PRE_HOUSING_SQUIRREL_CAP,
  TUTORIAL_CHECKPOINT_IDS,
  type MetaState,
} from "../types/meta";
import { ideas } from "../data/ideas";
import { storyCheckpoints } from "../data/storyCheckpoints";
import { productionJobsites, refinementJobsites } from "../data/jobsites";

/** Immutable templates — store state is cloned from these so resets stay clean */
const ideasTemplate: Record<string, Idea> = structuredClone(ideas);
const checkpointsTemplate = structuredClone(storyCheckpoints);
const jobSitesTemplate: GameState["jobSites"] = {
  jobless: {
    time: 1500,
    value: 1,
    chance: 0.5,
    multi: 1,
    level: 0,
    cost: 0,
    method: "ground",
  },
  production: {},
  refinement: {},
};

// ============================================================================
// Initial State
// ============================================================================

/** Clean game template — never passed into the store (store would mutate it) */
const gameStateTemplate: GameState = {
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
  jobSites: structuredClone(jobSitesTemplate),

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

function createFreshGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...structuredClone(gameStateTemplate),
    ...overrides,
    jobSites: structuredClone(jobSitesTemplate),
    resources: { ...gameStateTemplate.resources, ...overrides.resources },
    goldNuts: { ...gameStateTemplate.goldNuts, ...overrides.goldNuts },
    getButton: { ...gameStateTemplate.getButton, ...overrides.getButton },
    timer: { ...gameStateTemplate.timer, ...overrides.timer },
    population: overrides.population ?? { jobless: [] },
    squirrels: overrides.squirrels ?? {},
  };
}

const initialIdeasState: IdeasState = {
  ideas: structuredClone(ideasTemplate),
  researchedIdeas: [],
  researchedCount: 0,
  totalResearchPoints: 0,
};

const initialStoryState: StoryState = {
  checkpoints: structuredClone(checkpointsTemplate),
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
  meta: MetaState;
}

const initialAppState: AppState = {
  game: createFreshGameState({
    squirrels: {
      0: {
        _id: 0,
        employed: false,
        jobSite: null,
        total: 0,
      },
    },
    nextSquirrelId: 1,
    population: { jobless: [0] },
  }),
  ideas: initialIdeasState,
  story: initialStoryState,
  gameLog: initialGameLogState,
  meta: { ...INITIAL_META_STATE },
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
export const metaState = () => appState.meta;

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
  const currentCount = Object.keys(game.squirrels).length;
  if (currentCount >= getSquirrelCap()) {
    return false;
  }

  const id = game.nextSquirrelId;

  setAppState("game", "squirrels", id, {
    _id: id,
    employed: false,
    jobSite: null,
    total: 0,
  });
  setAppState("game", "population", "jobless", (prev) => [...prev, id]);
  setAppState("game", "nextSquirrelId", id + 1);
  return true;
};

/** Soft population cap until housing exists */
export const getSquirrelCap = (): number => {
  if (appState.meta.hibernations === 0) {
    return SEASON_ZERO_SQUIRREL_CAP;
  }
  return PRE_HOUSING_SQUIRREL_CAP;
};

export const squirrelFoundNut = (squirrelId: number) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite = game.jobSites.jobless;

  if (squirrel && jobSite) {
    const amount = Math.max(
      0,
      jobSite.value * jobSite.multi * appState.meta.goldForageMulti,
    );
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
  // Jobsites tab is a permanent unlock
  unlockTab("jobsites");

  jobsiteIds.forEach((id) => {
    // Already known this season — keep current level/staffing
    if (
      appState.game.jobSites.production[id] ||
      appState.game.jobSites.refinement[id]
    ) {
      setAppState("meta", "unlockedJobsiteIds", (prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );
      return;
    }

    const jobsiteTemplate =
      productionJobsites.find((js) => js.id === id) ||
      refinementJobsites.find((js) => js.id === id);

    if (jobsiteTemplate) {
      // Level 0 = known but unbuilt; first upgrade builds it
      const newJobsite: JobSite = {
        ...jobsiteTemplate,
        unlocked: true,
        maxSquirrels: jobsiteTemplate.maxSquirrels,
        workers: [],
        level: 0,
        baseProduction: jobsiteTemplate.baseProduction,
        squirrelBonus: jobsiteTemplate.squirrelBonus,
        cost: jobsiteTemplate.baseCost,
        costGrowthRate: jobsiteTemplate.costGrowthRate,
        baseCost: jobsiteTemplate.baseCost,
        consumes: jobsiteTemplate.consumes,
        produces: jobsiteTemplate.produces,
      };

      if (newJobsite.type === "production") {
        setAppState("game", "jobSites", "production", id, newJobsite);
      } else if (newJobsite.type === "refinement") {
        setAppState("game", "jobSites", "refinement", id, newJobsite);
      }

      setAppState("meta", "unlockedJobsiteIds", (prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );
    }
  });
};

export const buyJobSiteCapacity = (jobSiteId: string) => {
  const game = appState.game;
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  if (!jobSite || game.nutsTotal < jobSite.cost) return;

  // Capture before mutating — Solid store proxies update in place
  const previousLevel = jobSite.level;
  const newLevel = previousLevel + 1;
  const siteType = jobSite.type;
  const baseCost = jobSite.baseCost;
  const costGrowthRate = jobSite.costGrowthRate;
  const maxLevel = jobSite.maxLevel;

  if (maxLevel !== undefined && previousLevel >= maxLevel) return;

  spendNuts(jobSite.cost);

  setAppState("game", "jobSites", siteType, jobSiteId, "level", newLevel);

  // Capacity bump when reaching levels 5, 10, 15, ...
  if (newLevel % 5 === 0) {
    setAppState(
      "game",
      "jobSites",
      siteType,
      jobSiteId,
      "maxSquirrels",
      (prev) => prev + 1,
    );
  }

  // Every level, slightly increase production (5% boost to both base and bonus)
  setAppState(
    "game",
    "jobSites",
    siteType,
    jobSiteId,
    "baseProduction",
    (prev) => prev * 1.05,
  );
  setAppState(
    "game",
    "jobSites",
    siteType,
    jobSiteId,
    "squirrelBonus",
    (prev) => prev * 1.05,
  );

  // Next cost from the level we just reached
  const newCost = Math.floor(baseCost * Math.pow(costGrowthRate, newLevel));
  setAppState("game", "jobSites", siteType, jobSiteId, "cost", newCost);
};

export const assignSquirrelToJobSite = (
  squirrelId: number,
  jobSiteId: string,
) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  // Level 0 sites are known but unbuilt — cannot staff until first upgrade
  if (
    squirrel &&
    jobSite &&
    jobSite.level >= 1 &&
    jobSite.workers.length < jobSite.maxSquirrels
  ) {
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

export const updateTimer = (deltaMs: number = 10) => {
  // Legacy timer advances +1 unit per 10ms of real time (old loop ran ~100 FPS).
  // time_elapsed checkpoints use m*60000 + s*1000 + ms ≈ real milliseconds.
  const units = Math.max(0, Math.round(deltaMs / 10));
  if (units === 0) return;

  setAppState("game", "timer", (prev) => {
    let ms = prev.ms + units;
    let s = prev.s + Math.floor(ms / 100);
    ms = ms % 100;
    const m = prev.m + Math.floor(s / 60);
    s = s % 60;
    return { ms, s, m };
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
  // Hibernate is seasonal — only unlock for the current winter
  if (tab === "hibernate") return;
  setAppState("meta", "unlockedTabs", (prev) => {
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
  const permanent = tabs.filter((tab) => tab !== "hibernate");
  if (permanent.length === 0) return;
  setAppState("meta", "unlockedTabs", (prev) => {
    const newTabs = [...prev];
    permanent.forEach((tab) => {
      if (!newTabs.includes(tab)) {
        newTabs.push(tab);
      }
    });
    return newTabs;
  });
};

// Hibernate action
export const calculateHibernationReward = (
  nutsAllTime: number,
  multi: number,
): number => {
  // Early-game friendly: sqrt curve so first winter still pays Gold Nuts
  return Math.max(
    1,
    Math.floor(Math.sqrt(Math.max(0, nutsAllTime)) * multi * 2),
  );
};

/** Permanent forage bonus from banked Gold Nuts (~2% each) */
export const goldNutsToForageMulti = (goldNutsTotal: number): number =>
  1 + goldNutsTotal * 0.02;

export const canEnterEra = (era: string): boolean => {
  const order: IdeaEra[] = [
    "PREHISTORY",
    "WOOD_AGE",
    "STONE_AGE",
    "BRONZE_AGE",
    "IRON_AGE",
    "INDUSTRIAL_AGE",
    "INFORMATION_AGE",
    "TECHNOLOGY_AGE",
    "SPACE_AGE",
    "GALACTIC_AGE",
  ];
  const available = appState.meta.maxEraAvailable;
  const wantIdx = order.indexOf(era as IdeaEra);
  const maxIdx = order.indexOf(available);
  if (wantIdx < 0 || maxIdx < 0) return false;
  return wantIdx <= maxIdx;
};

export const markWinterIncoming = () => {
  setAppState("meta", "winterIncoming", true);
  unlockTab("hibernate");
};

/**
 * Season rollover (prestige): wipe run state, keep colony legacy (Gold Nuts / season).
 */
export const hibernate = () => {
  const game = appState.game;
  const goldenNutsEarned = calculateHibernationReward(
    game.nutsAllTime,
    game.goldNuts.multi,
  );

  const newGoldTotal = game.goldNuts.total + goldenNutsEarned;
  const nextHibernations = appState.meta.hibernations + 1;

  // After first winter, Wood Age becomes available next season
  const maxEra: IdeaEra =
    nextHibernations >= 1 ? "WOOD_AGE" : appState.meta.maxEraAvailable;

  // Preserve structure knowledge across the wipe (hibernate tab is seasonal)
  const preservedTabs = appState.meta.unlockedTabs.filter(
    (tab) => tab !== "hibernate",
  );
  const preservedStructure = [...appState.meta.structureIdeas];
  const preservedJobsites = [...appState.meta.unlockedJobsiteIds];

  setAppState("meta", {
    hibernations: nextHibernations,
    seasonIndex: nextHibernations,
    winterIncoming: false,
    maxEraAvailable: maxEra,
    goldForageMulti: goldNutsToForageMulti(newGoldTotal),
    suppressCheckpointsUntil: Date.now() + 2000,
    unlockedTabs: preservedTabs,
    structureIdeas: preservedStructure,
    unlockedJobsiteIds: preservedJobsites,
  });

  // Wipe run state from a clean template (never reuse store-mutated objects)
  setAppState(
    "game",
    createFreshGameState({
      goldNuts: {
        total: newGoldTotal,
        multi: game.goldNuts.multi,
      },
      squirrels: {},
      nextSquirrelId: 0,
      population: { jobless: [] },
      unlockedTabs: Array.from(new Set(["home", ...preservedTabs])),
      lastUpdate: Date.now(),
    }),
  );

  // Reset ideas, then restore structure research
  setAppState("ideas", {
    ideas: structuredClone(ideasTemplate),
    researchedIdeas: [],
    researchedCount: 0,
    totalResearchPoints: 0,
  });

  // Reset story progress but keep checkpoint definitions
  setAppState("story", {
    checkpoints: structuredClone(checkpointsTemplate),
    activeStory: null,
    storyQueue: [],
    completedCheckpoints: [],
    currentEra: "PREHISTORY",
    storyProgress: 0,
    eraBonuses: {},
    pendingChoice: null,
  });

  // Skip tutorial / intro beats — spring + season gating cover the wake
  const skipped = [...TUTORIAL_CHECKPOINT_IDS];
  for (const id of skipped) {
    if (appState.story.checkpoints[id]) {
      setAppState("story", "checkpoints", id, "completed", true);
    }
  }
  setAppState("story", "completedCheckpoints", skipped);

  setAppState("gameLog", "logs", []);

  restoreStructureKnowledge();

  // Wake alone with one squirrel
  createSquirrel();

  const spring = appState.story.checkpoints.springAwakening;
  if (nextHibernations < STORY_MODAL_HIBERNATION_LIMIT) {
    // First wipe or two: keep the spring modal
    queueStories(["springAwakening"]);
  } else if (spring?.story) {
    completeCheckpoint("springAwakening");
    addLog(`📖 ${spring.story.title} — ${spring.story.body}`, "info");
  }

  addLog(
    `Hibernated! +${goldenNutsEarned} Gold Nuts. Season ${nextHibernations + 1} begins.`,
    "success",
  );
};

/** Re-apply structure ideas + known jobsites after a winter wipe */
function restoreStructureKnowledge() {
  const { structureIdeas, unlockedJobsiteIds, unlockedTabs } = appState.meta;

  setAppState(
    "game",
    "unlockedTabs",
    Array.from(new Set(["home", ...unlockedTabs])),
  );

  for (const ideaId of structureIdeas) {
    const idea = appState.ideas.ideas[ideaId];
    if (!idea) continue;
    setAppState("ideas", "ideas", ideaId, "researched", true);
    setAppState("ideas", "ideas", ideaId, "visible", true);
  }
  setAppState("ideas", "researchedIdeas", [...structureIdeas]);
  setAppState("ideas", "researchedCount", structureIdeas.length);

  // Rebuild known jobsites at level 0 (empty staff)
  if (unlockedJobsiteIds.length > 0) {
    unlockJobsites(unlockedJobsiteIds);
  }
}

// Update timestamp
export const updateTimestamp = () => {
  setAppState("game", "lastUpdate", Date.now());
};

// Load save data
export const loadSaveData = (
  data: Partial<GameState> & {
    meta?: MetaState;
    story?: { completedCheckpoints: string[]; currentEra: string | null };
    ideas?: { researchedIdeas: string[] };
    resources?: GameState["resources"];
    unlockedTabs?: string[];
    activeTab?: string;
    timer?: GameState["timer"];
  },
) => {
  setAppState("game", (prev) => ({
    ...prev,
    ...data,
    resources: data.resources ?? prev.resources,
    unlockedTabs: data.unlockedTabs ?? prev.unlockedTabs,
    activeTab: data.activeTab ?? prev.activeTab,
    timer: data.timer ?? prev.timer,
  }));

  if (data.meta) {
    setAppState("meta", { ...INITIAL_META_STATE, ...data.meta });
  }

  // Permanent tabs: prefer meta, fall back to saved run tabs
  const metaTabs = appState.meta.unlockedTabs;
  const runTabs = data.unlockedTabs ?? appState.game.unlockedTabs;
  const mergedTabs = Array.from(new Set(["home", ...metaTabs, ...runTabs]));
  setAppState("meta", "unlockedTabs", mergedTabs);
  setAppState("game", "unlockedTabs", mergedTabs);

  if (data.story) {
    setAppState("story", "currentEra", data.story.currentEra);
    setAppState(
      "story",
      "completedCheckpoints",
      data.story.completedCheckpoints,
    );
    data.story.completedCheckpoints.forEach((id) => {
      if (appState.story.checkpoints[id]) {
        setAppState("story", "checkpoints", id, "completed", true);
      }
    });
  }

  if (data.ideas?.researchedIdeas) {
    data.ideas.researchedIdeas.forEach((ideaId) => {
      if (appState.ideas.ideas[ideaId]) {
        setAppState("ideas", "ideas", ideaId, "researched", true);
        setAppState("ideas", "ideas", ideaId, "visible", true);
        if (appState.ideas.ideas[ideaId].persists) {
          setAppState("meta", "structureIdeas", (prev) =>
            prev.includes(ideaId) ? prev : [...prev, ideaId],
          );
        }
      }
    });
    setAppState("ideas", "researchedIdeas", data.ideas.researchedIdeas);
    setAppState("ideas", "researchedCount", data.ideas.researchedIdeas.length);
  }

  // Migrate known jobsites into meta from a mid-season save
  const knownIds = [
    ...Object.keys(appState.game.jobSites.production),
    ...Object.keys(appState.game.jobSites.refinement),
  ];
  if (knownIds.length > 0) {
    setAppState("meta", "unlockedJobsiteIds", (prev) =>
      Array.from(new Set([...prev, ...knownIds])),
    );
  }
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

  // Structure research survives winter
  if (idea.persists) {
    setAppState("meta", "structureIdeas", (prev) =>
      prev.includes(ideaId) ? prev : [...prev, ideaId],
    );
  }

  // Apply research effects that mutate game state
  const effects = idea.effects;

  if (effects.upgradeJobsite) {
    const { jobsiteId, property, amount } = effects.upgradeJobsite;

    if (jobsiteId === "jobless") {
      const jobless = appState.game.jobSites.jobless;
      if (property === "multi") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "multi",
          jobless.multi + amount,
        );
      } else if (property === "value") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "value",
          jobless.value + amount,
        );
      } else if (property === "time") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "time",
          jobless.time - amount,
        );
      } else if (property === "chance") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "chance",
          jobless.chance + amount,
        );
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
  if (!canEnterEra(era)) {
    addLog(
      `The ${era.replace(/_/g, " ")} is still only a dream. Survive winter first.`,
      "warning",
    );
    return;
  }
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
    setEra(choice.effects.setEra);
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
