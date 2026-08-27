import { type Component, Show, For } from "solid-js";
import { appState, setEra } from "../../engine/state";
import SquirrelDisplay from "../SquirrelDisplay";

const HomeTab: Component = () => {
  const joblessSquirrels = () => appState.game.population.jobless;
  const currentEra = () => appState.story.currentEra;
  const unlockedTabs = () => appState.game.unlockedTabs;
  const nutsTotal = () => appState.game.nutsTotal;

  const handleAdvanceEra = () => {
    if (currentEra() === "PREHISTORY") {
      setEra("WOOD_AGE");
    }
  };

  const canAdvanceToWoodAge = () =>
    unlockedTabs().includes("eras") && currentEra() === "PREHISTORY";

  return (
    <div class="tab-panel space-y-6" id="home-content">
      <Show when={unlockedTabs().includes("eras")}>
        <section class="space-y-3">
          <h2 class="section-title">Current Era</h2>
          <p class="font-display text-lg font-semibold">
            {currentEra()?.replace(/_/g, " ") || "PREHISTORY"}
          </p>

          <Show when={canAdvanceToWoodAge()}>
            <div class="panel border-leaf/30 bg-leaf/10">
              <h3 class="font-display text-lg font-bold">
                🌳 The Wood Age Awaits
              </h3>
              <p class="muted mt-2">
                Your squirrels have discovered refined materials! Choose when
                you're ready to advance.
              </p>
              <p class="muted mt-2">
                <strong>Tip:</strong> Gather more nuts before advancing. Current
                nuts: {nutsTotal().toLocaleString()}
              </p>
              <button
                type="button"
                class="btn btn-success btn-lg mt-4"
                onClick={handleAdvanceEra}
              >
                Advance to Wood Age →
              </button>
            </div>
          </Show>
        </section>
      </Show>

      <section>
        <h2 class="section-title">Population</h2>
        <p class="muted mt-1">
          {joblessSquirrels().length} jobless squirrels
        </p>
        <div class="mt-3 flex flex-wrap justify-center gap-2" id="jobless">
          <For each={joblessSquirrels()}>
            {(squirrelId) => (
              <SquirrelDisplay squirrelId={squirrelId} showNutFinding />
            )}
          </For>
        </div>
      </section>
    </div>
  );
};

export default HomeTab;
