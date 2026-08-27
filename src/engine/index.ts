/**
 * SolidJS Engine Index
 * Central export point for all SolidJS engine modules
 *
 * This provides a clean API for the SolidJS-based game engine,
 * replacing the Redux-based store system.
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
  loadSaveData,
  updateTimestamp,
  // Ideas actions
  researchIdea,
  showIdea,
  showIdeas,
  updateIdeaVisibility,
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

// Hooks
export {
  useSolidGameLoop,
  useSolidAutoSave,
  useSolidStoryCheckpoints,
  useSolidIdeas,
  useSolidGoldenNut,
  calculateGoldenNutReward,
  type GoldenNutState,
} from "./hooks";

// Save/Load system
export {
  saveGame,
  loadGame,
  clearSave,
  exportSave,
  importSave,
} from "./saveSystem";

// Effect processor
export {
  processEffects,
  logEffects,
  type GameEffect,
  type EffectProcessorOptions,
} from "./effectProcessor";
