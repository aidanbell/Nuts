import {
  type Component,
  Show,
  For,
  createSignal,
  createMemo,
  createEffect,
} from "solid-js";
import {
  appState,
  refreshIdeaCatalog,
  tryResearch,
  canAffordIdea,
  meetsIdeaRequirements,
} from "../../engine";
import type { Idea } from "../../types/ideas";
import { formatNumber } from "../../utils/formatters";
import { ERA_ORDER, eraIndex } from "../../data/eras";
import { IdeaCard } from "./IdeaCard";

const eraOrder = [...ERA_ORDER];

const ScienceTab: Component = () => {
  createEffect(() => {
    void appState.story.currentEra;
    void appState.meta.maxEraAvailable;
    void appState.ideas.researchedCount;
    refreshIdeaCatalog();
  });

  const scienceIdeas = createMemo(() =>
    Object.values(appState.ideas.ideas).filter(
      (idea) => idea.cost.researchResin !== undefined,
    ),
  );
  const visibleIdeas = createMemo(() =>
    scienceIdeas().filter((idea) => idea.visible),
  );
  const researchedIdeas = createMemo(() =>
    scienceIdeas().filter((idea) => idea.researched),
  );
  const researchResin = () => appState.game.resources.researchResin;
  const currentEra = () => appState.story.currentEra;
  const [showResearched, setShowResearched] = createSignal(false);
  const [expandedIdea, setExpandedIdea] = createSignal<string | null>(null);

  const ideasByEra = createMemo(() => {
    return visibleIdeas().reduce(
      (acc, idea) => {
        if (!acc[idea.era]) acc[idea.era] = [];
        acc[idea.era].push(idea);
        return acc;
      },
      {} as Record<string, Idea[]>,
    );
  });

  const erasToShow = createMemo(() => {
    return eraOrder.slice(0, eraIndex(currentEra()) + 1);
  });

  const erasWithIdeas = createMemo(() =>
    erasToShow()
      .map((era) => {
        const eraIdeas = ideasByEra()[era] ?? [];
        if (!eraIdeas.length) return null;
        const filteredIdeas = eraIdeas.filter(
          (idea) => showResearched() || !idea.researched,
        );
        return {
          era,
          eraIdeas,
          filteredIdeas,
          researchedCount: eraIdeas.filter((idea) => idea.researched).length,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  );

  const filteredVisible = createMemo(() =>
    visibleIdeas().filter((idea) => showResearched() || !idea.researched),
  );

  return (
    <div class="tab-panel space-y-5" id="science-content">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <h2 class="section-title">🧪 Science</h2>
        <div class="space-y-1 text-right text-sm">
          <Show when={currentEra()}>
            <p class="muted">
              Era:{" "}
              <strong class="text-bark">
                {currentEra()!.replace("_", " ")}
              </strong>
            </p>
          </Show>
          <p class="muted">
            Researched:{" "}
            <strong class="text-bark">
              {researchedIdeas().length} / {visibleIdeas().length}
            </strong>
          </p>
          <p class="font-semibold">🧪 {formatNumber(researchResin())}</p>
          <label class="flex items-center justify-end gap-2 text-sm">
            Show researched
            <input
              type="checkbox"
              checked={showResearched()}
              onChange={() => setShowResearched(!showResearched())}
              class="size-4 accent-moss"
            />
          </label>
        </div>
      </div>

      <p class="muted text-sm">
        Colony-wide upgrades, priced in Research Resin. Task squirrels to the
        Research Lab from the Jobsites tab to generate it.
      </p>

      <hr class="border-moss/15" />

      <Show when={filteredVisible().length === 0}>
        <div class="panel text-center">
          <p class="text-lg">🔒 No science available yet</p>
          <p class="muted mt-1">
            Research the Scientific Method in the Ideas tab to unlock the
            Research Lab and start generating Research Resin.
          </p>
        </div>
      </Show>

      <For each={erasWithIdeas()}>
        {(entry) => (
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-lg font-bold">
                {entry.era.replace("_", " ")}
              </h3>
              <span
                class={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  entry.researchedCount === entry.eraIdeas.length
                    ? "bg-leaf/25 text-moss"
                    : "bg-sage text-bark"
                }`}
              >
                {entry.researchedCount} / {entry.eraIdeas.length}
              </span>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <For each={entry.filteredIdeas}>
                {(idea) => (
                  <IdeaCard
                    idea={idea}
                    onResearch={() => tryResearch(idea.id)}
                    canAfford={canAffordIdea(idea)}
                    meetsRequirements={meetsIdeaRequirements(idea)}
                    isExpanded={expandedIdea() === idea.id}
                    onToggle={() =>
                      setExpandedIdea(
                        expandedIdea() === idea.id ? null : idea.id,
                      )
                    }
                  />
                )}
              </For>
            </div>
          </section>
        )}
      </For>
    </div>
  );
};

export default ScienceTab;
