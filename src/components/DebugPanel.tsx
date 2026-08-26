import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addNuts, createSquirrel, hibernate, pauseGame, resumeGame } from '../store/gameSlice';
import { resetCheckpoints } from '../store/storySlice';
import { clearSave, saveGame, loadGame } from '../utils/saveSystem';
import styled from 'styled-components';
import { Column, Row, Button, Text, Heading3, Divider, Badge } from '../styles';
import { theme } from '../styles/theme';

const DebugContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  right: 0;
  width: ${({ isOpen }) => isOpen ? '400px' : '60px'};
  max-height: ${({ isOpen }) => isOpen ? '80vh' : '60px'};
  min-height: 60px;
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.danger};
  border-bottom: none;
  border-right: none;
  border-top-left-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  transition: all ${theme.transitions.normal};
  z-index: 10000;
  overflow: hidden;
`;

const DebugContent = styled(Column)`
  padding: ${theme.spacing.md};
  max-height: 80vh;
  overflow-y: auto;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  background: ${theme.colors.danger};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.round};
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: ${theme.typography.fontSize.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform ${theme.transitions.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const Section = styled(Column)`
  background: ${theme.colors.background};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
`;

const DebugButton = styled(Button)`
  font-size: ${theme.typography.fontSize.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
`;

const StateViewer = styled.pre`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.xs};
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const DebugPanel: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const storyState = useSelector((state: RootState) => state.story);
  
  const [isOpen, setIsOpen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    return localStorage.getItem('debug_autosave_enabled') !== 'false';
  });
  const [showGameState, setShowGameState] = useState(false);
  const [showStoryState, setShowStoryState] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  
  // Auto-save toggle handler
  const handleAutoSaveToggle = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
    // Store in localStorage so it persists
    localStorage.setItem('debug_autosave_enabled', (!autoSaveEnabled).toString());
  };
  
  // Clear save data
  const handleClearSave = () => {
    if (window.confirm('⚠️ This will delete ALL saved data. Are you sure?')) {
      clearSave();
      alert('Save data cleared! Refresh the page to start fresh.');
    }
  };
  
  // Reset game state
  const handleResetGame = () => {
    if (window.confirm('⚠️ This will reset the current game session (not saved data). Continue?')) {
      dispatch(resetCheckpoints());
      window.location.reload();
    }
  };
  
  // Manual save
  const handleManualSave = () => {
    saveGame(gameState);
    alert('Game saved manually!');
  };
  
  // Manual load
  const handleManualLoad = () => {
    const data = loadGame();
    if (data) {
      alert('Game loaded! Refresh to see changes.');
      window.location.reload();
    } else {
      alert('No save data found!');
    }
  };
  
  // Add squirrel
  const handleAddSquirrel = () => {
    dispatch(createSquirrel());
  };
  
  // Add nuts
  const handleAddNuts = (amount: number) => {
    dispatch(addNuts(amount));
  };
  
  // Trigger hibernate
  const handleHibernate = () => {
    if (window.confirm('Hibernate now? This will reset your progress.')) {
      dispatch(hibernate());
    }
  };
  
  // Copy state to clipboard
  const handleCopyState = (stateType: 'game' | 'story') => {
    const state = stateType === 'game' ? gameState : storyState;
    const json = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(json);
    setCopiedText(stateType);
    setTimeout(() => setCopiedText(''), 2000);
  };
  
  // Export save
  const handleExportSave = () => {
    try {
      const saveData = loadGame();
      if (!saveData) {
        alert('No save data to export!');
        return;
      }
      const json = JSON.stringify(saveData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nuts-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export save!');
      console.error(error);
    }
  };
  
  // Pause/Resume game
  const handleTogglePause = () => {
    if (gameState.isPaused) {
      dispatch(resumeGame());
    } else {
      dispatch(pauseGame());
    }
  };
  
  return (
    <DebugContainer isOpen={isOpen}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '🐛'}
      </ToggleButton>
      
      {isOpen && (
        <DebugContent gap="md">
          <Row gap="sm" align="center">
            <Heading3>🐛 Debug Panel</Heading3>
            <Badge variant="danger">DEV</Badge>
          </Row>
          
          <Divider />
          
          {/* Auto-Save Controls */}
          <Section gap="sm">
            <Text weight="bold">Auto-Save</Text>
            <Row gap="sm">
              <DebugButton 
                variant={autoSaveEnabled ? 'success' : 'danger'}
                size="sm"
                onClick={handleAutoSaveToggle}
              >
                {autoSaveEnabled ? '✓ Enabled' : '✕ Disabled'}
              </DebugButton>
              <DebugButton 
                variant="primary" 
                size="sm"
                onClick={handleManualSave}
              >
                Save Now
              </DebugButton>
              <DebugButton 
                variant="secondary" 
                size="sm"
                onClick={handleManualLoad}
              >
                Load
              </DebugButton>
            </Row>
          </Section>
          
          {/* Save Data Management */}
          <Section gap="sm">
            <Text weight="bold">Save Data</Text>
            <Row gap="sm">
              <DebugButton 
                variant="danger" 
                size="sm"
                onClick={handleClearSave}
              >
                🗑️ Clear Save
              </DebugButton>
              <DebugButton 
                variant="warning" 
                size="sm"
                onClick={handleResetGame}
              >
                🔄 Reset Game
              </DebugButton>
              <DebugButton 
                variant="secondary" 
                size="sm"
                onClick={handleExportSave}
              >
                💾 Export
              </DebugButton>
            </Row>
          </Section>
          
          {/* Game Controls */}
          <Section gap="sm">
            <Text weight="bold">Game Controls</Text>
            <Row gap="sm">
              <DebugButton 
                variant={gameState.isPaused ? 'success' : 'warning'}
                size="sm"
                onClick={handleTogglePause}
              >
                {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </DebugButton>
              <DebugButton 
                variant="primary" 
                size="sm"
                onClick={handleAddSquirrel}
              >
                🐿️ +1 Squirrel
              </DebugButton>
            </Row>
            <Row gap="sm">
              <DebugButton 
                variant="success" 
                size="sm"
                onClick={() => handleAddNuts(100)}
              >
                🥜 +100 Nuts
              </DebugButton>
              <DebugButton 
                variant="success" 
                size="sm"
                onClick={() => handleAddNuts(10000)}
              >
                🥜 +10k Nuts
              </DebugButton>
            </Row>
            <DebugButton 
              variant="secondary" 
              size="sm"
              onClick={handleHibernate}
              fullWidth
            >
              💤 Hibernate Now
            </DebugButton>
          </Section>
          
          {/* State Inspector */}
          <Section gap="sm">
            <Text weight="bold">State Inspector</Text>
            <Row gap="sm">
              <DebugButton 
                variant={showGameState ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowGameState(!showGameState)}
              >
                {showGameState ? 'Hide' : 'Show'} Game State
              </DebugButton>
              <DebugButton 
                variant={showStoryState ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowStoryState(!showStoryState)}
              >
                {showStoryState ? 'Hide' : 'Show'} Story State
              </DebugButton>
            </Row>
            
            {showGameState && (
              <>
                <Row justify="space-between" align="center">
                  <Text size="sm" weight="bold">Game State:</Text>
                  <DebugButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleCopyState('game')}
                  >
                    {copiedText === 'game' ? '✓ Copied!' : '📋 Copy'}
                  </DebugButton>
                </Row>
                <StateViewer>
                  {JSON.stringify({
                    nuts: gameState.nutsTotal,
                    nutsAllTime: gameState.nutsAllTime,
                    goldNuts: gameState.goldNuts,
                    squirrels: Object.keys(gameState.squirrels).length,
                    jobSites: {
                      production: Object.entries(gameState.jobSites.production).map(([id, js]) => ({
                      id,
                      capacity: js.capacity,
                      workers: js.workers.length,
                    })),
                    refinement: Object.entries(gameState.jobSites.refinement).map(([id, js]) => ({
                      id,
                      capacity: js.capacity,
                      workers: js.workers.length,
                    })),
                  },
                    isPaused: gameState.isPaused,
                    gameSpeed: gameState.gameSpeed,
                    tick: gameState.tick,
                  }, null, 2)}
                </StateViewer>
              </>
            )}
            
            {showStoryState && (
              <>
                <Row justify="space-between" align="center">
                  <Text size="sm" weight="bold">Story State:</Text>
                  <DebugButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleCopyState('story')}
                  >
                    {copiedText === 'story' ? '✓ Copied!' : '📋 Copy'}
                  </DebugButton>
                </Row>
                <StateViewer>
                  {JSON.stringify({
                    currentEra: storyState.currentEra,
                    storyProgress: storyState.storyProgress,
                    completedCheckpoints: storyState.completedCheckpoints,
                    activeStory: storyState.activeStory,
                  }, null, 2)}
                </StateViewer>
              </>
            )}
          </Section>
          
          {/* Quick Stats */}
          <Section gap="xs">
            <Text weight="bold" size="sm">Quick Stats</Text>
            <Text size="xs">Nuts: {gameState.nutsTotal.toFixed(2)}</Text>
            <Text size="xs">Squirrels: {Object.keys(gameState.squirrels).length}</Text>
            <Text size="xs">Checkpoints: {storyState.completedCheckpoints.length} / {Object.keys(storyState.checkpoints).length}</Text>
            <Text size="xs">Game Paused: {gameState.isPaused ? 'Yes' : 'No'}</Text>
            <Text size="xs">Auto-Save: {autoSaveEnabled ? 'On' : 'Off'}</Text>
          </Section>
        </DebugContent>
      )}
    </DebugContainer>
  );
};

export default DebugPanel;