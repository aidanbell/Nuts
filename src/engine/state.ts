/**
 * Game actions against the bound store (see runtime.attachStore).
 */

import type {
  GameState,
  JobSite,
  JoblessJobSite,
  Population,
  Squirrel,
} from "../types/game";
import type { IdeaEra, IdeaEffect, IdeasState } from "../types/ideas";
import type { StoryState } from "../types/story";
import type { GameLogState } from "../types/gameLog";
import {
  INITIAL_META_STATE,
  STORY_MODAL_HIBERNATION_LIMIT,
  SEASON_ZERO_SQUIRREL_CAP,
  PRE_HOUSING_SQUIRREL_CAP,
  TUTORIAL_CHECKPOINT_IDS,
  type MetaState,
} from "../types/meta";
import {
  getJobsiteTemplate,
  refinementJobsites,
  PRODUCTION_ROSTER_CAP,
} from "../data/jobsites";
import { eraIndex } from "../data/eras";
import {
  TOWN_TAB_ID,
  WOODEN_HOUSE,
  BONFIRE,
  BONFIRE_UPGRADES_ID,
  DURABLE_HOUSE,
  getSettlementScale,
  getWoodenHouseCost,
  getBonfireStats,
  getBonfireUpgradeCost,
  getDurableHouseCost,
} from "../data/town";
import { appState, setAppState } from "./runtime";
import {
  checkpointsTemplate,
  createFreshGameState,
  ideasTemplate,
  type AppState,
} from "./initialState";

export type { AppState };
export type { SetAppState } from "./runtime";

// ============================================================================
// Game State Accessors
// ============================================================================

export const gameState = () => appState.game;
export const ideasState = () => appState.ideas;
export const storyState = () => appState.story;
export const gameLogState = () => appState.gameLog;
export const metaState = () => appState.meta;

// ============================================================================
// Actions
// ============================================================================

// Core resource actions
export const addNuts = (amount: number) => {
  setAppState("game", "nutsTotal", (prev) => prev + amount);
  setAppState("game", "nutsAllTime", (prev) => prev + amount);
};

export const spendNuts = (amount: number) => {
  setAppState("game", "nutsTotal", (prev) => prev - amount);
};

// Resource actions
export const addResource = (
  resource: keyof GameState["resources"],
  amount: number,
) => {
  setAppState("game", "resources", resource, (prev) => prev + amount);
};

export const spendResource = (
  resource: keyof GameState["resources"],
  amount: number,
) => {
  setAppState("game", "resources", resource, (prev) => prev - amount);
};

// Squirrel actions
export const createSquirrel = () => {
  const game = appState.game;
  const currentCount = Object.keys(game.squirrels).length;
  if (currentCount >= getSquirrelCap()) {
    return false;
  }

  const id = game.nextSquirrelId;

  setAppState("game", "squirrels", id, {
    _id: id,
    employed: false,
    jobSite: null,
    total: 0,
  });
  setAppState("game", "population", "jobless", (prev) => [...prev, id]);
  setAppState("game", "nextSquirrelId", id + 1);
  return true;
};

/** Soft population cap + seasonal wooden houses + durable (Stone+) housing */
export const getSquirrelCap = (): number => {
  const houses = appState.game.town?.woodenHouses ?? 0;
  const durable = appState.game.town?.durableHouses ?? 0;
  const houseBonus =
    houses * WOODEN_HOUSE.capBonus + durable * DURABLE_HOUSE.capBonus;
  if (appState.meta.hibernations === 0) {
    return SEASON_ZERO_SQUIRREL_CAP + houseBonus;
  }
  return PRE_HOUSING_SQUIRREL_CAP + houseBonus;
};

export const getSettlementLabel = (): string => {
  const pop = Object.keys(appState.game.squirrels).length;
  const houses = appState.game.town?.woodenHouses ?? 0;
  return getSettlementScale(pop, houses).label;
};

export const canBuildWoodenHouse = (): boolean => {
  const houses = appState.game.town?.woodenHouses ?? 0;
  if (houses >= WOODEN_HOUSE.maxPerSeason) return false;
  // Available once Wood Age is the current era (or later)
  if (eraIndex(appState.story.currentEra) < eraIndex("WOOD_AGE")) return false;
  const cost = getWoodenHouseCost(houses);
  const game = appState.game;
  return game.nutsTotal >= cost.nuts && game.resources.nutwood >= cost.nutwood;
};

export const buildWoodenHouse = (): boolean => {
  if (!canBuildWoodenHouse()) return false;
  const houses = appState.game.town?.woodenHouses ?? 0;
  const cost = getWoodenHouseCost(houses);
  spendNuts(cost.nuts);
  spendResource("nutwood", cost.nutwood);
  setAppState("game", "town", "woodenHouses", (prev) => (prev ?? 0) + 1);
  addLog(
    `Built a wooden house (+${WOODEN_HOUSE.capBonus} squirrel capacity this season).`,
    "success",
  );
  return true;
};

export const canBuildDurableHouse = (): boolean => {
  if (eraIndex(appState.story.currentEra) < eraIndex("STONE_AGE"))
    return false;
  const built = appState.game.town?.durableHouses ?? 0;
  const cost = getDurableHouseCost(built);
  const game = appState.game;
  return game.nutsTotal >= cost.nuts && game.resources.nutwood >= cost.nutwood;
};

export const buildDurableHouse = (): boolean => {
  if (!canBuildDurableHouse()) return false;
  const built = appState.game.town?.durableHouses ?? 0;
  const cost = getDurableHouseCost(built);
  spendNuts(cost.nuts);
  spendResource("nutwood", cost.nutwood);
  setAppState("game", "town", "durableHouses", (prev) => (prev ?? 0) + 1);
  setAppState("meta", "durableHouses", (prev) => (prev ?? 0) + 1);
  addLog(
    `Built a durable house (+${DURABLE_HOUSE.capBonus} squirrel capacity, survives winter).`,
    "success",
  );
  return true;
};

