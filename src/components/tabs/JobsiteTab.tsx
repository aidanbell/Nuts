import { type Component, Show, For, createSignal } from "solid-js";
import {
  appState,
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
  retireJobsite,
  isProductionRosterFull,
} from "../../engine/state";
import { formatNumber, formatProductionRate } from "../../utils/formatters";
import SquirrelDisplay from "../SquirrelDisplay";

interface JobSiteCardProps {
  jobSiteId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const JobSiteCard: Component<JobSiteCardProps> = (props) => {
  const jobSite = () =>
    appState.game.jobSites.production[props.jobSiteId] ||
    appState.game.jobSites.refinement[props.jobSiteId];
  const nuts = () => appState.game.nutsTotal;
  const jobless = () => appState.game.population.jobless;

  const handleBuy = (e: MouseEvent) => {
    e.stopPropagation();
    buyJobSiteCapacity(props.jobSiteId);
  };

  const handleAddWorker = (e: MouseEvent) => {
    e.stopPropagation();
    const ids = jobless();
    if (ids.length > 0) {
      assignSquirrelToJobSite(ids[0], props.jobSiteId);
    }
  };

  const handleRemoveWorker = (e: MouseEvent) => {
    e.stopPropagation();
    const site = jobSite();
    if (site?.workers && site.workers.length > 0) {
      removeSquirrelFromJobSite(site.workers[0], props.jobSiteId);
    }
  };

  const isMaxed = () => {
    const site = jobSite();
    return Boolean(site?.maxLevel !== undefined && site.level >= site.maxLevel);
  };

  const isBuilt = () => {
    const site = jobSite();
    return Boolean(site && site.level >= 1);
  };

  const blockedByRoster = () => {
    const site = jobSite();
    return Boolean(
      site &&
      site.type === "production" &&
      !isBuilt() &&
      isProductionRosterFull(),
    );
  };

  const canAfford = () => {
    const site = jobSite();
    return Boolean(
      site && !isMaxed() && !blockedByRoster() && nuts() >= site.cost,
    );
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

  const upgradeLabel = () => {
    if (isMaxed()) return "Maxed";
    if (blockedByRoster()) return "Roster Full";
    if (!isBuilt()) return "Build";
    return "Upgrade";
  };

  const canRetire = () => {
    const site = jobSite();
    return Boolean(site && site.type === "production" && isBuilt());
  };

  const handleRetire = (e: MouseEvent) => {
    e.stopPropagation();
    retireJobsite(props.jobSiteId);
  };

  const canRemoveWorker = () => {
    const site = jobSite();
    return Boolean(site && site.workers.length > 0);
  };

  const totalRate = () => {
    const site = jobSite();
    if (!site || site.level < 1) return 0;
    const goldMulti = appState.meta.goldForageMulti;
    return (
      (site.baseProduction + site.squirrelBonus * site.workers.length) *
      site.multi *
      goldMulti
    );
  };

  return (
    <Show when={jobSite()}>
      {(site) => (
        <div
          role="button"
          tabIndex={0}
          onClick={() => props.onToggle()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") props.onToggle();
          }}
          class={[
            "cursor-pointer rounded-xl border-2 p-4 transition hover:-translate-y-0.5",
            props.isExpanded
              ? "border-moss bg-sage/40"
              : "border-moss/15 bg-white/70 hover:border-moss/40",
          ].join(" ")}
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span
                class={`inline-block transition ${props.isExpanded ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▼
              </span>
              <span class="font-display text-lg font-semibold">
                {site().name}
              </span>
            </div>
            <div class="flex gap-3 text-sm font-semibold">
              <Show
                when={isBuilt()}
                fallback={<span class="muted">Unbuilt</span>}
              >
                <span>
                  👥 {site().workers.length}/{site().maxSquirrels}
                </span>
                <span>Lv.{site().level}</span>
              </Show>
            </div>
          </div>

          <Show when={props.isExpanded}>
            <div class="mt-4 space-y-3 border-t border-moss/10 pt-4">
              <div class="flex flex-wrap gap-6">
                <Show
                  when={isBuilt()}
                  fallback={
                    <p class="muted">
                      Build this site before you can staff it.
                    </p>
                  }
                >
                  <div>
                    <p class="muted">Total Production</p>
                    <p class="font-display text-xl font-bold">
                      {formatProductionRate(totalRate())}
                    </p>
                  </div>
                  <div>
                    <p class="muted">Base</p>
                    <p>
                      {formatProductionRate(
                        site().baseProduction *
                          site().multi *
                          appState.meta.goldForageMulti,
                      )}
                    </p>
                  </div>
                  <div>
                    <p class="muted">Per Squirrel</p>
                    <p>
                      +
                      {formatProductionRate(
                        site().squirrelBonus *
                          site().multi *
                          appState.meta.goldForageMulti,
                      )}
                    </p>
                  </div>
                </Show>
              </div>

              <div class="flex flex-wrap items-end justify-between gap-3">
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
                  <Show when={canRetire()}>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      onClick={handleRetire}
                    >
                      Retire
                    </button>
                  </Show>
                </div>
                <div class="text-right">
                  <button
                    type="button"
                    class={`btn btn-sm ${canAfford() ? "btn-primary" : "btn-secondary"}`}
                    onClick={handleBuy}
                    disabled={!canAfford()}
                  >
                    {upgradeLabel()}
                  </button>
                  <Show when={!isMaxed()}>
                    <p class="mt-1 text-sm font-semibold">
                      🥜 {formatNumber(site().cost)}
                    </p>
                  </Show>
                  <Show when={blockedByRoster()}>
                    <p class="muted mt-1 text-xs">
                      Roster full — retire a site to build this one.
                    </p>
                  </Show>
                </div>
              </div>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
};

const JobsiteTab: Component = () => {
  const [expandedJobSite, setExpandedJobSite] = createSignal<string | null>(
    null,
  );

  const jobSiteArray = () => [
    ...Object.values(appState.game.jobSites.production),
    ...Object.values(appState.game.jobSites.refinement),
  ];

  const population = () => appState.game.population;

  return (
    <div class="tab-panel space-y-6" id="jobsite-content">
      <section>
        <h2 class="section-title">👷 Available Workers</h2>
        <div class="mt-3 flex flex-wrap justify-center gap-2">
          <For each={population().jobless}>
            {(squirrelId) => (
              <SquirrelDisplay squirrelId={squirrelId} showNutFinding={false} />
            )}
          </For>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="font-display text-lg font-bold">🏭 Job Sites</h3>
        <For each={jobSiteArray()}>
          {(jobSite) => (
            <JobSiteCard
              jobSiteId={jobSite.id}
              isExpanded={expandedJobSite() === jobSite.id}
              onToggle={() =>
                setExpandedJobSite(
                  expandedJobSite() === jobSite.id ? null : jobSite.id,
                )
              }
            />
          )}
        </For>
      </section>
    </div>
  );
};

export default JobsiteTab;
