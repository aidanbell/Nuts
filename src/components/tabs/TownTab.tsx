import { type Component, Show } from "solid-js";
import {
  appState,
  getSquirrelCap,
  getSettlementLabel,
  canBuildWoodenHouse,
  buildWoodenHouse,
  isTownBuildingUnlocked,
  canBuildBonfire,
  buildBonfire,
  canUpgradeBonfire,
  upgradeBonfire,
} from "../../engine/state";
import {
  WOODEN_HOUSE,
  BONFIRE,
  BONFIRE_UPGRADES_ID,
  getWoodenHouseCost,
  getBonfireStats,
  getBonfireUpgradeCost,
} from "../../data/town";
import { eraIndex } from "../../data/eras";
import { formatNumber } from "../../utils/formatters";

const TownTab: Component = () => {
  const squirrelCount = () => Object.keys(appState.game.squirrels).length;
  const cap = () => getSquirrelCap();
  const houses = () => appState.game.town?.woodenHouses ?? 0;
  const bonfireLevel = () => appState.game.town?.bonfireLevel ?? 0;
  const settlement = () => getSettlementLabel();
  const woodAgeReached = () =>
    eraIndex(appState.story.currentEra) >= eraIndex("WOOD_AGE");
  const atHouseCap = () => houses() >= WOODEN_HOUSE.maxPerSeason;
  const nextHouseCost = () => getWoodenHouseCost(houses());
  const bonfireUnlocked = () => isTownBuildingUnlocked(BONFIRE.id);
  const bonfireUpgradesUnlocked = () =>
    isTownBuildingUnlocked(BONFIRE_UPGRADES_ID);
  const bonfireStats = () => getBonfireStats(bonfireLevel());
  const bonfireUpgradeCost = () => getBonfireUpgradeCost(bonfireLevel());

  function houseButtonLabel() {
    if (atHouseCap()) return "Max houses this season";
    const cost = nextHouseCost();
    return `Build house · 🥜 ${formatNumber(cost.nuts)} · 🪵 ${formatNumber(cost.nutwood)}`;
  }

  function renderBonfireSection() {
    if (!bonfireUnlocked()) {
      return (
        <p class="muted text-sm">
          Travelers may teach you a signal once they have dens to sleep in.
        </p>
      );
    }

    if (bonfireLevel() < 1) {
      return (
        <button
          type="button"
          class={`btn ${canBuildBonfire() ? "btn-primary" : "btn-secondary"}`}
          disabled={!canBuildBonfire()}
          onClick={() => buildBonfire()}
        >
          Light bonfire · 🥜 {formatNumber(BONFIRE.nutCost)} · 🪵{" "}
          {formatNumber(BONFIRE.nutwoodCost)}
        </button>
      );
    }

    const stats = bonfireStats();
    const upgradesUnlocked = bonfireUpgradesUnlocked();
    const atMax = bonfireLevel() >= BONFIRE.maxLevel;
    const upgradeCost = bonfireUpgradeCost();

    return (
      <div class="space-y-3">
        <p class="text-sm font-semibold">
          Lit · Lv{bonfireLevel()}
          {stats
            ? ` · ~${(stats.chance * 100).toFixed(0)}% every ${Math.round(stats.checkIntervalMs / 1000)}s`
            : ""}
        </p>
        <p class="muted text-sm">
          Needs free housing capacity — rolls fail quietly when the colony is
          full.
        </p>
        <Show when={upgradesUnlocked && !atMax}>
          <button
            type="button"
            class={`btn ${canUpgradeBonfire() ? "btn-primary" : "btn-secondary"}`}
            disabled={!canUpgradeBonfire()}
            onClick={() => upgradeBonfire()}
          >
            Upgrade signal · 🥜 {formatNumber(upgradeCost.nuts)} · 🪵{" "}
            {formatNumber(upgradeCost.nutwood)}
          </button>
        </Show>
        <Show when={upgradesUnlocked && atMax}>
          <p class="muted text-sm">Bonfire is as bright as wood allows.</p>
        </Show>
      </div>
    );
  }

  return (
    <div class="tab-panel space-y-6" id="town-content">
      <header class="text-center">
        <p class="muted text-sm">Settlement</p>
        <h2 class="section-title mt-1">{settlement()}</h2>
        <p class="muted mt-2 text-sm">
          Colony: {squirrelCount()} / {cap()} squirrels
        </p>
      </header>

      <section class="panel space-y-3">
        <h3 class="font-display text-lg font-bold">Wooden House</h3>
        <p class="muted text-sm">
          A rough den of NutWood. Raises how many squirrels can live here — but
          winter will take it. Rebuild each spring. Each extra house costs far
          more than the last.
        </p>
        <p class="text-sm font-semibold">
          Built this season: {houses()} / {WOODEN_HOUSE.maxPerSeason} (+
          {WOODEN_HOUSE.capBonus} cap each)
        </p>

        <Show
          when={woodAgeReached()}
          fallback={
            <p class="muted text-sm">
              Enter the Wood Age to learn how to raise dens in town.
            </p>
          }
        >
          <button
            type="button"
            class={`btn ${canBuildWoodenHouse() ? "btn-primary" : "btn-secondary"}`}
            disabled={!canBuildWoodenHouse()}
            onClick={() => buildWoodenHouse()}
          >
            {houseButtonLabel()}
          </button>
        </Show>
      </section>

      <section class="panel space-y-3">
        <h3 class="font-display text-lg font-bold">Bonfire</h3>
        <p class="muted text-sm">
          A signal in the dark. Slowly draws wandering squirrels — if there is
          room for them.
        </p>
        {renderBonfireSection()}
      </section>

      <p class="muted text-center text-xs">
        Durable halls and barns come much later. For now, wood is temporary.
      </p>
    </div>
  );
};

export default TownTab;
