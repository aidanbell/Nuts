import type { IdeaEra } from "./ideas";

/**
 * Colony legacy that survives winter wipes.
 * Run state (nuts, squirrels, jobsites) lives on GameState and is reset each season.
 */
export interface MetaState {
  /** Completed hibernation / winter cycles */
  hibernations: number;
  /** 0 = first life, increments on each hibernate */
  seasonIndex: number;
  /** Set when winter story fires; cleared on hibernate */
  winterIncoming: boolean;
  /** Highest era the player may enter this season */
  maxEraAvailable: IdeaEra;
  /** Permanent foraging multiplier from Gold Nuts (1 = none) */
  goldForageMulti: number;
  /** Ignore checkpoint processing until this timestamp (ms) */
  suppressCheckpointsUntil: number;
  /** Tabs that survive winter (ideas, jobsites, etc.) */
  unlockedTabs: string[];
  /** Structure idea ids that survive winter */
  structureIdeas: string[];
  /** Jobsite ids known to the colony (rebuilt at level 0 each spring) */
  unlockedJobsiteIds: string[];
  /** Town building ids the colony knows how to raise (e.g. bonfire) */
  unlockedTownBuildings: string[];
  /** Stone+ durable housing count — survives winter, unlike wooden houses */
  durableHouses: number;
}

export const INITIAL_META_STATE: MetaState = {
  hibernations: 0,
  seasonIndex: 0,
  winterIncoming: false,
  maxEraAvailable: "PREHISTORY",
  goldForageMulti: 1,
  suppressCheckpointsUntil: 0,
  unlockedTabs: ["home"],
  structureIdeas: [],
  unlockedJobsiteIds: [],
  unlockedTownBuildings: [],
  durableHouses: 0,
};

/** Gatherer level at which first winter begins (maxed site = natural stop) */
export const FIRST_WINTER_GATHERER_LEVEL = 10;

/** Story modals for early seasons; console-only after this many hibernations */
export const STORY_MODAL_HIBERNATION_LIMIT = 2;

/** Soft pop cap before housing (season 0 vs later) */
export const SEASON_ZERO_SQUIRREL_CAP = 3;
export const PRE_HOUSING_SQUIRREL_CAP = 5;

/** Tutorial / first-life beats — skipped after the first winter */
export const TUTORIAL_CHECKPOINT_IDS = [
  "gameStart",
  "firstSquirrel",
  "discoverIdeas",
  "secondSquirrel",
  "twoHundredNuts",
  "firstJobsite",
  "woodAgeDream",
  "firstHibernation",
] as const;
