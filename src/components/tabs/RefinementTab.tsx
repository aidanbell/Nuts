import { type Component, Show, For } from "solid-js";
import {
  appState,
  craftRefinement,
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
} from "../../engine/state";
import { refinementJobsites } from "../../data/jobsites";
import { formatNumber } from "../../utils/formatters";

const resourceIcon: Record<string, string> = {
  nuts: "🥜",
  nutwood: "🪵",
  stone: "🪨",
  bronze: "🔶",
  iron: "⛓️",
  researchResin: "🧪",
};

const resourceLabel: Record<string, string> = {
  nuts: "nuts",
  nutwood: "NutWood",
  stone: "NutRock",
  bronze: "NutMetal",
  iron: "NutAlloy",
  researchResin: "Research Resin",
};

interface RefineryCardProps {
  jobSiteId: string;
}

const RefineryCard: Component<RefineryCardProps> = (props) => {
  const jobSite = () => appState.game.jobSites.refinement[props.jobSiteId];
  const jobless = () => appState.game.population.jobless;
  const nuts = () => appState.game.nutsTotal;

  const isBuilt = () => (jobSite()?.level ?? 0) >= 1;
  const canAfford = () => {
    const site = jobSite();
    return Boolean(site && nuts() >= site.cost);
  };
  const canAddWorker = () => {
    const site = jobSite();
    return Boolean(
      site &&
      site.level >= 1 &&
      site.workers.length < site.maxSquirrels &&
      jobless().length > 0,
    );
  };
  const canRemoveWorker = () => (jobSite()?.workers.length ?? 0) > 0;

  const handleAddWorker = () => {
    const ids = jobless();
    if (ids.length > 0) assignSquirrelToJobSite(ids[0], props.jobSiteId);
  };
  const handleRemoveWorker = () => {
    const site = jobSite();
    if (site?.workers.length) {
      removeSquirrelFromJobSite(site.workers[0], props.jobSiteId);
    }
  };

  return (
    <Show when={jobSite()}>
      {(site) => (
        <div class="card max-w-xl space-y-3 p-5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="font-display text-lg font-bold">{site().name}</h3>
            <Show
              when={isBuilt()}
              fallback={<span class="muted text-sm">Unbuilt</span>}
            >
              <span class="text-sm font-semibold">
                👥 {site().workers.length}/{site().maxSquirrels} · Lv.
                {site().level}
              </span>
            </Show>
          </div>

          <Show when={site().consumes?.length && site().produces}>
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <For each={site().consumes}>
                {(input, i) => (
                  <>
                    <Show when={i() > 0}>
                      <span class="text-muted">+</span>
                    </Show>
                    <span class="rounded-lg border border-moss/20 bg-white/80 px-3 py-1.5">
                      {resourceIcon[input.resource] ?? "❓"}{" "}
                      <strong>{input.amount}</strong>{" "}
                      {resourceLabel[input.resource] ?? input.resource}
                    </span>
                  </>
                )}
              </For>
              <span class="text-muted">every {site().time / 1000}s →</span>
              <span class="rounded-lg border border-moss/20 bg-white/80 px-3 py-1.5">
                {resourceIcon[site().produces!.resource] ?? "❓"}{" "}
                <strong>{site().produces!.amount}</strong>{" "}
                {resourceLabel[site().produces!.resource] ??
                  site().produces!.resource}
              </span>
              <span class="text-muted">per worker</span>
            </div>
          </Show>

          <p class="muted text-sm">
            Consumed the moment a worker starts a batch — the payout lands
            once the cycle finishes, whether or not you're watching.
          </p>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <Show
              when={isBuilt()}
              fallback={
                <button
                  type="button"
                  class={`btn btn-sm ${canAfford() ? "btn-primary" : "btn-secondary"}`}
                  disabled={!canAfford()}
                  onClick={() => buyJobSiteCapacity(props.jobSiteId)}
                >
                  Build · 🥜 {formatNumber(site().cost)}
                </button>
              }
            >
              <div class="flex gap-2">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  onClick={handleAddWorker}
                  disabled={!canAddWorker()}
                >
                  + Assign
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  onClick={handleRemoveWorker}
                  disabled={!canRemoveWorker()}
                >
                  - Remove
                </button>
              </div>
              <button
                type="button"
                class={`btn btn-sm ${canAfford() ? "btn-primary" : "btn-secondary"}`}
                disabled={!canAfford()}
                onClick={() => buyJobSiteCapacity(props.jobSiteId)}
              >
                Upgrade · 🥜 {formatNumber(site().cost)}
              </button>
            </Show>
          </div>
        </div>
      )}
    </Show>
  );
};

const RefinementTab: Component = () => {
  const nutwoodRefinement = refinementJobsites.find(
    (js) => js.id === "nutwoodRefinement",
  );

  const staffedRefineries = () => Object.keys(appState.game.jobSites.refinement);

  const nutsTotal = () => appState.game.nutsTotal;
  const resources = () => appState.game.resources;

  const consumeType = nutwoodRefinement?.consumes?.[0]?.resource;
  const consumeAmount = nutwoodRefinement?.consumes?.[0]?.amount ?? 0;
  const produceType = nutwoodRefinement?.produces?.resource;
  const produceAmount = nutwoodRefinement?.produces?.amount ?? 0;

  const availableResource = () => {
    if (!consumeType) return 0;
    if (consumeType === "nuts") return nutsTotal();
    return resources()[consumeType as keyof ReturnType<typeof resources>] ?? 0;
  };

  const hasEnoughResources = (times: number = 1) =>
    availableResource() >= consumeAmount * times;

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

          <div class="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              onClick={() => craftRefinement("nutwoodRefinement")}
              disabled={!hasEnoughResources()}
            >
              Craft NutWood
            </button>
            <button
              type="button"
              class="btn btn-secondary btn-lg"
              onClick={() => craftRefinement("nutwoodRefinement", 5)}
              disabled={!hasEnoughResources(5)}
            >
              x5
            </button>
            <button
              type="button"
              class="btn btn-secondary btn-lg"
              onClick={() => craftRefinement("nutwoodRefinement", 10)}
              disabled={!hasEnoughResources(10)}
            >
              x10
            </button>
          </div>

          <Show when={!hasEnoughResources()}>
            <p class="mt-3 text-sm text-danger">
              ⚠️ Not enough {consumeType}! Need{" "}
              {consumeAmount - availableResource()} more.
            </p>
          </Show>
        </div>

        <Show when={staffedRefineries().length > 0}>
          <div>
            <h2 class="section-title">👷 Automated Refineries</h2>
            <p class="muted mt-1">
              Staff these to run on their own — each worker cycles
              independently, paying its cost up front.
            </p>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <For each={staffedRefineries()}>
              {(id) => <RefineryCard jobSiteId={id} />}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default RefinementTab;
