import { type Component, For, Show, createSignal } from "solid-js";
import {
  appState,
  addNuts,
  createSquirrel,
  hibernate,
  pauseGame,
  resumeGame,
  resetCheckpoints,
  loadSaveData,
} from "../engine/state";
import { clearSave, saveGame, loadGame } from "../engine/saveSystem";
import {
  type SaveSlotMeta,
  listSaveSlots,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
} from "../utils/saveSlots";
import { formatEraName } from "../data/eras";
import { formatNumber } from "../utils/formatters";

const DebugPanel: Component = () => {
  const gameState = () => appState.game;
  const storyState = () => appState.story;

  const [isOpen, setIsOpen] = createSignal(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = createSignal(
    localStorage.getItem("debug_autosave_enabled") !== "false",
  );
  const [showGameState, setShowGameState] = createSignal(false);
  const [showStoryState, setShowStoryState] = createSignal(false);
  const [copiedText, setCopiedText] = createSignal("");
  const [saveSlots, setSaveSlots] = createSignal<SaveSlotMeta[]>(
    listSaveSlots(),
  );
  const [newSlotName, setNewSlotName] = createSignal("");

  const handleSaveSlot = () => {
    const meta = saveToSlot(newSlotName());
    if (meta) {
      setSaveSlots(listSaveSlots());
      setNewSlotName("");
    } else {
      alert("Failed to save slot!");
    }
  };

  const handleLoadSlot = (id: string) => {
    if (!window.confirm("Load this save state? Current progress is lost unless saved.")) {
      return;
    }
    if (loadFromSlot(id)) {
      alert("Save state loaded!");
    } else {
      alert("Failed to load save state!");
    }
  };

  const handleDeleteSlot = (id: string) => {
    if (!window.confirm("Delete this save state? This cannot be undone.")) return;
    deleteSlot(id);
    setSaveSlots(listSaveSlots());
  };

  const handleAutoSaveToggle = () => {
    const next = !autoSaveEnabled();
    setAutoSaveEnabled(next);
    localStorage.setItem("debug_autosave_enabled", next.toString());
  };

  const handleClearSave = () => {
    if (window.confirm("⚠️ This will delete ALL saved data. Are you sure?")) {
      clearSave();
      alert("Save data cleared! Refresh the page to start fresh.");
    }
  };

  const handleResetGame = () => {
    if (
      window.confirm(
        "⚠️ This will reset the current game session (not saved data). Continue?",
      )
    ) {
      resetCheckpoints();
      window.location.reload();
    }
  };

  const handleManualSave = () => {
    saveGame();
    alert("Game saved manually!");
  };

  const handleManualLoad = () => {
    const data = loadGame();
    if (data) {
      loadSaveData(data);
      alert("Game loaded!");
    } else {
      alert("No save data found!");
    }
  };

  const handleExportSave = () => {
    try {
      const saveData = loadGame();
      if (!saveData) {
        alert("No save data to export!");
        return;
      }
      const json = JSON.stringify(saveData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nuts-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export save!");
      console.error(error);
    }
  };

  const handleCopyState = (stateType: "game" | "story") => {
    const state = stateType === "game" ? gameState() : storyState();
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    setCopiedText(stateType);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleTogglePause = () => {
    if (gameState().isPaused) resumeGame();
    else pauseGame();
  };

  const handleHibernate = () => {
    if (window.confirm("Hibernate now? This will reset your progress.")) {
      hibernate();
    }
  };

  return (
    <div
      class={[
        "fixed right-0 bottom-0 z-[10000] overflow-hidden border-2 border-r-0 border-b-0 border-danger bg-paper shadow-xl transition-all",
        isOpen()
          ? "max-h-[80vh] w-[min(100vw,400px)] rounded-tl-xl"
          : "h-14 w-14 rounded-tl-xl",
      ].join(" ")}
    >
      <button
        type="button"
        class="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full bg-danger text-lg text-white hover:scale-110"
        onClick={() => setIsOpen(!isOpen())}
      >
        {isOpen() ? "✕" : "🐛"}
      </button>

      <Show when={isOpen()}>
        <div class="max-h-[80vh] space-y-3 overflow-y-auto p-4 pt-14">
          <div class="flex items-center gap-2">
            <h3 class="font-display text-lg font-bold">🐛 Debug Panel</h3>
            <span class="rounded bg-danger/15 px-2 py-0.5 text-xs font-bold text-danger">
              DEV
            </span>
          </div>

          <hr class="border-moss/15" />

          <section class="space-y-2 rounded-lg bg-sage/40 p-3">
            <p class="text-sm font-bold">Auto-Save</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class={`btn btn-sm ${autoSaveEnabled() ? "btn-success" : "btn-danger"}`}
                onClick={handleAutoSaveToggle}
              >
                {autoSaveEnabled() ? "✓ Enabled" : "✕ Disabled"}
              </button>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                onClick={handleManualSave}
              >
                Save Now
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                onClick={handleManualLoad}
              >
                Load
              </button>
            </div>
          </section>

          <section class="space-y-2 rounded-lg bg-sage/40 p-3">
            <p class="text-sm font-bold">Save Data</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="btn btn-danger btn-sm"
                onClick={handleClearSave}
              >
                🗑️ Clear Save
              </button>
              <button
                type="button"
                class="btn btn-warning btn-sm"
                onClick={handleResetGame}
              >
                🔄 Reset Game
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                onClick={handleExportSave}
              >
                💾 Export
              </button>
            </div>
          </section>

          <section class="space-y-2 rounded-lg bg-sage/40 p-3">
            <p class="text-sm font-bold">Save States</p>
            <p class="text-xs text-muted">
              Snapshots for playtesting — jump back to a stage of progression
              without replaying from scratch.
            </p>
            <div class="flex gap-2">
              <input
                type="text"
                class="min-w-0 flex-1 rounded border border-moss/30 bg-paper px-2 py-1 text-xs"
                placeholder="e.g. Wood Age start"
                value={newSlotName()}
                onInput={(e) => setNewSlotName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSlot();
                }}
              />
              <button
                type="button"
                class="btn btn-primary btn-sm shrink-0"
                onClick={handleSaveSlot}
              >
                💾 Save Slot
              </button>
            </div>

            <Show
              when={saveSlots().length > 0}
              fallback={<p class="text-xs text-muted">No save states yet.</p>}
            >
              <ul class="space-y-1">
                <For each={saveSlots()}>
                  {(slot) => (
                    <li class="flex items-center justify-between gap-2 rounded bg-paper px-2 py-1 text-xs">
                      <div class="min-w-0">
                        <p class="truncate font-semibold">{slot.name}</p>
                        <p class="text-muted">
                          {formatEraName(slot.era)} · S{slot.season + 1} ·{" "}
                          {formatNumber(slot.nuts)} nuts ·{" "}
                          {new Date(slot.savedAt).toLocaleString()}
                        </p>
                      </div>
                      <div class="flex shrink-0 gap-1">
                        <button
                          type="button"
                          class="btn btn-secondary btn-sm"
                          onClick={() => handleLoadSlot(slot.id)}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          class="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </section>

          <section class="space-y-2 rounded-lg bg-sage/40 p-3">
            <p class="text-sm font-bold">Game Controls</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class={`btn btn-sm ${gameState().isPaused ? "btn-success" : "btn-warning"}`}
                onClick={handleTogglePause}
              >
                {gameState().isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </button>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                onClick={() => createSquirrel()}
              >
                🐿️ +1 Squirrel
              </button>
              <button
                type="button"
                class="btn btn-success btn-sm"
                onClick={() => addNuts(100)}
              >
                🥜 +100
              </button>
              <button
                type="button"
                class="btn btn-success btn-sm"
                onClick={() => addNuts(10000)}
              >
                🥜 +10k
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm w-full"
                onClick={handleHibernate}
              >
                💤 Hibernate Now
              </button>
            </div>
          </section>

          <section class="space-y-2 rounded-lg bg-sage/40 p-3">
            <p class="text-sm font-bold">State Inspector</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class={`btn btn-sm ${showGameState() ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setShowGameState(!showGameState())}
              >
                {showGameState() ? "Hide" : "Show"} Game
              </button>
              <button
                type="button"
                class={`btn btn-sm ${showStoryState() ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setShowStoryState(!showStoryState())}
              >
                {showStoryState() ? "Hide" : "Show"} Story
              </button>
            </div>

            <Show when={showGameState()}>
              <>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">Game State</span>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    onClick={() => handleCopyState("game")}
                  >
                    {copiedText() === "game" ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <pre class="max-h-48 overflow-auto rounded bg-bark p-2 font-mono text-[10px] whitespace-pre-wrap text-sage">
                  {JSON.stringify(
                    {
                      nuts: gameState().nutsTotal,
                      nutsAllTime: gameState().nutsAllTime,
                      squirrels: Object.keys(gameState().squirrels).length,
                      isPaused: gameState().isPaused,
                      tick: gameState().tick,
                    },
                    null,
                    2,
                  )}
                </pre>
              </>
            </Show>

            <Show when={showStoryState()}>
              <>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">Story State</span>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    onClick={() => handleCopyState("story")}
                  >
                    {copiedText() === "story" ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <pre class="max-h-48 overflow-auto rounded bg-bark p-2 font-mono text-[10px] whitespace-pre-wrap text-sage">
                  {JSON.stringify(
                    {
                      currentEra: storyState().currentEra,
                      storyProgress: storyState().storyProgress,
                      completedCheckpoints: storyState().completedCheckpoints,
                      activeStory: storyState().activeStory,
                    },
                    null,
                    2,
                  )}
                </pre>
              </>
            </Show>
          </section>

          <section class="space-y-1 rounded-lg bg-sage/40 p-3 text-xs">
            <p class="font-bold">Quick Stats</p>
            <p>Nuts: {gameState().nutsTotal.toFixed(2)}</p>
            <p>Squirrels: {Object.keys(gameState().squirrels).length}</p>
            <p>
              Checkpoints: {storyState().completedCheckpoints.length} /{" "}
              {Object.keys(storyState().checkpoints).length}
            </p>
            <p>Paused: {gameState().isPaused ? "Yes" : "No"}</p>
            <p>Auto-Save: {autoSaveEnabled() ? "On" : "Off"}</p>
          </section>
        </div>
      </Show>
    </div>
  );
};

export default DebugPanel;
