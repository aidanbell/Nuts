import type { JobSite } from "../types/game";

/**
 * Jobsite templates — add new sites here, unlock via an `unlockIdea` in ideas.ts.
 * Refinement sites do not count toward the production roster soft/hard cap.
 */

/** Stone+ hard roster cap — active (built, level >= 1) production sites. Refinement excluded. */
export const PRODUCTION_ROSTER_CAP = 4;

export const refinementJobsites: JobSite[] = [
  {
    id: "nutwoodRefinement",
    name: "NutWood Refinery",
    maxSquirrels: 2,
    workers: [],
    baseProduction: 0,
    squirrelBonus: 0,
    time: 30000,
    multi: 1,
    level: 0,
    cost: 100,
    costGrowthRate: 1.15,
    baseCost: 100,
    value: 1,
    type: "refinement",
    method: "refinement",
    unlocked: false,
    consumes: [{ resource: "nuts", amount: 100 }],
    produces: {
      resource: "nutwood",
      amount: 1,
    },
  },
  {
    id: "nutRockQuarry",
    name: "Stone Quarry",
    maxSquirrels: 2,
    workers: [],
    baseProduction: 0,
    squirrelBonus: 0,
    time: 30000,
    multi: 1,
    level: 0,
    cost: 800,
    costGrowthRate: 1.15,
    baseCost: 800,
    value: 1,
    type: "refinement",
    method: "refinement",
    unlocked: false,
    consumes: [
      { resource: "nuts", amount: 1000 },
      { resource: "nutwood", amount: 10 },
    ],
    produces: {
      resource: "stone",
      amount: 1,
    },
  },
  {
    id: "researchLab",
    name: "Research Lab",
    maxSquirrels: 2,
    workers: [],
    baseProduction: 0,
    squirrelBonus: 0,
    time: 25000,
    multi: 1,
    level: 0,
    cost: 400,
    costGrowthRate: 1.15,
    baseCost: 400,
    value: 1,
    type: "refinement",
    method: "refinement",
    unlocked: false,
    consumes: [{ resource: "nuts", amount: 300 }],
    produces: {
      resource: "researchResin",
      amount: 3,
    },
  },
];

export const productionJobsites: JobSite[] = [
  // ----- PREHISTORY (soft roster: 2) -----
  {
    id: "gatherer",
    name: "Gatherer",
    maxSquirrels: 1,
    maxLevel: 10,
    workers: [],
    baseProduction: 0.4,
    squirrelBonus: 2.2,
    time: 2000,
    multi: 1,
    level: 0,
    cost: 120,
    costGrowthRate: 1.18,
    baseCost: 120,
    value: 1.67,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "scavenger",
    name: "Scavenger",
    maxSquirrels: 1,
    maxLevel: 10,
    workers: [],
    baseProduction: 0.55,
    squirrelBonus: 2.8,
    time: 1800,
    multi: 1,
    level: 0,
    cost: 200,
    costGrowthRate: 1.25,
    baseCost: 200,
    value: 2.0,
    type: "production",
    method: "ground",
    unlocked: false,
  },

  // ----- WOOD AGE (+2 → soft roster 4) -----
  {
    id: "stickPoker",
    name: "Stick Poker",
    maxSquirrels: 1,
    maxLevel: 12,
    workers: [],
    baseProduction: 0.7,
    squirrelBonus: 3.5,
    time: 1600,
    multi: 1,
    level: 0,
    cost: 350,
    costGrowthRate: 1.22,
    baseCost: 350,
    value: 2.5,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "treeClimber",
    name: "Tree Climber",
    maxSquirrels: 1,
    maxLevel: 12,
    workers: [],
    baseProduction: 0.9,
    squirrelBonus: 4.6,
    time: 1500,
    multi: 1,
    level: 0,
    cost: 500,
    costGrowthRate: 1.2,
    baseCost: 500,
    value: 3.0,
    type: "production",
    method: "air",
    unlocked: false,
  },

  // ----- STONE AGE (hard cap 4 active — see PRODUCTION_ROSTER_CAP) -----
  // costGrowthRate raised 1.2 -> 1.28: the previous curve made a Stone site
  // affordable to fully max (~43k nuts for Ground Tiller) for LESS than the
  // era-unlock cost itself (25k nuts + 150 nutwood), so it maxed out within
  // minutes of entering the era. 1.28 puts the total-to-max around 8x the
  // era-unlock cost (~200k for Ground Tiller) — a real mid-era goal, not a
  // freebie. baseCost bumped too so the early levels aren't trivial either.
  {
    id: "groundTiller",
    name: "Ground Tiller",
    maxSquirrels: 1,
    maxLevel: 15,
    workers: [],
    baseProduction: 1.2,
    squirrelBonus: 5.5,
    time: 1200,
    multi: 1,
    level: 0,
    cost: 1400,
    costGrowthRate: 1.28,
    baseCost: 1400,
    value: 5.0,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "basketCarrier",
    name: "Basket Carrier",
    maxSquirrels: 1,
    maxLevel: 15,
    workers: [],
    baseProduction: 1.5,
    squirrelBonus: 7.0,
    time: 1100,
    multi: 1,
    level: 0,
    cost: 2100,
    costGrowthRate: 1.28,
    baseCost: 2100,
    value: 6.0,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "branchBeater",
    name: "Branch Beater",
    maxSquirrels: 1,
    maxLevel: 15,
    workers: [],
    baseProduction: 1.9,
    squirrelBonus: 9.0,
    time: 1000,
    multi: 1,
    level: 0,
    cost: 3200,
    costGrowthRate: 1.28,
    baseCost: 3200,
    value: 7.5,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "ledgePercher",
    name: "Ledge Percher",
    maxSquirrels: 1,
    maxLevel: 15,
    workers: [],
    baseProduction: 2.4,
    squirrelBonus: 11.5,
    time: 900,
    multi: 1,
    level: 0,
    cost: 4600,
    costGrowthRate: 1.28,
    baseCost: 4600,
    value: 9.0,
    type: "production",
    method: "air",
    unlocked: false,
  },
];

/**
 * Lookup helper for unlocks / tooling. Deep-clones — callers hand the result
 * into the store, and Solid's store proxies whatever object reference it's
 * given rather than cloning it. Without this, a later mutation of a nested
 * field (e.g. a refinery's `produces.amount` on upgrade) would leak back
 * into this shared module-level template and corrupt every future unlock.
 */
export function getJobsiteTemplate(id: string): JobSite | undefined {
  const found =
    productionJobsites.find((js) => js.id === id) ||
    refinementJobsites.find((js) => js.id === id);
  return found ? structuredClone(found) : undefined;
}