export const isTownBuildingUnlocked = (buildingId: string): boolean =>
  appState.meta.unlockedTownBuildings.includes(buildingId);

export const unlockTownBuildings = (buildingIds: string[]) => {
  setAppState("meta", "unlockedTownBuildings", (prev) =>
    Array.from(new Set([...prev, ...buildingIds])),
  );
  unlockTab(TOWN_TAB_ID);
};

export const canBuildBonfire = (): boolean => {
  if (!isTownBuildingUnlocked(BONFIRE.id)) return false;
  if ((appState.game.town?.bonfireLevel ?? 0) >= 1) return false;
  const game = appState.game;
  return (
    game.nutsTotal >= BONFIRE.nutCost &&
    game.resources.nutwood >= BONFIRE.nutwoodCost
  );
};

export const buildBonfire = (): boolean => {
  if (!canBuildBonfire()) return false;
  spendNuts(BONFIRE.nutCost);
  spendResource("nutwood", BONFIRE.nutwoodCost);
  setAppState("game", "town", "bonfireLevel", 1);
  addLog(
    "Bonfire lit — travelers may notice the glow and wander in.",
    "success",
  );
  return true;
};

export const canUpgradeBonfire = (): boolean => {
  if (!isTownBuildingUnlocked(BONFIRE_UPGRADES_ID)) return false;
  const level = appState.game.town?.bonfireLevel ?? 0;
  if (level < 1 || level >= BONFIRE.maxLevel) return false;
  const cost = getBonfireUpgradeCost(level);
  const game = appState.game;
  return game.nutsTotal >= cost.nuts && game.resources.nutwood >= cost.nutwood;
};

export const upgradeBonfire = (): boolean => {
  if (!canUpgradeBonfire()) return false;
  const level = appState.game.town.bonfireLevel;
  const cost = getBonfireUpgradeCost(level);
  spendNuts(cost.nuts);
  spendResource("nutwood", cost.nutwood);
  setAppState("game", "town", "bonfireLevel", level + 1);
  const stats = getBonfireStats(level + 1);
  addLog(
    `Bonfire upgraded to Lv${level + 1} (${((stats?.chance ?? 0) * 100).toFixed(0)}% every ${Math.round((stats?.checkIntervalMs ?? 0) / 1000)}s).`,
    "success",
  );
  return true;
};

/**
 * RNG attraction roll — call from the game loop when the bonfire is lit.
 * Chance ramps with each consecutive failed roll (while room is available),
 * so an open house always fills within a bounded number of rolls instead of
 * being left to pure luck. Returns true if a squirrel joined.
 */
export const tryBonfireAttraction = (): boolean => {
  const level = appState.game.town?.bonfireLevel ?? 0;
  const stats = getBonfireStats(level);
  if (!stats) return false;

  // No room to fill — don't burn a pity roll on a cap that isn't the RNG's fault.
  if (Object.keys(appState.game.squirrels).length >= getSquirrelCap()) {
    return false;
  }

  const dryStreak = appState.game.town?.bonfireDryStreak ?? 0;
  const chance = Math.min(
    1,
    stats.chance * Math.pow(BONFIRE.pityMultiplier, dryStreak),
  );

  if (Math.random() >= chance) {
    setAppState("game", "town", "bonfireDryStreak", dryStreak + 1);
    return false;
  }

  if (!createSquirrel()) return false;
  setAppState("game", "town", "bonfireDryStreak", 0);
  addLog("A squirrel followed the bonfire glow into town.", "success");
  return true;
};

export const squirrelFoundNut = (squirrelId: number) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite = game.jobSites.jobless;

  if (squirrel && jobSite) {
    const amount = Math.max(
      0,
      jobSite.value * jobSite.multi * appState.meta.goldForageMulti,
    );
    setAppState(
      "game",
      "squirrels",
      squirrelId,
      "total",
      (prev) => prev + amount,
    );
    addNuts(amount);
  }
};

