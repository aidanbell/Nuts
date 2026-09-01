/**
 * Wire store, loop, checkpoints, and autosave for a host (browser, TUI, tests).
 */

import type { Clock, SaveStorage } from "./platform";
import { startGameLoop } from "./gameLoop";
import { startCheckpoints } from "./checkpoints";
import { bindSaveStorage, loadGame, saveGame } from "./saveSystem";
import { loadSaveData } from "./state";

export interface EngineDeps {
  clock: Clock;
  storage: SaveStorage;
  shouldAutoSave?: () => boolean;
  registerUnload?: (save: () => void) => () => void;
}

export function createEngine(deps: EngineDeps): () => void {
  bindSaveStorage(deps.storage);

  const savedData = loadGame();
  if (savedData) {
    loadSaveData(savedData);
  }

  const shouldSave = deps.shouldAutoSave ?? (() => true);

  const stopLoop = startGameLoop(deps.clock);
  const stopCheckpoints = startCheckpoints(deps.clock);
  const stopAutoSave = deps.clock.every(30_000, () => {
    if (shouldSave()) {
      saveGame();
      console.log("Auto-saved game state");
    }
  });
  const stopUnload = deps.registerUnload
    ? deps.registerUnload(() => {
        if (shouldSave()) saveGame();
      })
    : () => {};

  return () => {
    stopLoop();
    stopCheckpoints();
    stopAutoSave();
    stopUnload();
  };
}
