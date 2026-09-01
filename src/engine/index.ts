/**
 * Engine public API
 */

export {
  appState,
  setAppState,
  gameState,
  ideasState,
  storyState,
  gameLogState,
  addNuts,
  spendNuts,
  addResource,
  spendResource,
  createSquirrel,
  getSquirrelCap,
  getSettlementLabel,
  canBuildWoodenHouse,
  buildWoodenHouse,
  isTownBuildingUnlocked,
  canBuildBonfire,
  buildBonfire,
  canUpgradeBonfire,
  upgradeBonfire,
  tryBonfireAttraction,
  unlockTownBuildings,
  squirrelFoundNut,
  unlockJobsites,
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
  craftRefinement,
  batchUpdate,
  incrementTick,
  updateTimer,
  setGameSpeed,
  pauseGame,
  resumeGame,
  setActiveTab,
  unlockTab,
  unlockTabs,
  hibernate,
  calculateHibernationReward,
  canEnterEra,
  markWinterIncoming,
  goldNutsToForageMulti,
  getEffectiveNps,
  calculateGoldenNutReward,
  loadSaveData,
  updateTimestamp,
  metaState,
  researchIdea,
  showIdea,
  showIdeas,
  updateIdeaVisibility,
  refreshIdeaCatalog,
  resetIdeas,
  loadIdeasState,
  completeCheckpoint,
  showStory,
  dismissStory,
  queueStory,
  queueStories,
  setEra,
  setPendingChoice,
  makeChoice,
  resetCheckpoints,
  loadCheckpointState,
  addLog,
  clearLogs,
  type SetAppState,
  type GameState,
  type Squirrel,
  type JobSite,
  type JoblessJobSite,
  type Population,
  type GameUpdate,
  type IdeasState,
  type StoryState,
  type GameLogState,
  type AppState,
  type LogLevel,
} from "./state";

export { tryResearch, canAffordIdea, meetsIdeaRequirements } from "./research";

export { attachStore } from "./runtime";
export { createMemoryStore, type Store, type SetStoreFunction } from "./store";
export { createEngine, type EngineDeps } from "./createEngine";
export type { Clock, SaveStorage } from "./platform";

export { startGameLoop, chance } from "./gameLoop";
export { startCheckpoints, processCheckpoints } from "./checkpoints";

export {
  saveGame,
  loadGame,
  clearSave,
  exportSave,
  importSave,
  bindSaveStorage,
} from "./saveSystem";

export {
  processEffects,
  logEffects,
  type GameEffect,
  type EffectProcessorOptions,
} from "./effectProcessor";