// JobSite actions
export const unlockJobsites = (jobsiteIds: string[]) => {
  // Jobsites tab is a permanent unlock
  unlockTab("jobsites");

  jobsiteIds.forEach((id) => {
    // Already known this season — keep current level/staffing
    if (
      appState.game.jobSites.production[id] ||
      appState.game.jobSites.refinement[id]
    ) {
      setAppState("meta", "unlockedJobsiteIds", (prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );
      return;
    }

    const jobsiteTemplate = getJobsiteTemplate(id);

    if (jobsiteTemplate) {
      // Level 0 = known but unbuilt; first upgrade builds it
      const newJobsite: JobSite = {
        ...jobsiteTemplate,
        unlocked: true,
        maxSquirrels: jobsiteTemplate.maxSquirrels,
        workers: [],
        level: 0,
        baseProduction: jobsiteTemplate.baseProduction,
        squirrelBonus: jobsiteTemplate.squirrelBonus,
        cost: jobsiteTemplate.baseCost,
        costGrowthRate: jobsiteTemplate.costGrowthRate,
        baseCost: jobsiteTemplate.baseCost,
        consumes: jobsiteTemplate.consumes,
        produces: jobsiteTemplate.produces,
      };

      if (newJobsite.type === "production") {
        setAppState("game", "jobSites", "production", id, newJobsite);
      } else if (newJobsite.type === "refinement") {
        setAppState("game", "jobSites", "refinement", id, newJobsite);
      }

      setAppState("meta", "unlockedJobsiteIds", (prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );
    }
  });
};

/** True once the hard roster cap is enforced (Stone Age or later). */
const rosterCapActive = (): boolean =>
  eraIndex(appState.story.currentEra) >= eraIndex("STONE_AGE");

/** Built (level >= 1) production sites — refinement is excluded by design. */
export const getActiveProductionSiteCount = (): number =>
  Object.values(appState.game.jobSites.production).filter(
    (s) => s.level >= 1,
  ).length;

export const isProductionRosterFull = (): boolean =>
  rosterCapActive() &&
  getActiveProductionSiteCount() >= PRODUCTION_ROSTER_CAP;

export const buyJobSiteCapacity = (jobSiteId: string) => {
  const game = appState.game;
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  if (!jobSite || game.nutsTotal < jobSite.cost) return;

  // Capture before mutating — Solid store proxies update in place
  const previousLevel = jobSite.level;
  const newLevel = previousLevel + 1;
  const siteType = jobSite.type;
  const baseCost = jobSite.baseCost;
  const costGrowthRate = jobSite.costGrowthRate;
  const maxLevel = jobSite.maxLevel;

  if (maxLevel !== undefined && previousLevel >= maxLevel) return;

  if (
    siteType === "production" &&
    previousLevel === 0 &&
    isProductionRosterFull()
  ) {
    addLog(
      `Roster full (${PRODUCTION_ROSTER_CAP} active sites) — retire one to build ${jobSite.name}.`,
      "warning",
    );
    return;
  }

  spendNuts(jobSite.cost);

  setAppState("game", "jobSites", siteType, jobSiteId, "level", newLevel);

  // Capacity bump when reaching levels 5, 10, 15, ...
  if (newLevel % 5 === 0) {
    setAppState(
      "game",
      "jobSites",
      siteType,
      jobSiteId,
      "maxSquirrels",
      (prev) => prev + 1,
    );
  }

  if (siteType === "refinement") {
    // Refinement output scales via cycle time (down) and batch size (up) —
    // baseProduction/squirrelBonus are unused for this jobsite type.
    setAppState(
      "game",
      "jobSites",
      siteType,
      jobSiteId,
      "time",
      (prev) => Math.max(3000, Math.round(prev * 0.95)),
    );
    setAppState(
      "game",
      "jobSites",
      siteType,
      jobSiteId,
      "produces",
      "amount",
      (prev) => Math.round(prev * 1.08 * 100) / 100,
    );
  } else {
    // Every level, slightly increase production (5% boost to both base and bonus)
    setAppState(
      "game",
      "jobSites",
      siteType,
      jobSiteId,
      "baseProduction",
      (prev) => prev * 1.05,
    );
    setAppState(
      "game",
      "jobSites",
      siteType,
      jobSiteId,
      "squirrelBonus",
      (prev) => prev * 1.05,
    );
  }

  // Next cost from the level we just reached
  const newCost = Math.floor(baseCost * Math.pow(costGrowthRate, newLevel));
  setAppState("game", "jobSites", siteType, jobSiteId, "cost", newCost);
};

export const assignSquirrelToJobSite = (
  squirrelId: number,
  jobSiteId: string,
) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  // Level 0 sites are known but unbuilt — cannot staff until first upgrade
  if (
    squirrel &&
    jobSite &&
    jobSite.level >= 1 &&
    jobSite.workers.length < jobSite.maxSquirrels
  ) {
    // Remove from jobless
    setAppState("game", "population", "jobless", (prev) =>
      prev.filter((id) => id !== squirrelId),
    );

    // Add to jobsite workers
    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "workers",
      (prev) => [...prev, squirrelId],
    );
    setAppState("game", "squirrels", squirrelId, "employed", true);
    setAppState("game", "squirrels", squirrelId, "jobSite", jobSiteId);

    // Initialize population array for this jobsite if needed
    if (!game.population[jobSiteId]) {
      setAppState("game", "population", jobSiteId, []);
    }
    setAppState("game", "population", jobSiteId, (prev: number[] = []) => [
      ...prev,
      squirrelId,
    ]);
  }
};

export const removeSquirrelFromJobSite = (
  squirrelId: number,
  jobSiteId: string,
) => {
  const game = appState.game;
  const squirrel = game.squirrels[squirrelId];
  const jobSite =
    game.jobSites.production[jobSiteId] || game.jobSites.refinement[jobSiteId];

  if (squirrel && jobSite) {
    // Remove from jobsite workers
    setAppState(
      "game",
      "jobSites",
      jobSite.type,
      jobSiteId,
      "workers",
      (prev) => prev.filter((id) => id !== squirrelId),
    );

    // Remove from population
    if (game.population[jobSiteId]) {
      setAppState("game", "population", jobSiteId, (prev) =>
        prev.filter((id) => id !== squirrelId),
      );
    }

    // Add back to jobless
    setAppState("game", "population", "jobless", (prev) => [
      ...prev,
      squirrelId,
    ]);
    setAppState("game", "squirrels", squirrelId, "employed", false);
    setAppState("game", "squirrels", squirrelId, "jobSite", null);
  }
};

/**
 * Retire a built production site back to level 0 (known but unbuilt), freeing
 * its workers to jobless and dropping it from the active roster count so a
 * new site can be built under the Stone+ hard cap.
 */
export const retireJobsite = (jobSiteId: string): boolean => {
  const game = appState.game;
  const jobSite = game.jobSites.production[jobSiteId];
  if (!jobSite || jobSite.level < 1) return false;

  [...jobSite.workers].forEach((sid) =>
    removeSquirrelFromJobSite(sid, jobSiteId),
  );

  const template = getJobsiteTemplate(jobSiteId);
  if (template) {
    setAppState("game", "jobSites", "production", jobSiteId, {
      ...template,
      unlocked: true,
      workers: [],
      level: 0,
      cost: template.baseCost,
    });
  }

  addLog(`Retired ${jobSite.name} — squirrels reassigned to jobless.`, "info");
  return true;
};

// Manual refinement (craft `times` in one go — all-or-nothing on affordability)
export const craftRefinement = (refinementId: string, times: number = 1) => {
  const game = appState.game;
  const refinement = refinementJobsites.find((js) => js.id === refinementId);

  if (!refinement || !refinement.consumes?.length || !refinement.produces)
    return;

  const { resource: produceType, amount: produceAmount } = refinement.produces;

  const canAfford = refinement.consumes.every(({ resource, amount }) => {
    const available =
      resource === "nuts"
        ? game.nutsTotal
        : game.resources[resource as keyof typeof game.resources];
    return available >= amount * times;
  });

  if (!canAfford) return;

  refinement.consumes.forEach(({ resource, amount }) => {
    if (resource === "nuts") {
      spendNuts(amount * times);
    } else {
      spendResource(resource as keyof typeof game.resources, amount * times);
    }
  });

  addResource(produceType, produceAmount * times);
};

