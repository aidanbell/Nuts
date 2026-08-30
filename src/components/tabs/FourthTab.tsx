import type { Component } from "solid-js";

const FourthTab: Component = () => {
  return (
    <div
      class="tab-panel flex min-h-[50vh] items-center justify-center"
      id="fourth-content"
    >
      <div class="panel max-w-md text-center">
        <div class="text-5xl">🚧</div>
        <h2 class="section-title mt-3">Coming Soon</h2>
        <p class="muted mt-2">This tab is under construction.</p>
      </div>
    </div>
  );
};

export default FourthTab;
