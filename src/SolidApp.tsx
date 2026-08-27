import GameContainer from "./components/GameContainer";
import StoryModal from "./components/StoryModal";
import DebugPanel from "./components/DebugPanel";
import {
  useSolidGameLoop,
  useSolidAutoSave,
  useSolidStoryCheckpoints,
} from "./engine/hooks";

export default function SolidApp() {
  useSolidGameLoop();
  useSolidAutoSave();
  useSolidStoryCheckpoints();

  return (
    <>
      <GameContainer />
      <StoryModal />
      <DebugPanel />
    </>
  );
}
