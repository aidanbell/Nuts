import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addNuts, createSquirrel, hibernate, pauseGame, resumeGame } from '../store/gameSlice';
import { resetCheckpoints } from '../store/storySlice';
import { clearSave, saveGame, loadGame } from '../utils/saveSystem';

const DebugPanel: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const storyState = useSelector((state: RootState) => state.story);

  const [isOpen, setIsOpen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(
    () => localStorage.getItem('debug_autosave_enabled') !== 'false'
  );
  const [showGameState, setShowGameState] = useState(false);
  const [showStoryState, setShowStoryState] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const handleAutoSaveToggle = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
    localStorage.setItem('debug_autosave_enabled', (!autoSaveEnabled).toString());
  };

  const handleClearSave = () => {
    if (window.confirm('⚠️ This will delete ALL saved data. Are you sure?')) {
      clearSave();
      alert('Save data cleared! Refresh the page to start fresh.');
    }
  };

  const handleResetGame = () => {
    if (window.confirm('⚠️ This will reset the current game session (not saved data). Continue?')) {
      dispatch(resetCheckpoints());
      window.location.reload();
    }
  };

  const handleManualSave = () => {
    saveGame(gameState);
    alert('Game saved manually!');
  };

  const handleManualLoad = () => {
    const data = loadGame();
    if (data) {
      alert('Game loaded! Refresh to see changes.');
      window.location.reload();
    } else {
      alert('No save data found!');
    }
  };

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

  const handleCopyState = (stateType: 'game' | 'story') => {
    const state = stateType === 'game' ? gameState : storyState;
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    setCopiedText(stateType);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleTogglePause = () => {
    if (gameState.isPaused) dispatch(resumeGame());
    else dispatch(pauseGame());
  };

  const handleHibernate = () => {
    if (window.confirm('Hibernate now? This will reset your progress.')) {
      dispatch(hibernate());
    }
  };

  return (
    <div
      className={[
        'fixed right-0 bottom-0 z-[10000] overflow-hidden border-2 border-r-0 border-b-0 border-danger bg-paper shadow-xl transition-all',
        isOpen
          ? 'max-h-[80vh] w-[min(100vw,400px)] rounded-tl-xl'
          : 'h-14 w-14 rounded-tl-xl',
      ].join(' ')}
    >
      <button
        type="button"
        className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full bg-danger text-lg text-white hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '🐛'}
      </button>

      {isOpen && (
        <div className="max-h-[80vh] space-y-3 overflow-y-auto p-4 pt-14">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold">🐛 Debug Panel</h3>
            <span className="rounded bg-danger/15 px-2 py-0.5 text-xs font-bold text-danger">
              DEV
            </span>
          </div>

          <hr className="border-moss/15" />

          <section className="space-y-2 rounded-lg bg-sage/40 p-3">
            <p className="text-sm font-bold">Auto-Save</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${autoSaveEnabled ? 'btn-success' : 'btn-danger'}`}
                onClick={handleAutoSaveToggle}
              >
                {autoSaveEnabled ? '✓ Enabled' : '✕ Disabled'}
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleManualSave}>
                Save Now
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleManualLoad}>
                Load
              </button>
            </div>
          </section>

          <section className="space-y-2 rounded-lg bg-sage/40 p-3">
            <p className="text-sm font-bold">Save Data</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-danger btn-sm" onClick={handleClearSave}>
                🗑️ Clear Save
              </button>
              <button type="button" className="btn btn-warning btn-sm" onClick={handleResetGame}>
                🔄 Reset Game
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportSave}>
                💾 Export
              </button>
            </div>
          </section>

          <section className="space-y-2 rounded-lg bg-sage/40 p-3">
            <p className="text-sm font-bold">Game Controls</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${gameState.isPaused ? 'btn-success' : 'btn-warning'}`}
                onClick={handleTogglePause}
              >
                {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => dispatch(createSquirrel())}
              >
                🐿️ +1 Squirrel
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => dispatch(addNuts(100))}
              >
                🥜 +100
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => dispatch(addNuts(10000))}
              >
                🥜 +10k
              </button>
              <button type="button" className="btn btn-secondary btn-sm w-full" onClick={handleHibernate}>
                💤 Hibernate Now
              </button>
            </div>
          </section>

          <section className="space-y-2 rounded-lg bg-sage/40 p-3">
            <p className="text-sm font-bold">State Inspector</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${showGameState ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowGameState(!showGameState)}
              >
                {showGameState ? 'Hide' : 'Show'} Game
              </button>
              <button
                type="button"
                className={`btn btn-sm ${showStoryState ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowStoryState(!showStoryState)}
              >
                {showStoryState ? 'Hide' : 'Show'} Story
              </button>
            </div>

            {showGameState && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Game State</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyState('game')}
                  >
                    {copiedText === 'game' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded bg-bark p-2 font-mono text-[10px] whitespace-pre-wrap text-sage">
                  {JSON.stringify(
                    {
                      nuts: gameState.nutsTotal,
                      nutsAllTime: gameState.nutsAllTime,
                      squirrels: Object.keys(gameState.squirrels).length,
                      isPaused: gameState.isPaused,
                      tick: gameState.tick,
                    },
                    null,
                    2
                  )}
                </pre>
              </>
            )}

            {showStoryState && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Story State</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyState('story')}
                  >
                    {copiedText === 'story' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded bg-bark p-2 font-mono text-[10px] whitespace-pre-wrap text-sage">
                  {JSON.stringify(
                    {
                      currentEra: storyState.currentEra,
                      storyProgress: storyState.storyProgress,
                      completedCheckpoints: storyState.completedCheckpoints,
                      activeStory: storyState.activeStory,
                    },
                    null,
                    2
                  )}
                </pre>
              </>
            )}
          </section>

          <section className="space-y-1 rounded-lg bg-sage/40 p-3 text-xs">
            <p className="font-bold">Quick Stats</p>
            <p>Nuts: {gameState.nutsTotal.toFixed(2)}</p>
            <p>Squirrels: {Object.keys(gameState.squirrels).length}</p>
            <p>
              Checkpoints: {storyState.completedCheckpoints.length} /{' '}
              {Object.keys(storyState.checkpoints).length}
            </p>
            <p>Paused: {gameState.isPaused ? 'Yes' : 'No'}</p>
            <p>Auto-Save: {autoSaveEnabled ? 'On' : 'Off'}</p>
          </section>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
