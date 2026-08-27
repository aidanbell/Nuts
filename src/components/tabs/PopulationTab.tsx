import type { Component } from "solid-js";

const PopulationTab: Component = () => {
  return (
    <div
      class="tab-panel flex min-h-[50vh] items-center justify-center"
      id="population-content"
    >
      <div class="panel max-w-md text-center">
        <div class="text-5xl">👥</div>
        <h2 class="section-title mt-3">Population Management</h2>
        <p class="muted mt-2">Coming soon...</p>
        <p class="muted mt-1 text-xs">
          Manage your squirrel colony's growth, housing, and social dynamics.
        </p>
      </div>
    </div>
  );
};

export default PopulationTab;
