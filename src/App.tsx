/**
 * Browser shell — Solid UI over the headless engine.
 */

import { onCleanup } from "solid-js";
import { createEngine } from "./engine/createEngine";
import { browserClock } from "./browser/clock";
import { localStorageStorage } from "./browser/localStorageStorage";
import GameContainer from "./components/GameContainer";
import StoryModal from "./components/StoryModal";
import DebugPanel from "./components/DebugPanel";

export default function App() {
  onCleanup(
    createEngine({
      clock: browserClock,
      storage: localStorageStorage,
      shouldAutoSave: () =>
        localStorage.getItem("debug_autosave_enabled") !== "false",
      registerUnload: (save) => {
        window.addEventListener("beforeunload", save);
        return () => window.removeEventListener("beforeunload", save);
      },
    }),
  );

  return (
    <>
      <GameContainer />
      <StoryModal />
      <DebugPanel />
    </>
  );
}
