/**
 * GameConsole Component - SolidJS Version
 *
 * Displays game log messages with different log levels.
 * Auto-scrolls to bottom when new logs are added.
 *
 * Migration notes:
 * - Replaced React.FC with SolidJS Component type
 * - Replaced useSelector with direct appState access
 * - Replaced useRef with ref from solid-js/web (or let ref)
 * - Replaced .map() with SolidJS <For> for efficient list rendering
 * - Replaced useEffect with createEffect
 * - All styling and log level handling preserved
 *
 * TODO: AGENT - Consider using <Index> for better performance with static lists
 */

import {
  type Component,
  createEffect,
  onCleanup,
  For,
  createSignal,
  onMount,
} from "solid-js";
import { appState } from "../engine/state";

// Log level styling
const levelClass: Record<string, string> = {
  success: "text-leaf",
  warning: "text-amber-light",
  error: "text-danger",
  info: "text-sage",
};

const levelPrefix: Record<string, string> = {
  success: "\u2713",
  warning: "\u26a0",
  error: "\u2717",
  info: "\u203a",
};

/**
 * GameConsole - Displays game log messages
 *
 * Features:
 * - Color-coded messages by log level
 * - Icons for each log level
 * - Auto-scroll to bottom on new messages
 * - Shows "No logs yet..." when empty
 */
const GameConsole: Component = () => {
  // Access logs from SolidJS store
  const logs = () => appState.gameLog.logs;

  // Reference to console end for auto-scrolling
  let consoleEndRef: HTMLDivElement | undefined;

  // Auto-scroll to bottom when logs change
  createEffect(() => {
    logs(); // Track logs dependency
    consoleEndRef?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="max-h-48 overflow-y-auto rounded-lg bg-bark/90 p-3 font-mono text-xs text-sage md:max-h-52">
      {logs().length === 0 ? (
        <p className="text-sage/50">No logs yet...</p>
      ) : (
        <For each={logs()}>
          {(log) => (
            <div className={`py-0.5 ${levelClass[log.level] ?? "text-sage"}`}>
              <span className="mr-2 opacity-70">
                {levelPrefix[log.level] ?? "\u203a"}
              </span>
              {log.message}
            </div>
          )}
        </For>
      )}
      <div ref={consoleEndRef} />
    </div>
  );
};

export default GameConsole;
