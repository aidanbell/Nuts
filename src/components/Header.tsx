import {
  type Component,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { appState, getEffectiveNps } from "../engine/state";
import { createAnimatedNumber } from "../utils/createAnimatedNumber";
import GameConsole from "./GameConsole";
import {
  formatNumber,
  formatTime,
  formatProductionRate,
} from "../utils/formatters";

const Header: Component = () => {
  const nutsTotal = () => appState.game.nutsTotal;
  const nutsAllTime = () => appState.game.nutsAllTime;
  const timer = () => appState.game.timer;
  const resources = () => appState.game.resources;

  const animatedNuts = createAnimatedNumber(nutsTotal);
  const [bump, setBump] = createSignal(false);
  let lastActual = nutsTotal();

  // Subtle scale bump on meaningful real grants (not every lerp frame)
  createEffect(() => {
    const actual = nutsTotal();
    if (actual > lastActual + 1) {
      setBump(true);
      const timeout = window.setTimeout(() => setBump(false), 200);
      onCleanup(() => clearTimeout(timeout));
    }
    lastActual = actual;
  });

  const hasResources = () => {
    const r = resources();
    return r && (r.nutwood > 0 || r.stone > 0 || r.bronze > 0 || r.iron > 0);
  };

  return (
    <header class="flex flex-col gap-4 lg:flex-row">
      <div class="card flex-1 p-4 md:p-5" id="stats">
        <h1 class="font-display text-2xl font-bold tracking-tight md:text-3xl">
          <span class="mr-2">🥜</span>
          <span
            class="inline-block text-amber transition-transform duration-150"
            classList={{ "scale-105": bump() }}
            id="total"
          >
            {formatNumber(animatedNuts())}
          </span>{" "}
          Nuts
        </h1>
        <p class="mt-1 text-xs text-muted" id="debug-total">
          {Math.round(nutsTotal() * 1000) / 1000}
        </p>
        <p class="mt-2 text-sm text-muted" id="nuts-running">
          All time: {Math.round(nutsAllTime() * 1000) / 1000}
        </p>
        <p class="mt-1 text-sm font-semibold text-bark" id="effective-nps">
          {formatProductionRate(getEffectiveNps())}
        </p>

        <Show when={hasResources()}>
          <div class="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Show when={resources().nutwood > 0}>
              <span>
                🪵{" "}
                <span class="text-amber">
                  {formatNumber(resources().nutwood)}
                </span>
              </span>
            </Show>
            <Show when={resources().stone > 0}>
              <span>
                🪨{" "}
                <span class="text-amber">
                  {formatNumber(resources().stone)}
                </span>
              </span>
            </Show>
            <Show when={resources().bronze > 0}>
              <span>
                🔶{" "}
                <span class="text-amber">
                  {formatNumber(resources().bronze)}
                </span>
              </span>
            </Show>
            <Show when={resources().iron > 0}>
              <span>
                ⚙️{" "}
                <span class="text-amber">{formatNumber(resources().iron)}</span>
              </span>
            </Show>
          </div>
        </Show>

        <p class="mt-3 text-sm font-semibold text-bark" id="clock">
          ⏱️ {formatTime(timer().m, timer().s, timer().ms)}
        </p>
      </div>

      <div class="card flex-1 p-3 md:p-4" id="console">
        <GameConsole />
      </div>
    </header>
  );
};

export default Header;
