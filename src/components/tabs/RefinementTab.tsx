import { type Component, Show } from "solid-js";
import { appState, craftRefinement } from "../../engine/state";
import { refinementJobsites } from "../../data/jobsites";
import { formatNumber } from "../../utils/formatters";

const RefinementTab: Component = () => {
  const nutwoodRefinement = refinementJobsites.find(
    (js) => js.id === "nutwoodRefinement",
  );

  const nutsTotal = () => appState.game.nutsTotal;
  const resources = () => appState.game.resources;

  const consumeType = nutwoodRefinement?.consumes?.resource;
  const consumeAmount = nutwoodRefinement?.consumes?.amount ?? 0;
  const produceType = nutwoodRefinement?.produces?.resource;
  const produceAmount = nutwoodRefinement?.produces?.amount ?? 0;

  const availableResource = () => {
    if (!consumeType) return 0;
    if (consumeType === "nuts") return nutsTotal();
    return resources()[consumeType as keyof ReturnType<typeof resources>] ?? 0;
  };

  const hasEnoughResources = () => availableResource() >= consumeAmount;

  return (
    <Show
      when={
        nutwoodRefinement?.consumes &&
        nutwoodRefinement.produces &&
        consumeType &&
        produceType
      }
      fallback={
        <div class="tab-panel space-y-3">
          <h2 class="section-title">🏭 Refinement</h2>
          <div class="panel">
            <p>No refinements available yet.</p>
          </div>
        </div>
      }
    >
      <div class="tab-panel space-y-4" id="refinement-content">
        <div>
          <h2 class="section-title">🏭 Manual Refinement</h2>
          <p class="muted mt-1">
            Refine raw materials into useful resources. Later you'll unlock
            automated refineries.
          </p>
        </div>

        <div class="card max-w-xl p-5">
          <h3 class="font-display text-lg font-bold">🪵 Craft NutWood</h3>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <div
              class={[
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                hasEnoughResources()
                  ? "border-moss/20 bg-white/80"
                  : "border-danger/40 bg-danger/10 text-danger",
              ].join(" ")}
            >
              {consumeType === "nuts" ? "🥜" : "❓"}
              <strong>{consumeAmount}</strong> {consumeType}
              <span class="text-xs text-muted">
                ({formatNumber(availableResource())} available)
              </span>
            </div>
            <span class="text-xl text-muted">→</span>
            <div class="flex items-center gap-2 rounded-lg border border-moss/20 bg-white/80 px-3 py-2 text-sm">
              🪵 <strong>{produceAmount}</strong> {produceType}
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-lg mt-4"
            onClick={() => craftRefinement("nutwoodRefinement")}
            disabled={!hasEnoughResources()}
          >
            Craft NutWood
          </button>

          <Show when={!hasEnoughResources()}>
            <p class="mt-3 text-sm text-danger">
              ⚠️ Not enough {consumeType}! Need{" "}
              {consumeAmount - availableResource()} more.
            </p>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default RefinementTab;
