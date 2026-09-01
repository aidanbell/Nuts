/**
 * Immutable templates and fresh-state factories.
 * Never pass a template into a store — clone first so resets stay clean.
 */

import type { GameState } from "../types/game";
import type { Idea, IdeasState } from "../types/ideas";
import type { StoryState } from "../types/story";
import type { GameLogState } from "../types/gameLog";
import { INITIAL_META_STATE, type MetaState } from "../types/meta";
import { ideas } from "../data/ideas";
import { storyCheckpoints } from "../data/storyCheckpoints";

export interface AppState {
  game: GameState;
  ideas: IdeasState;
  story: StoryState;
  gameLog: GameLogState;
  meta: MetaState;
}

export const ideasTemplate: Record<string, Idea> = structuredClone(ideas);
export const checkpointsTemplate = structuredClone(storyCheckpoints);

export const jobSitesTemplate: GameState["jobSites"] = {
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

/** Clean game template — never passed into the store (store would mutate it) */
export const gameStateTemplate: GameState = {
  nutsTotal: 0,
  nutsAllTime: 0,
  goldNuts: {
    total: 0,
    multi: 0.12,
  },
  resources: {
    nutwood: 0,
    stone: 0,
    bronze: 0,
    iron: 0,
  },
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
  jobSites: structuredClone(jobSitesTemplate),
  getButton: {
    value: 1,
    mult: 1,
  },
  gameSpeed: 1,
  isPaused: false,
  tick: 0,
  lastUpdate: Date.now(),
  activeTab: "home",
  unlockedTabs: ["home"],
  town: {
    woodenHouses: 0,
    bonfireLevel: 0,
    durableHouses: 0,
  },
  timer: {
    ms: 0,
    s: 0,
    m: 0,
  },
};

export function createFreshGameState(
  overrides: Partial<GameState> = {},
): GameState {
  return {
    ...structuredClone(gameStateTemplate),
    ...overrides,
    jobSites: structuredClone(jobSitesTemplate),
    resources: { ...gameStateTemplate.resources, ...overrides.resources },
    goldNuts: { ...gameStateTemplate.goldNuts, ...overrides.goldNuts },
    getButton: { ...gameStateTemplate.getButton, ...overrides.getButton },
    timer: { ...gameStateTemplate.timer, ...overrides.timer },
    town: {
      woodenHouses: 0,
      bonfireLevel: 0,
      durableHouses: 0,
      ...overrides.town,
    },
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

export const initialAppState: AppState = {
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
