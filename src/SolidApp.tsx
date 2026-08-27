/**
 * SolidJS App Component
 * This is the SolidJS version of App.tsx that uses the new engine
 *
 * It will eventually replace the React App.tsx, but for now both can coexist
 * for a smooth migration path.
 */

import GameContainer from "./components/GameContainer";
import StoryModal from "./components/StoryModal";
import DebugPanel from "./components/DebugPanel";
import {
  useSolidGameLoop,
  useSolidAutoSave,
  useSolidStoryCheckpoints,
} from "./engine/hooks";

/**
 * SolidApp - Main game component using SolidJS
 *
 * This component:
 * - Starts the game loop
 * - Handles auto-saving
 * - Manages story checkpoint checking
 * - Renders the main game UI
 */
export default function SolidApp() {
  // Start the game loop
  const gameLoopCleanup = useSolidGameLoop();

  // Handle auto-saving
  useSolidAutoSave();

  // Check story checkpoints
  useSolidStoryCheckpoints();

  // Cleanup on unmount
  onCleanup(() => {
    gameLoopCleanup();
  });

  return (
    <>
      <GameContainer />
      <StoryModal />
      <DebugPanel />
    </>
  );
}
