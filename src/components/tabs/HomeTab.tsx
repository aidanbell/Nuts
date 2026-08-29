import { type Component, Show, For } from "solid-js";
import { appState, setEra, canEnterEra } from "../../engine/state";
import SquirrelDisplay from "../SquirrelDisplay";

const HomeTab: Component = () => {
  const joblessSquirrels = () => appState.game.population.jobless;
  const currentEra = () => appState.story.currentEra;
  const unlockedTabs = () => appState.game.unlockedTabs;
  const nutsTotal = () => appState.game.nutsTotal;
  const seasonIndex = () => appState.meta.seasonIndex;
  const winterIncoming = () => appState.meta.winterIncoming;

  const handleAdvanceEra = () => {
    if (currentEra() === "PREHISTORY") {
      setEra("WOOD_AGE");
    }
  };

  const erasUnlocked = () => unlockedTabs().includes("eras");
  const canAdvanceToWoodAge = () =>
    erasUnlocked() && currentEra() === "PREHISTORY" && canEnterEra("WOOD_AGE");
  const woodAgeTeased = () =>
    erasUnlocked() && currentEra() === "PREHISTORY" && !canEnterEra("WOOD_AGE");

  return (
    <div class="tab-panel space-y-6" id="home-content">
      <Show when={seasonIndex() > 0 || winterIncoming()}>
        <p class="muted text-sm">
          Season {seasonIndex() + 1}
          <Show when={winterIncoming()}>
            {" "}
            · <span class="font-semibold text-amber">Winter closing in</span>
          </Show>
        </p>
      </Show>

      <Show when={erasUnlocked()}>
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
                you&apos;re ready to advance.
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

          <Show when={woodAgeTeased()}>
            <div class="panel border-amber/30 bg-amber/10">
              <h3 class="font-display text-lg font-bold">
                🌳 Dreams of the Wood Age
              </h3>
              <p class="muted mt-2">
                You can almost taste NutWood tools and taller dens — but winter
                will wipe this clearing first. Hibernate, keep your Gold Nuts,
                and chase the Wood Age next spring.
              </p>
              <p class="mt-3 text-sm font-semibold text-amber">
                Survive your first winter to unlock this era.
              </p>
            </div>
          </Show>
        </section>
      </Show>

      <section>
        <h2 class="section-title">Population</h2>
        <p class="muted mt-1">{joblessSquirrels().length} jobless squirrels</p>
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
