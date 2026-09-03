import { type Component, Show, For } from "solid-js";
import type { Idea, IdeaCost } from "../../types/ideas";
import { formatNumber } from "../../utils/formatters";

export const categoryStyle: Record<string, string> = {
  unlock: "bg-moss/15 text-moss",
  production: "bg-leaf/20 text-moss",
  efficiency: "bg-amber/15 text-amber",
  capacity: "bg-amber-light/25 text-bark",
  automation: "bg-moss/15 text-moss",
  meta: "bg-danger/15 text-danger",
  wonder: "bg-gold/20 text-gold",
};

export const categoryIcon: Record<string, string> = {
  unlock: "🔓",
  production: "🏭",
  efficiency: "⚡",
  capacity: "👥",
  automation: "🤖",
  meta: "✨",
  wonder: "🏛️",
};

const costIcon: Record<keyof IdeaCost, string> = {
  nuts: "🥜",
  nutwood: "🪵",
  stone: "🪨",
  bronze: "🔶",
  researchResin: "🧪",
};

function costEntries(cost: IdeaCost): [keyof IdeaCost, number][] {
  return (Object.entries(cost) as [keyof IdeaCost, number][]).filter(
    ([, amount]) => (amount ?? 0) > 0,
  );
}

export const getEffectDescription = (idea: Idea): string[] => {
  const effects: string[] = [];
  const e = idea.effects;

  if (e.unlockJobsites) effects.push(`Unlocks: ${e.unlockJobsites.join(", ")}`);
  if (e.unlockBuildings)
    effects.push(`Unlocks: ${e.unlockBuildings.join(", ")}`);
  if (e.unlockRefinement)
    effects.push(`Refinement: ${e.unlockRefinement.join(", ")}`);
  if (e.unlockFeature) effects.push(`Unlocks tab: ${e.unlockFeature}`);
  if (e.setEra) effects.push(`Enter ${e.setEra.replace(/_/g, " ")}`);
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
  if (e.permanentlyPersistIdeas)
    effects.push(`Permanent: ${e.permanentlyPersistIdeas.join(", ")}`);

  return effects;
};

export function researchButtonLabel(
  idea: Idea,
  canAfford: boolean,
  meetsRequirements: boolean,
): string {
  if (idea.researched) return "Researched";
  if (!meetsRequirements) {
    if (idea.requirements?.maxEraAvailable === "WOOD_AGE") {
      return "Survive winter first";
    }
    if (idea.requirements?.ideasResearched?.length) {
      return "Prerequisites needed";
    }
    return "Requirements not met";
  }
  if (canAfford) return "Research";
  if (idea.cost.researchResin) return "Not Enough Research Resin";
  if ((idea.cost.nutwood || 0) > 0) return "Need more resources";
  return "Not Enough Nuts";
}

export interface IdeaCardProps {
  idea: Idea;
  onResearch: () => void;
  canAfford: boolean;
  meetsRequirements: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const IdeaCard: Component<IdeaCardProps> = (props) => (
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
        <span class="text-xl">{categoryIcon[props.idea.category] ?? "💡"}</span>
        <h3 class="font-display text-base font-bold">{props.idea.name}</h3>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1 text-right text-xs font-semibold">
        <Show when={props.idea.researched}>
          <span class="rounded-full bg-leaf/25 px-2 py-0.5 text-moss">✓</span>
        </Show>
        <span
          class={`rounded-full px-2 py-0.5 ${categoryStyle[props.idea.category] ?? "bg-sage text-bark"}`}
        >
          {props.idea.category.charAt(0).toUpperCase()}
        </span>
        <span>
          <For each={costEntries(props.idea.cost)}>
            {([key, amount], i) => (
              <>
                {i() > 0 ? " · " : ""}
                {costIcon[key]} {formatNumber(amount)}
              </>
            )}
          </For>
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
          {researchButtonLabel(
            props.idea,
            props.canAfford,
            props.meetsRequirements,
          )}
        </button>
      </div>
    </Show>
  </div>
);