// Batch update for performance
export interface GameUpdate {
  type: "ADD_NUTS" | "UPDATE_SQUIRREL" | "UPDATE_JOBSITE";
  data: {
    amount?: number;
    id?: number | string;
    changes?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export const batchUpdate = (updates: GameUpdate[]) => {
  updates.forEach((update) => {
    switch (update.type) {
      case "ADD_NUTS":
        if (update.data.amount !== undefined) {
          addNuts(update.data.amount);
        }
        break;
      case "UPDATE_SQUIRREL":
        if (update.data.id !== undefined && update.data.changes) {
          setAppState(
            "game",
            "squirrels",
            update.data.id as number,
            (prev) => ({
              ...prev,
              ...update.data.changes,
            }),
          );
        }
        break;
      case "UPDATE_JOBSITE":
        if (update.data.id !== undefined) {
          const js =
            appState.game.jobSites.production[update.data.id as string];
          if (js) {
            setAppState(
              "game",
              "jobSites",
              "production",
              update.data.id as string,
              (prev) => ({ ...prev, ...update.data.changes }),
            );
          }
        }
        break;
    }
  });
};

// Game control actions
export const incrementTick = () => {
  setAppState("game", "tick", (prev) => prev + 1);
};

export const updateTimer = (deltaMs: number = 10) => {
  // Legacy timer advances +1 unit per 10ms of real time (old loop ran ~100 FPS).
  // time_elapsed checkpoints use m*60000 + s*1000 + ms ≈ real milliseconds.
  const units = Math.max(0, Math.round(deltaMs / 10));
  if (units === 0) return;

  setAppState("game", "timer", (prev) => {
    let ms = prev.ms + units;
    let s = prev.s + Math.floor(ms / 100);
    ms = ms % 100;
    const m = prev.m + Math.floor(s / 60);
    s = s % 60;
    return { ms, s, m };
  });
};

export const setGameSpeed = (speed: number) => {
  setAppState("game", "gameSpeed", speed);
};

export const pauseGame = () => {
  setAppState("game", "isPaused", true);
};

export const resumeGame = () => {
  setAppState("game", "isPaused", false);
};

export const setActiveTab = (tab: string) => {
  setAppState("game", "activeTab", tab);
};

export const unlockTab = (tab: string) => {
  const resolved =
    tab === "buildings" || tab === "clearing" ? TOWN_TAB_ID : tab;
  setAppState("game", "unlockedTabs", (prev) => {
    if (!prev.includes(resolved)) {
      return [...prev, resolved];
    }
    return prev;
  });
  // Hibernate is seasonal — only unlock for the current winter
  if (resolved === "hibernate") return;
  setAppState("meta", "unlockedTabs", (prev) => {
    if (!prev.includes(resolved)) {
      return [...prev, resolved];
    }
    return prev;
  });
};

export const unlockTabs = (tabs: string[]) => {
  tabs.forEach((tab) => unlockTab(tab));
};

// Hibernate action
/** Scales season nut haul into Gold Nuts earned on hibernate */
export const HIBERNATION_NUTS_K = 2;

/**
 * Expected colony nuts/sec (UI / balance tooling — not used for Gold reward).
 */
export const getEffectiveNps = (): number => {
  const game = appState.game;
  const goldMulti = appState.meta.goldForageMulti;
  const jobless = game.jobSites.jobless;
  const joblessCount = game.population.jobless.length;
  const timeSec = Math.max(0.001, jobless.time / 1000);
  const joblessNps =
    joblessCount *
    ((jobless.value * jobless.multi * jobless.chance) / timeSec) *
    goldMulti;

  let productionNps = 0;
  for (const site of Object.values(game.jobSites.production)) {
    if (site.level < 1) continue;
    productionNps +=
      (site.baseProduction + site.squirrelBonus * site.workers.length) *
      site.multi *
      goldMulti;
  }

  return joblessNps + productionNps;
};

/**
 * Glowing nut burst: ~15s of colony effective NPS, with light variance.
 * Uses full economy (jobless + jobsites), so staffing sites does not tank the find.
 */
export const calculateGoldenNutReward = (): number => {
  const nps = getEffectiveNps();
  const burst = Math.max(0.5, nps) * 15;
  const variance = 0.75 + Math.random() * 0.5;
  return Math.max(5, Math.round(burst * variance));
};

/** Gold Nuts from nuts gathered this season (nutsAllTime resets each hibernate). */
export const calculateHibernationReward = (
  nutsThisSeason: number = appState.game.nutsAllTime,
  multi: number = appState.game.goldNuts.multi,
): number => {
  return Math.max(
    1,
    Math.floor(
      Math.sqrt(Math.max(0, nutsThisSeason)) * multi * HIBERNATION_NUTS_K,
    ),
  );
};

/** Permanent production bonus from banked Gold Nuts (~2% each) */
export const goldNutsToForageMulti = (goldNutsTotal: number): number =>
  1 + goldNutsTotal * 0.02;

export const canEnterEra = (era: string): boolean => {
  const wantIdx = eraIndex(era);
  const maxIdx = eraIndex(appState.meta.maxEraAvailable);
  return wantIdx <= maxIdx;
};

export const markWinterIncoming = () => {
  setAppState("meta", "winterIncoming", true);
  unlockTab("hibernate");
};

/**
 * Season rollover (prestige): wipe run state, keep colony legacy (Gold Nuts / season).
 */
export const hibernate = () => {
  const game = appState.game;
  const goldenNutsEarned = calculateHibernationReward();

  const newGoldTotal = game.goldNuts.total + goldenNutsEarned;
  const nextHibernations = appState.meta.hibernations + 1;

  // After first winter, Wood Age becomes available; Stone Age after the second.
  const maxEra: IdeaEra =
    nextHibernations >= 2
      ? "STONE_AGE"
      : nextHibernations >= 1
        ? "WOOD_AGE"
        : appState.meta.maxEraAvailable;

  // Preserve structure knowledge across the wipe. The hibernate tab is
  // scripted (story-gated) through the first winter, then stays unlocked
  // permanently once Wood Age is reachable — the player chooses when to go.
  const preservedTabs = appState.meta.unlockedTabs.filter(
    (tab) => tab !== "hibernate",
  );
  if (nextHibernations >= 1 && !preservedTabs.includes("hibernate")) {
    preservedTabs.push("hibernate");
  }
  const preservedStructure = [...appState.meta.structureIdeas];
  const preservedJobsites = [...appState.meta.unlockedJobsiteIds];
  const preservedTownBuildings = [...appState.meta.unlockedTownBuildings];

  setAppState("meta", {
    hibernations: nextHibernations,
    seasonIndex: nextHibernations,
    winterIncoming: false,
    maxEraAvailable: maxEra,
    goldForageMulti: goldNutsToForageMulti(newGoldTotal),
    suppressCheckpointsUntil: Date.now() + 2000,
    unlockedTabs: preservedTabs,
    structureIdeas: preservedStructure,
    unlockedJobsiteIds: preservedJobsites,
    unlockedTownBuildings: preservedTownBuildings,
  });

  // Wipe run state from a clean template (never reuse store-mutated objects)
  setAppState(
    "game",
    createFreshGameState({
      goldNuts: {
        total: newGoldTotal,
        multi: game.goldNuts.multi,
      },
      squirrels: {},
      nextSquirrelId: 0,
      population: { jobless: [] },
      unlockedTabs: Array.from(new Set(["home", ...preservedTabs])),
      lastUpdate: Date.now(),
      // Durable (Stone+) housing survives winter — everything else in town wipes
      town: {
        woodenHouses: 0,
        bonfireLevel: 0,
        durableHouses: appState.meta.durableHouses,
        bonfireDryStreak: 0,
      },
    }),
  );

  // Reset ideas, then restore structure research
  setAppState("ideas", {
    ideas: structuredClone(ideasTemplate),
    researchedIdeas: [],
    researchedCount: 0,
    totalResearchPoints: 0,
  });

  // Reset story progress but keep checkpoint definitions
  setAppState("story", {
    checkpoints: structuredClone(checkpointsTemplate),
    activeStory: null,
    storyQueue: [],
    completedCheckpoints: [],
    currentEra: "PREHISTORY",
    storyProgress: 0,
    eraBonuses: {},
    pendingChoice: null,
  });

  // Skip tutorial / intro beats — spring + season gating cover the wake
  const skipped = [...TUTORIAL_CHECKPOINT_IDS];
  for (const id of skipped) {
    if (appState.story.checkpoints[id]) {
      setAppState("story", "checkpoints", id, "completed", true);
    }
  }
  setAppState("story", "completedCheckpoints", skipped);

  setAppState("gameLog", "logs", []);

  restoreStructureKnowledge();

  // Wake alone with one squirrel
  createSquirrel();

  const spring = appState.story.checkpoints.springAwakening;
  if (nextHibernations < STORY_MODAL_HIBERNATION_LIMIT) {
    // First wipe or two: keep the spring modal
    queueStories(["springAwakening"]);
  } else if (spring?.story) {
    completeCheckpoint("springAwakening");
    addLog(`📖 ${spring.story.title} — ${spring.story.body}`, "info");
  }

  addLog(
    `Hibernated! +${goldenNutsEarned} Gold Nuts. Season ${nextHibernations + 1} begins.`,
    "success",
  );
};

/** Re-apply structure ideas + known jobsites after a winter wipe */
function restoreStructureKnowledge() {
  const { structureIdeas, unlockedJobsiteIds, unlockedTabs } = appState.meta;

  setAppState(
    "game",
    "unlockedTabs",
    Array.from(new Set(["home", ...unlockedTabs])),
  );

  for (const ideaId of structureIdeas) {
    const idea = appState.ideas.ideas[ideaId];
    if (!idea) continue;
    setAppState("ideas", "ideas", ideaId, "researched", true);
    setAppState("ideas", "ideas", ideaId, "visible", true);
  }
  setAppState("ideas", "researchedIdeas", [...structureIdeas]);
  setAppState("ideas", "researchedCount", structureIdeas.length);

  // Rebuild known jobsites at level 0 (empty staff)
  if (unlockedJobsiteIds.length > 0) {
    unlockJobsites(unlockedJobsiteIds);
  }

  // Re-apply era / feature / stat-mutating effects from structure ideas.
  // Runs after jobsites are rebuilt above, since upgradeJobsite can target
  // a production/refinement site by id, not just "jobless".
  for (const ideaId of structureIdeas) {
    const idea = appState.ideas.ideas[ideaId];
    if (!idea?.effects) continue;
    if (idea.effects.setEra) {
      setEra(idea.effects.setEra);
    }
    if (idea.effects.unlockFeature) {
      unlockTabs([idea.effects.unlockFeature]);
    }
    applyIdeaStatEffects(idea.effects);
  }

  refreshIdeaCatalog();
}

// Update timestamp
export const updateTimestamp = () => {
  setAppState("game", "lastUpdate", Date.now());
};

// Load save data
export const loadSaveData = (
  data: Partial<GameState> & {
    meta?: MetaState;
    story?: { completedCheckpoints: string[]; currentEra: string | null };
    ideas?: { researchedIdeas: string[] };
    resources?: GameState["resources"];
    unlockedTabs?: string[];
    activeTab?: string;
    timer?: GameState["timer"];
    clearing?: GameState["town"];
    town?: GameState["town"];
  },
) => {
  const rawTown = data.town ??
    data.clearing ?? {
      woodenHouses: 0,
      bonfireLevel: 0,
      durableHouses: 0,
      bonfireDryStreak: 0,
    };
  const townState: GameState["town"] = {
    woodenHouses: rawTown.woodenHouses ?? 0,
    bonfireLevel: rawTown.bonfireLevel ?? 0,
    // Older saves predate durable housing — meta is the source of truth.
    durableHouses: data.meta?.durableHouses ?? rawTown.durableHouses ?? 0,
    // Older saves predate the pity ramp.
    bonfireDryStreak: rawTown.bonfireDryStreak ?? 0,
  };

  setAppState("game", (prev) => ({
    ...prev,
    ...data,
    // Older saves predate Research Resin.
    resources: { ...prev.resources, ...data.resources },
    unlockedTabs: data.unlockedTabs ?? prev.unlockedTabs,
    activeTab: data.activeTab ?? prev.activeTab,
    timer: data.timer ?? prev.timer,
    town: townState,
  }));

  if (data.meta) {
    setAppState("meta", { ...INITIAL_META_STATE, ...data.meta });
  }

  // Permanent tabs: prefer meta, fall back to saved run tabs
  const migrateTab = (tab: string) =>
    tab === "buildings" || tab === "clearing" ? TOWN_TAB_ID : tab;
  const metaTabs = appState.meta.unlockedTabs.map(migrateTab);
  const runTabs = (data.unlockedTabs ?? appState.game.unlockedTabs).map(
    migrateTab,
  );
  const mergedTabs = Array.from(new Set(["home", ...metaTabs, ...runTabs]));
  setAppState("meta", "unlockedTabs", mergedTabs);
  setAppState("game", "unlockedTabs", mergedTabs);
  if (
    appState.game.activeTab === "buildings" ||
    appState.game.activeTab === "clearing"
  ) {
    setAppState("game", "activeTab", TOWN_TAB_ID);
  }

  if (data.story) {
    setAppState("story", "currentEra", data.story.currentEra);
    setAppState(
      "story",
      "completedCheckpoints",
      data.story.completedCheckpoints,
    );
    data.story.completedCheckpoints.forEach((id) => {
      if (appState.story.checkpoints[id]) {
        setAppState("story", "checkpoints", id, "completed", true);
      }
    });
  }

  if (data.ideas?.researchedIdeas) {
    const legacyIdeaMap: Record<string, string> = {
      discoverRefinement: "nutwoodCraft",
      woodRefinement: "nutwoodCraft",
      airMethods: "treeClimbing",
    };
    const researched = data.ideas.researchedIdeas.map(
      (id) => legacyIdeaMap[id] ?? id,
    );
    researched.forEach((ideaId) => {
      if (appState.ideas.ideas[ideaId]) {
        setAppState("ideas", "ideas", ideaId, "researched", true);
        setAppState("ideas", "ideas", ideaId, "visible", true);
        if (appState.ideas.ideas[ideaId].persists) {
          setAppState("meta", "structureIdeas", (prev) =>
            prev.includes(ideaId) ? prev : [...prev, ideaId],
          );
        }
      }
    });
    setAppState("ideas", "researchedIdeas", researched);
    setAppState("ideas", "researchedCount", researched.length);
  }

  // Migrate known jobsites into meta from a mid-season save
  const knownIds = [
    ...Object.keys(appState.game.jobSites.production),
    ...Object.keys(appState.game.jobSites.refinement),
  ];
  if (knownIds.length > 0) {
    setAppState("meta", "unlockedJobsiteIds", (prev) =>
      Array.from(new Set([...prev, ...knownIds])),
    );
  }

  // Migrate legacy idea / jobsite ids
  const legacyIdeaMap: Record<string, string> = {
    discoverRefinement: "nutwoodCraft",
    woodRefinement: "nutwoodCraft",
    airMethods: "treeClimbing",
  };
  const legacySiteMap: Record<string, string> = {
    rockThrower: "stickPoker",
  };
  setAppState("meta", "structureIdeas", (prev) =>
    Array.from(
      new Set(
        prev
          .map((id) => legacyIdeaMap[id] ?? id)
          .filter((id) => appState.ideas.ideas[id]),
      ),
    ),
  );
  setAppState("meta", "unlockedJobsiteIds", (prev) =>
    Array.from(new Set(prev.map((id) => legacySiteMap[id] ?? id))),
  );

  refreshIdeaCatalog();
};

// ============================================================================
// Ideas Actions
// ============================================================================

/**
 * Apply the stat-mutating side of an idea's effects (jobsite/jobless stat
 * boosts). Split out from researchIdea so structure ideas can re-apply these
 * every spring — a fresh game state resets jobless/jobsite stats to template
 * defaults, so a persisted idea's boost has to be reapplied, not just its
 * `researched` flag.
 */
function applyIdeaStatEffects(effects: IdeaEffect) {
  if (effects.upgradeJobsite) {
    const { jobsiteId, property, amount } = effects.upgradeJobsite;

    if (jobsiteId === "jobless") {
      const jobless = appState.game.jobSites.jobless;
      if (property === "multi") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "multi",
          jobless.multi + amount,
        );
      } else if (property === "value") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "value",
          jobless.value + amount,
        );
      } else if (property === "time") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "time",
          jobless.time - amount,
        );
      } else if (property === "chance") {
        setAppState(
          "game",
          "jobSites",
          "jobless",
          "chance",
          jobless.chance + amount,
        );
      }
    } else if (appState.game.jobSites.production[jobsiteId]) {
      if (property === "multi") {
        setAppState(
          "game",
          "jobSites",
          "production",
          jobsiteId,
          "multi",
          (prev) => prev + amount,
        );
      }
    } else if (appState.game.jobSites.refinement[jobsiteId]) {
      if (property === "multi") {
        setAppState(
          "game",
          "jobSites",
          "refinement",
          jobsiteId,
          "multi",
          (prev) => prev + amount,
        );
      }
    }
  }

  if (effects.globalEfficiency) {
    const efficiencyBoost = effects.globalEfficiency;
    setAppState(
      "game",
      "jobSites",
      "jobless",
      "multi",
      (prev) => prev + efficiencyBoost,
    );
    Object.keys(appState.game.jobSites.production).forEach((id) => {
      setAppState(
        "game",
        "jobSites",
        "production",
        id,
        "multi",
        (prev) => prev + efficiencyBoost,
      );
    });
    Object.keys(appState.game.jobSites.refinement).forEach((id) => {
      setAppState(
        "game",
        "jobSites",
        "refinement",
        id,
        "multi",
        (prev) => prev + efficiencyBoost,
      );
    });
  }

  if (effects.increaseGatherMulti) {
    setAppState(
      "game",
      "getButton",
      "mult",
      (prev) => prev + effects.increaseGatherMulti!,
    );
  }

  if (effects.increaseGetButton) {
    setAppState(
      "game",
      "getButton",
      "value",
      (prev) => prev + effects.increaseGetButton!,
    );
  }
}

