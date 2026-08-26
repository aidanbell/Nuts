import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from './store';
import GameContainer from './components/GameContainer';
import StoryModal from './components/StoryModal';
import DebugPanel from './components/DebugPanel';
import useGameLoop from './hooks/useGameLoop';
import useStoryCheckpoints from './hooks/useStoryCheckpoints';
import { loadGame, saveGame } from './utils/saveSystem';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { loadSaveData } from './store/gameSlice';
import { GlobalStyles, theme } from './styles';

// Auto-save hook
const useAutoSave = () => {
  const gameState = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Load save data on mount
    const savedData = loadGame();
    if (savedData) {
      dispatch(loadSaveData(savedData));
    }
  }, [dispatch]);
  
  useEffect(() => {
    // Check if auto-save is enabled (from debug panel)
    const autoSaveEnabled = localStorage.getItem('debug_autosave_enabled') !== 'false';
    
    if (!autoSaveEnabled) {
      return;
    }
    
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      saveGame(gameState);
      console.log('Auto-saved game state');
    }, 30000);
    
    return () => clearInterval(interval);
  }, [gameState]);
  
  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const autoSaveEnabled = localStorage.getItem('debug_autosave_enabled') !== 'false';
      if (autoSaveEnabled) {
        saveGame(gameState);
        console.log('Saved game on page unload');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState]);
};

// Game component that uses hooks
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
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Game />
      </ThemeProvider>
    </Provider>
  );
}

export default App;

