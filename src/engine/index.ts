/**
 * Engine public API
 */

// State management
export {
  appState,
  setAppState,
  gameState,
  ideasState,
  storyState,
  gameLogState,
  // Actions
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
  loadSaveData,
  updateTimestamp,
  metaState,
  // Ideas actions
  researchIdea,
  showIdea,
  showIdeas,
  updateIdeaVisibility,
  refreshIdeaCatalog,
  resetIdeas,
  loadIdeasState,
  // Story actions
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
  // Game log actions
  addLog,
  clearLogs,
  // Types
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

// Game loop
export { startGameLoop, createGameLoop, chance } from "./gameLoop";

// Primitives
export {
  createAutoSave,
  createStoryCheckpoints,
  createIdeas,
  createGoldenNut,
  calculateGoldenNutReward,
  type GoldenNutState,
} from "./primitives";

// Save/Load
export {
  saveGame,
  loadGame,
  clearSave,
  exportSave,
  importSave,
} from "./saveSystem";

// Effects
export {
  processEffects,
  logEffects,
  type GameEffect,
  type EffectProcessorOptions,
} from "./effectProcessor";