/** Mark a structure idea's ideas permanent — persist across hibernate, not just this season. */
function persistIdeasPermanently(ideaIds: string[]) {
  ideaIds.forEach((id) => {
    if (!appState.ideas.ideas[id]) return;
    setAppState("ideas", "ideas", id, "persists", true);
    if (appState.ideas.ideas[id].researched) {
      setAppState("meta", "structureIdeas", (prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );
    }
  });
}

export const researchIdea = (ideaId: string) => {
  const idea = appState.ideas.ideas[ideaId];

  if (!idea || idea.researched) return;

  setAppState("ideas", "ideas", ideaId, "researched", true);
  setAppState("ideas", "ideas", ideaId, "researchedAt", Date.now());
  setAppState("ideas", "researchedIdeas", (prev) => [...prev, ideaId]);
  setAppState("ideas", "researchedCount", (prev) => prev + 1);

  // Structure research survives winter
  if (idea.persists) {
    setAppState("meta", "structureIdeas", (prev) =>
      prev.includes(ideaId) ? prev : [...prev, ideaId],
    );
  }

  const effects = idea.effects;
  applyIdeaStatEffects(effects);

  if (effects.permanentlyPersistIdeas) {
    persistIdeasPermanently(effects.permanentlyPersistIdeas);
  }
};

export const showIdea = (ideaId: string) => {
  setAppState("ideas", "ideas", ideaId, "visible", true);
};

export const showIdeas = (ideaIds: string[]) => {
  ideaIds.forEach((ideaId) => {
    setAppState("ideas", "ideas", ideaId, "visible", true);
  });
};

/**
 * Era catalog: ideas for eras at or before currentEra.
 * Prerequisite ideas (ideasResearched) also gate visibility — e.g. Wood Age
 * only appears after NutWood Craft unlocks refinement.
 */
export const refreshIdeaCatalog = () => {
  const current = appState.story.currentEra || "PREHISTORY";
  const currentIdx = eraIndex(current);

  Object.keys(appState.ideas.ideas).forEach((ideaId) => {
    const idea = appState.ideas.ideas[ideaId];
    let shouldShow = eraIndex(idea.era) <= currentIdx;

    if (shouldShow && idea.requirements?.ideasResearched?.length) {
      shouldShow = idea.requirements.ideasResearched.every(
        (reqId) => appState.ideas.ideas[reqId]?.researched,
      );
    }

    if (idea.visible !== shouldShow) {
      setAppState("ideas", "ideas", ideaId, "visible", shouldShow);
    }
  });
};

/** @deprecated Use refreshIdeaCatalog — kept for call-site compatibility */
export const updateIdeaVisibility = (_params?: {
  nutsCollected?: number;
  squirrelsCount?: number;
  currentEra?: string;
}) => {
  refreshIdeaCatalog();
};

export const resetIdeas = () => {
  const ideasList = appState.ideas.ideas;
  Object.keys(ideasList).forEach((ideaId) => {
    setAppState("ideas", "ideas", ideaId, "researched", false);
    setAppState("ideas", "ideas", ideaId, "researchedAt", undefined);
  });
  setAppState("ideas", "researchedCount", 0);
  refreshIdeaCatalog();
};

export const loadIdeasState = (data: Partial<IdeasState>) => {
  setAppState("ideas", (prev) => ({ ...prev, ...data }));
};

// ============================================================================
// Story Actions
// ============================================================================

export const completeCheckpoint = (checkpointId: string) => {
  const story = appState.story;
  const checkpoint = story.checkpoints[checkpointId];

  if (checkpoint && !checkpoint.completed) {
    setAppState("story", "checkpoints", checkpointId, "completed", true);
    setAppState(
      "story",
      "checkpoints",
      checkpointId,
      "completedAt",
      Date.now(),
    );
    setAppState("story", "completedCheckpoints", (prev) => [
      ...prev,
      checkpointId,
    ]);

    // Calculate story progress after this checkpoint is counted
    const totalCheckpoints = Object.keys(story.checkpoints).length;
    const completedCount = story.completedCheckpoints.length + 1;
    const progress = Math.floor((completedCount / totalCheckpoints) * 100);
    setAppState("story", "storyProgress", progress);
  }
};

export const showStory = (checkpointId: string) => {
  setAppState("story", "activeStory", checkpointId);
};

export const dismissStory = () => {
  const story = appState.story;
  setAppState("story", "activeStory", null);

  // Show next story in queue if available
  if (story.storyQueue.length > 0) {
    const nextStoryId = story.storyQueue[0];
    setAppState("story", "storyQueue", (prev) => prev.slice(1));
    if (nextStoryId) {
      setAppState("story", "activeStory", nextStoryId);
    }
  }
};

export const queueStory = (checkpointId: string) => {
  const story = appState.story;

  // Don't queue if already in queue or currently active
  if (
    story.activeStory === checkpointId ||
    story.storyQueue.includes(checkpointId)
  ) {
    return;
  }

  // If no active story, show immediately
  if (!story.activeStory) {
    setAppState("story", "activeStory", checkpointId);
  } else {
    // Otherwise add to queue
    setAppState("story", "storyQueue", (prev) => [...prev, checkpointId]);
  }
};

export const queueStories = (checkpointIds: string[]) => {
  const story = appState.story;

  // Filter out any that are already active or queued
  const newStories = checkpointIds.filter(
    (id) => id !== story.activeStory && !story.storyQueue.includes(id),
  );

  if (newStories.length === 0) return;

  // If no active story, show the first one
  if (!story.activeStory) {
    setAppState("story", "activeStory", newStories[0]);
    // Add the rest to queue
    setAppState("story", "storyQueue", (prev) => [
      ...prev,
      ...newStories.slice(1),
    ]);
  } else {
    // Add all to queue
    setAppState("story", "storyQueue", (prev) => [...prev, ...newStories]);
  }
};

export const setEra = (era: string) => {
  if (!canEnterEra(era)) {
    addLog(
      `The ${era.replace(/_/g, " ")} is still only a dream. Survive winter first.`,
      "warning",
    );
    return;
  }
  setAppState("story", "currentEra", era);
  refreshIdeaCatalog();
};

export const setPendingChoice = (checkpointId: string | null) => {
  setAppState("story", "pendingChoice", checkpointId);
};

export const makeChoice = (checkpointId: string, choiceId: string) => {
  const story = appState.story;
  const checkpoint = story.checkpoints[checkpointId];

  if (!checkpoint?.story?.choices) return;

  const choice = checkpoint.story.choices.find((c) => c.id === choiceId);
  if (!choice?.effects) return;

  // Apply choice effects
  if (choice.effects.setEra) {
    setEra(choice.effects.setEra);
  }

  if (choice.effects.grantBonus) {
    const { type, value, target } = choice.effects.grantBonus;
    if (type === "era_multiplier" && target) {
      setAppState(
        "story",
        "eraBonuses",
        target,
        (prev: number = 1) => prev * value,
      );
    }
  }

  // Mark checkpoint as complete
  if (!checkpoint.completed && checkpoint.oneTime) {
    setAppState("story", "checkpoints", checkpointId, "completed", true);
    setAppState(
      "story",
      "checkpoints",
      checkpointId,
      "completedAt",
      Date.now(),
    );
    setAppState("story", "completedCheckpoints", (prev) => [
      ...prev,
      checkpointId,
    ]);

    // Calculate story progress after this checkpoint is counted
    const totalCheckpoints = Object.keys(story.checkpoints).length;
    const completedCount = story.completedCheckpoints.length + 1;
    const progress = Math.floor((completedCount / totalCheckpoints) * 100);
    setAppState("story", "storyProgress", progress);
  }

  // Clear pending choice
  setAppState("story", "pendingChoice", null);
  setAppState("story", "activeStory", null);

  // Show next story in queue if available
  if (story.storyQueue.length > 0) {
    const nextStoryId = story.storyQueue[0];
    setAppState("story", "storyQueue", (prev) => prev.slice(1));
    if (nextStoryId) {
      setAppState("story", "activeStory", nextStoryId);
    }
  }
};

export const resetCheckpoints = () => {
  const checkpoints = appState.story.checkpoints;
  Object.keys(checkpoints).forEach((checkpointId) => {
    setAppState("story", "checkpoints", checkpointId, "completed", false);
    setAppState("story", "checkpoints", checkpointId, "completedAt", undefined);
  });
  setAppState("story", "completedCheckpoints", []);
  setAppState("story", "storyProgress", 0);
  setAppState("story", "activeStory", null);
  setAppState("story", "storyQueue", []);
  setAppState("story", "currentEra", "PREHISTORY");
  setAppState("story", "eraBonuses", {});
  setAppState("story", "pendingChoice", null);
};

export const loadCheckpointState = (data: {
  completedCheckpoints: string[];
  currentEra: string;
}) => {
  setAppState("story", "completedCheckpoints", data.completedCheckpoints);
  setAppState("story", "currentEra", data.currentEra);

  // Mark checkpoints as completed
  data.completedCheckpoints.forEach((checkpointId) => {
    if (appState.story.checkpoints[checkpointId]) {
      setAppState("story", "checkpoints", checkpointId, "completed", true);
    }
  });

  // Calculate progress
  const totalCheckpoints = Object.keys(appState.story.checkpoints).length;
  const progress = Math.floor(
    (data.completedCheckpoints.length / totalCheckpoints) * 100,
  );
  setAppState("story", "storyProgress", progress);
};

// ============================================================================
// Game Log Actions
// ============================================================================

export type LogLevel = "info" | "success" | "warning" | "error";

export const addLog = (
  messageOrPayload: string | { message: string; level?: LogLevel },
  level: LogLevel = "info",
) => {
  const message =
    typeof messageOrPayload === "string"
      ? messageOrPayload
      : messageOrPayload.message;
  const resolvedLevel =
    typeof messageOrPayload === "string"
      ? level
      : (messageOrPayload.level ?? "info");

  const newLog = {
    id: `${Date.now()}-${Math.random()}`,
    message,
    level: resolvedLevel,
    timestamp: Date.now(),
  };

  setAppState("gameLog", "logs", (prev) => [...prev, newLog]);

  // Keep only the last maxLogs entries
  const maxLogs = appState.gameLog.maxLogs;
  if (appState.gameLog.logs.length > maxLogs) {
    setAppState("gameLog", "logs", (prev) => prev.slice(-maxLogs));
  }
};

export const clearLogs = () => {
  setAppState("gameLog", "logs", []);
};

// ============================================================================
// Store Export
// ============================================================================

export { appState, setAppState } from "./runtime";

// Re-export types for convenience
export type { GameState, Squirrel, JobSite, JoblessJobSite, Population };
export type { IdeasState };
export type { StoryState };
export type { GameLogState };
// Removed duplicate AppState export - it conflicts with interface above
