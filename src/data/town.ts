/**
 * Town (settlement) — seasonal structures + display scale names.
 * Wooden buildings wipe on hibernate; Stone+ durable housing survives it.
 */

export interface WoodenHouseConfig {
  /** Nuts to build the first house */
  nutCost: number;
  /** NutWood to build the first house */
  nutwoodCost: number;
  /** Cost multiplier per additional house this season */
  costGrowthRate: number;
  /** Extra squirrel soft-cap per house */
  capBonus: number;
  /** Max houses buildable in one season */
  maxPerSeason: number;
}

export const WOODEN_HOUSE: WoodenHouseConfig = {
  nutCost: 400,
  // 50 was steeper than the Wood Age idea that unlocks housing in the first
  // place (Stick Poker needs 15 nutwood) — a house shouldn't outcost the
  // content that leads to it. Growth curve stays steep on purpose.
  nutwoodCost: 15,
  costGrowthRate: 2.5,
  capBonus: 2,
  maxPerSeason: 3,
};

/** Next house cost given how many are already built this season. */
export function getWoodenHouseCost(housesBuilt: number): {
  nuts: number;
  nutwood: number;
} {
  const mult = Math.pow(WOODEN_HOUSE.costGrowthRate, Math.max(0, housesBuilt));
  return {
    nuts: Math.round(WOODEN_HOUSE.nutCost * mult),
    nutwood: Math.round(WOODEN_HOUSE.nutwoodCost * mult),
  };
}

/** Stone+ durable housing — a slow permanent investment that survives winter. */
export interface DurableHouseConfig {
  nutCost: number;
  nutwoodCost: number;
  /** Cost multiplier per house already built (cumulative, never resets) */
  costGrowthRate: number;
  /** Extra squirrel soft-cap per house */
  capBonus: number;
}

export const DURABLE_HOUSE: DurableHouseConfig = {
  nutCost: 3000,
  nutwoodCost: 200,
  costGrowthRate: 1.6,
  capBonus: 4,
};

/** Next durable house cost given how many are already built (all-time). */
export function getDurableHouseCost(built: number): {
  nuts: number;
  nutwood: number;
} {
  const mult = Math.pow(DURABLE_HOUSE.costGrowthRate, Math.max(0, built));
  return {
    nuts: Math.round(DURABLE_HOUSE.nutCost * mult),
    nutwood: Math.round(DURABLE_HOUSE.nutwoodCost * mult),
  };
}

/** First attractor — seasonal build; knowledge persists via meta.unlockedTownBuildings */
export interface BonfireConfig {
  id: string;
  nutCost: number;
  nutwoodCost: number;
  /** Ms between attraction rolls at level 1 */
  checkIntervalMs: number;
  /** Chance per roll at level 1 */
  baseChance: number;
  /** Each upgrade multiplies interval by this (<1 = faster) */
  upgradeIntervalFactor: number;
  /** Each upgrade adds this to chance */
  upgradeChanceBonus: number;
  upgradeNutCost: number;
  upgradeNutwoodCost: number;
  upgradeCostGrowth: number;
  maxLevel: number;
  /** Roll chance is multiplied by this per consecutive failed roll (room
   * available) — doubling means level 1's 20%/30s guarantees a join by the
   * 4th roll (20% → 40% → 80% → 100%), a 2min worst-case wait. */
  pityMultiplier: number;
}

export const BONFIRE: BonfireConfig = {
  id: "bonfire",
  nutCost: 600,
  nutwoodCost: 20,
  checkIntervalMs: 30_000,
  baseChance: 0.2,
  upgradeIntervalFactor: 0.85,
  upgradeChanceBonus: 0.04,
  upgradeNutCost: 1200,
  upgradeNutwoodCost: 25,
  upgradeCostGrowth: 2.0,
  maxLevel: 5,
  pityMultiplier: 2,
};

/** Town unlock id — research Louder Flame before upgrades appear */
export const BONFIRE_UPGRADES_ID = "bonfireUpgrades";

export function getBonfireStats(level: number): {
  checkIntervalMs: number;
  chance: number;
} | null {
  if (level < 1) return null;
  const steps = level - 1;
  return {
    checkIntervalMs: Math.round(
      BONFIRE.checkIntervalMs * Math.pow(BONFIRE.upgradeIntervalFactor, steps),
    ),
    chance: Math.min(
      0.85,
      BONFIRE.baseChance + BONFIRE.upgradeChanceBonus * steps,
    ),
  };
}

export function getBonfireUpgradeCost(level: number): {
  nuts: number;
  nutwood: number;
} {
  const mult = Math.pow(BONFIRE.upgradeCostGrowth, Math.max(0, level - 1));
  return {
    nuts: Math.round(BONFIRE.upgradeNutCost * mult),
    nutwood: Math.round(BONFIRE.upgradeNutwoodCost * mult),
  };
}

export interface SettlementScale {
  id: string;
  label: string;
  /** Minimum squirrel count */
  minPop: number;
  /** Minimum wooden houses this season */
  minHouses: number;
}

/** Highest matching scale wins (ordered low → high). */
export const SETTLEMENT_SCALES: SettlementScale[] = [
  { id: "clearing", label: "Clearing", minPop: 0, minHouses: 0 },
  { id: "village", label: "Village", minPop: 10, minHouses: 0 },
  { id: "hamlet", label: "Hamlet", minPop: 20, minHouses: 1 },
  { id: "homestead", label: "Homestead", minPop: 40, minHouses: 1 },
  { id: "borough", label: "Borough", minPop: 80, minHouses: 2 },
  { id: "town", label: "Town", minPop: 160, minHouses: 4 },
  { id: "city", label: "City", minPop: 320, minHouses: 8 },
  { id: "metropolis", label: "Metropolis", minPop: 640, minHouses: 16 },
  { id: "megapolis", label: "Megapolis", minPop: 1280, minHouses: 32 },
  {
    id: "urban_macropolis",
    label: "Urban Macropolis",
    minPop: 2560,
    minHouses: 64,
  },
  {
    id: "intercontinental_system",
    label: "Intercontinental System",
    minPop: 5120,
    minHouses: 128,
  },
  {
    id: "global_system",
    label: "Global System",
    minPop: 10240,
    minHouses: 256,
  },
];

export function getSettlementScale(
  squirrelCount: number,
  woodenHouses: number,
): SettlementScale {
  let best = SETTLEMENT_SCALES[0];
  for (const scale of SETTLEMENT_SCALES) {
    if (squirrelCount >= scale.minPop && woodenHouses >= scale.minHouses) {
      best = scale;
    }
  }
  return best;
}

/** Tab id in unlockedTabs / navigation */
export const TOWN_TAB_ID = "town";
