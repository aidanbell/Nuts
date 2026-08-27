import { type Component, Show, For, createSignal, createMemo } from "solid-js";
import { createIdeas } from "../../engine/primitives";
import { appState } from "../../engine/state";
import type { Idea } from "../../types/ideas";
import { formatNumber } from "../../utils/formatters";

const categoryStyle: Record<string, string> = {
  production: "bg-leaf/20 text-moss",
  efficiency: "bg-amber/15 text-amber",
  capacity: "bg-amber-light/25 text-bark",
  automation: "bg-moss/15 text-moss",
  meta: "bg-danger/15 text-danger",
};

const categoryIcon: Record<string, string> = {
  production: "🏭",
  efficiency: "⚡",
  capacity: "👥",
  automation: "🤖",
  meta: "✨",
};

const getEffectDescription = (idea: Idea): string[] => {
  const effects: string[] = [];
  const e = idea.effects;

  if (e.unlockJobsites) effects.push(`Unlocks: ${e.unlockJobsites.join(", ")}`);
  if (e.unlockBuildings)
    effects.push(`Unlocks: ${e.unlockBuildings.join(", ")}`);
  if (e.globalEfficiency)
    effects.push(
      `+${(e.globalEfficiency * 100).toFixed(0)}% Global Efficiency`,
    );
  if (e.unlockSquirrelCapacity)
    effects.push(`+${e.unlockSquirrelCapacity} Squirrel Capacity`);
  if (e.reduceJobsiteCost)
    effects.push(`-${(e.reduceJobsiteCost * 100).toFixed(0)}% Jobsite Costs`);
  if (e.upgradeJobsite) {
    effects.push(
      `+${e.upgradeJobsite.amount} ${e.upgradeJobsite.property} ${e.upgradeJobsite.jobsiteId}`,
    );
  }

  return effects;
};

interface IdeaCardProps {
  idea: Idea;
  onResearch: () => void;
  canAfford: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function researchButtonLabel(idea: Idea, canAfford: boolean): string {
  if (idea.researched) return "Researched";
  if (canAfford) return "Research";
  return "Not Enough Nuts";
}

const IdeaCard: Component<IdeaCardProps> = (props) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => props.onToggle()}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") props.onToggle();
    }}
    class={[
      "cursor-pointer rounded-xl border-2 p-4 transition hover:-translate-y-0.5",
      props.canAfford && !props.idea.researched ? "opacity-100" : "opacity-70",
      props.isExpanded
        ? "border-moss bg-sage/40"
        : "border-moss/15 bg-white/70 hover:border-moss/40",
    ].join(" ")}
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-2">
        <span
          class={`inline-block text-sm transition ${props.isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
        <span class="text-xl">
          {categoryIcon[props.idea.category] ?? "💡"}
        </span>
        <h3 class="font-display text-base font-bold">{props.idea.name}</h3>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1 text-right text-xs font-semibold">
        <Show when={props.idea.researched}>
          <span class="rounded-full bg-leaf/25 px-2 py-0.5 text-moss">
            ✓
          </span>
        </Show>
        <span
          class={`rounded-full px-2 py-0.5 ${categoryStyle[props.idea.category] ?? "bg-sage text-bark"}`}
        >
          {props.idea.category.charAt(0).toUpperCase()}
        </span>
        <span>
          🥜 {formatNumber(props.idea.cost.nuts || 0)}
          <Show when={props.idea.cost.nutwood}>
            {` · 🪵 ${formatNumber(props.idea.cost.nutwood!)}`}
          </Show>
          <Show when={props.idea.cost.stone}>
            {` · 🪨 ${formatNumber(props.idea.cost.stone!)}`}
          </Show>
        </span>
      </div>
    </div>

    <Show when={props.isExpanded}>
      <div class="mt-3 space-y-3 border-t border-moss/10 pt-3">
        <p class="muted">{props.idea.description}</p>
        <div>
          <p class="text-sm font-semibold">Effects</p>
          <ul class="mt-1 space-y-0.5 text-sm text-muted">
            <For each={getEffectDescription(props.idea)}>
              {(effect) => <li>• {effect}</li>}
            </For>
          </ul>
        </div>
        <button
          type="button"
          class={`btn btn-sm ${props.canAfford && !props.idea.researched ? "btn-primary" : "btn-secondary"}`}
          disabled={props.idea.researched || !props.canAfford}
          onClick={(e) => {
            e.stopPropagation();
            props.onResearch();
          }}
        >
          {researchButtonLabel(props.idea, props.canAfford)}
        </button>
      </div>
    </Show>
  </div>
);

const eraOrder = [
  "PREHISTORY",
  "WOOD_AGE",
  "STONE_AGE",
  "BRONZE_AGE",
  "IRON_AGE",
  "INDUSTRIAL_AGE",
  "INFORMATION_AGE",
  "TECHNOLOGY_AGE",
  "SPACE_AGE",
  "GALACTIC_AGE",
];

const IdeasTab: Component = () => {
  const { visibleIdeas, researchedIdeas, canAfford, research } = createIdeas();
  const nutsTotal = () => appState.game.nutsTotal;
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
    const currentEraIndex = eraOrder.indexOf(currentEra() || "PREHISTORY");
    return eraOrder.slice(0, currentEraIndex + 1);
  });

  const filteredVisible = createMemo(() =>
    visibleIdeas().filter((idea) => showResearched() || !idea.researched),
  );

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

  return (
    <div class="tab-panel space-y-5" id="ideas-content">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <h2 class="section-title">💡 Ideas & Research</h2>
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
          <p class="font-semibold">🥜 {formatNumber(nutsTotal())}</p>
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

      <hr class="border-moss/15" />

      <Show when={filteredVisible().length === 0}>
        <div class="panel text-center">
          <p class="text-lg">🔒 No ideas available yet</p>
          <p class="muted mt-1">
            Keep gathering nuts and growing your colony to unlock research.
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
                    onResearch={() => research(idea.id)}
                    canAfford={canAfford(idea)}
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

export default IdeasTab;
