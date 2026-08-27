import type { JobSite } from "../types/game";

export const refinementJobsites: JobSite[] = [
  // NutWood Refinement - First refined resource
  {
    id: "nutwoodRefinement",
    name: "NutWood Refinery",
    maxSquirrels: 2,
    workers: [],
    baseProduction: 0, // Refinement doesn't produce nuts
    squirrelBonus: 0,
    time: 30000, // 30 seconds per production cycle
    multi: 1,
    level: 0,
    cost: 100, // Cost in nuts to build
    costGrowthRate: 1.15,
    baseCost: 100,
    value: 1, // Legacy
    type: "refinement",
    method: "refinement",
    unlocked: false,
    consumes: {
      resource: "nuts",
      amount: 100, // 100 nuts per cycle
    },
    produces: {
      resource: "nutwood",
      amount: 1, // 1 nutwood per cycle
    },
  },
];

export const productionJobsites: JobSite[] = [
  // WOOD AGE
  // Following exponential cost growth: cost_next = baseCost × (costGrowthRate)^level
  // Production split: ~40% passive baseProduction, ~60% from squirrels
  // This makes buildings valuable even without squirrels, but squirrels significantly boost output
  {
    id: "gatherer",
    name: "Gatherer",
    maxSquirrels: 1,
    maxLevel: 10,
    workers: [],
    // Tuned so staffing beats maxed jobless (~1.2 nps): assignment is the payoff
    baseProduction: 0.4,
    squirrelBonus: 2.2,
    // With 1 squirrel: 0.4 + 2.2 = 2.6 nuts/sec (~2.2x maxed jobless)
    time: 2000,
    multi: 1,
    level: 0,
    cost: 20,
    costGrowthRate: 1.15,
    baseCost: 20,
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
    baseProduction: 0.5,
    squirrelBonus: 2.9,
    // With 1 squirrel: 0.5 + 2.9 = 3.4 nuts/sec
    time: 1800,
    multi: 1,
    level: 0,
    cost: 30,
    costGrowthRate: 1.15,
    baseCost: 30,
    value: 2.0,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "rockThrower",
    name: "Rock Thrower",
    maxSquirrels: 1,
    maxLevel: 10,
    workers: [],
    baseProduction: 0.65,
    squirrelBonus: 3.6,
    // With 1 squirrel: 0.65 + 3.6 = 4.25 nuts/sec
    time: 1600,
    multi: 1,
    level: 0,
    cost: 45,
    costGrowthRate: 1.15,
    baseCost: 45,
    value: 2.5,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "treeClimber",
    name: "Tree Climber",
    maxSquirrels: 1,
    maxLevel: 10,
    workers: [],
    baseProduction: 0.85,
    squirrelBonus: 4.5,
    // With 1 squirrel: 0.85 + 4.5 = 5.35 nuts/sec
    time: 1500,
    multi: 1,
    level: 0,
    cost: 65,
    costGrowthRate: 1.15,
    baseCost: 65,
    value: 3.0,
    type: "production",
    method: "air",
    unlocked: false,
  },

  // STONE AGE — kept above Wood Age top (~5.35 nps with 1 squirrel)
  {
    id: "groundTiller",
    name: "Ground Tiller",
    maxSquirrels: 1,
    workers: [],
    baseProduction: 1.2,
    squirrelBonus: 5.5,
    // With 1 squirrel: 1.2 + 5.5 = 6.7 nuts/sec
    time: 1200,
    multi: 1,
    level: 0,
    cost: 100,
    costGrowthRate: 1.15,
    baseCost: 100,
    value: 5.0,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "basketCarrier",
    name: "Basket Carrier",
    maxSquirrels: 1,
    workers: [],
    baseProduction: 1.5,
    squirrelBonus: 7.0,
    // With 1 squirrel: 1.5 + 7.0 = 8.5 nuts/sec
    time: 1100,
    multi: 1,
    level: 0,
    cost: 150,
    costGrowthRate: 1.15,
    baseCost: 150,
    value: 6.0,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "branchBeater",
    name: "Branch Beater",
    maxSquirrels: 1,
    workers: [],
    baseProduction: 1.9,
    squirrelBonus: 9.0,
    // With 1 squirrel: 1.9 + 9.0 = 10.9 nuts/sec
    time: 1000,
    multi: 1,
    level: 0,
    cost: 225,
    costGrowthRate: 1.15,
    baseCost: 225,
    value: 7.5,
    type: "production",
    method: "ground",
    unlocked: false,
  },
  {
    id: "ledgePercher",
    name: "Ledge Percher",
    maxSquirrels: 1,
    workers: [],
    baseProduction: 2.4,
    squirrelBonus: 11.5,
    // With 1 squirrel: 2.4 + 11.5 = 13.9 nuts/sec
    time: 900,
    multi: 1,
    level: 0,
    cost: 325,
    costGrowthRate: 1.15,
    baseCost: 325,
    value: 9.0,
    type: "production",
    method: "air",
    unlocked: false,
  },
];
