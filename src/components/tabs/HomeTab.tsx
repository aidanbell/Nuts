import { type Component, Show, For } from "solid-js";
import { appState } from "../../engine/state";
import SquirrelDisplay from "../SquirrelDisplay";

const HomeTab: Component = () => {
  const joblessSquirrels = () => appState.game.population.jobless;
  const currentEra = () => appState.story.currentEra;
  const seasonIndex = () => appState.meta.seasonIndex;
  const winterIncoming = () => appState.meta.winterIncoming;
  const maxEra = () => appState.meta.maxEraAvailable;

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

      <section class="space-y-2">
        <h2 class="section-title">Current Era</h2>
        <p class="font-display text-lg font-semibold">
          {(currentEra() || "PREHISTORY").replace(/_/g, " ")}
        </p>
        <Show
          when={
            (currentEra() || "PREHISTORY") === "PREHISTORY" &&
            maxEra() === "WOOD_AGE" &&
            seasonIndex() >= 2
          }
        >
          <p class="muted text-sm">
            Wood Age is within reach — craft NutWood and research{" "}
            <strong class="text-bark">The Wood Age</strong> in Ideas.
          </p>
        </Show>
        <Show
          when={
            (currentEra() || "PREHISTORY") === "PREHISTORY" &&
            maxEra() === "WOOD_AGE" &&
            seasonIndex() === 1
          }
        >
          <p class="muted text-sm">
            Scavenger routes and NutWood craft are open. Stockpile wood —
            another winter will come before you can commit to the Wood Age.
          </p>
        </Show>
        <Show
          when={
            (currentEra() || "PREHISTORY") === "PREHISTORY" &&
            maxEra() === "PREHISTORY"
          }
        >
          <p class="muted text-sm">
            Survive your first winter to unlock Scavenger routes and NutWood
            craft.
          </p>
        </Show>
      </section>

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
