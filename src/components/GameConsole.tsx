/**
 * Game log console with auto-scroll.
 */

import { type Component, createEffect, For, Show } from "solid-js";
import { appState } from "../engine/state";

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

const GameConsole: Component = () => {
  const logs = () => appState.gameLog.logs;

  let consoleEndRef: HTMLDivElement | undefined;

  createEffect(() => {
    logs();
    consoleEndRef?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div class="max-h-48 overflow-y-auto rounded-lg bg-bark/90 p-3 font-mono text-xs text-sage md:max-h-52">
      <Show
        when={logs().length > 0}
        fallback={<p class="text-sage/50">No logs yet...</p>}
      >
        <For each={logs()}>
          {(log) => (
            <div class={`py-0.5 ${levelClass[log.level] ?? "text-sage"}`}>
              <span class="mr-2 opacity-70">
                {levelPrefix[log.level] ?? "\u203a"}
              </span>
              {log.message}
            </div>
          )}
        </For>
      </Show>
      <div ref={(el) => (consoleEndRef = el)} />
    </div>
  );
};

export default GameConsole;
