import type { Component } from "solid-js";
import { appState, getSquirrelCap } from "../../engine/state";

const BuildingsTab: Component = () => {
  const squirrelCount = () => Object.keys(appState.game.squirrels).length;
  const cap = () => getSquirrelCap();

  return (
    <div
      class="tab-panel flex min-h-[50vh] items-center justify-center"
      id="buildings-content"
    >
      <div class="panel max-w-md text-center">
        <div class="text-5xl" aria-hidden>
          🏠
        </div>
        <h2 class="section-title mt-3">Buildings</h2>
        <p class="muted mt-2">
          The clearing is full. Dens, workshops, and other structures will live
          here.
        </p>
        <p class="mt-4 text-sm font-semibold">
          Colony: {squirrelCount()} / {cap()}
        </p>
        <p class="muted mt-1 text-xs">
          Housing and buff buildings — coming soon.
        </p>
      </div>
    </div>
  );
};

export default BuildingsTab;
