/**
 * Reactive game primitives (create* factories for component setup).
 */

import { onCleanup } from "solid-js";
import { createGameLoop } from "./engine/gameLoop";
import { createAutoSave, createStoryCheckpoints } from "./engine/primitives";
import GameContainer from "./components/GameContainer";
import StoryModal from "./components/StoryModal";
import DebugPanel from "./components/DebugPanel";

export default function App() {
  onCleanup(createGameLoop());
  createAutoSave();
  createStoryCheckpoints();

  return (
    <>
      <GameContainer />
      <StoryModal />
      <DebugPanel />
    </>
  );
}
