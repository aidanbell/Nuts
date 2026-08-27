import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import type { RootState } from "./store";
import GameContainer from "./components/GameContainer";
import StoryModal from "./components/StoryModal";
import DebugPanel from "./components/DebugPanel";
import useGameLoop from "./hooks/useGameLoop";
import useStoryCheckpoints from "./hooks/useStoryCheckpoints";
import { loadGame, saveGame } from "./utils/saveSystem";
import { loadSaveData } from "./store/gameSlice";

const useAutoSave = () => {
  const gameState = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedData = loadGame();
    if (savedData) {
      dispatch(loadSaveData(savedData));
    }
  }, [dispatch]);

  useEffect(() => {
    const autoSaveEnabled =
      localStorage.getItem("debug_autosave_enabled") !== "false";
    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      saveGame(gameState);
      console.log("Auto-saved game state");
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const autoSaveEnabled =
        localStorage.getItem("debug_autosave_enabled") !== "false";
      if (autoSaveEnabled) {
        saveGame(gameState);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameState]);
};

const Game: React.FC = () => {
  useGameLoop();
  useAutoSave();
  useStoryCheckpoints();

  return (
    <>
      <GameContainer />
      <StoryModal />
      <DebugPanel />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Game />
    </Provider>
  );
}

export default App;
