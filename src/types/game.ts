import type { MetaState } from "./meta";

export interface Squirrel {
  _id: number;
  employed: boolean;
  jobSite: string | null;
  total: number;
}

export interface JobSite {
  id: string;
  name: string;

  // Building capacity system
  maxSquirrels: number; // Maximum squirrels that can be assigned
  workers: number[]; // Array of squirrel IDs currently assigned

  // Production system
  baseProduction: number; // Passive production per second (without squirrels)
  squirrelBonus: number; // Additional production per second per squirrel assigned
  time: number; // Legacy: may be used for animation/display timing
  multi: number; // Global multiplier from upgrades
  value: number; // Legacy: base value for calculations

  // Refinement system (for type: "refinement")
  consumes?: {
    resource: "nuts" | "nutwood" | "stone" | "bronze" | "iron";
    amount: number; // Amount consumed per production cycle
  };
  produces?: {
    resource: "nutwood" | "stone" | "bronze" | "iron";
    amount: number; // Amount produced per production cycle
  };

  // Upgrade system
  level: number; // Number of times upgraded
  maxLevel?: number; // Optional upgrade cap
  cost: number; // Current upgrade cost
  costGrowthRate: number; // Exponential growth rate (e.g., 1.15 = 15% increase per purchase)
  baseCost: number; // Original base cost for recalculation

  // Metadata
  type: "production" | "refinement";
  method: "ground" | "air" | "refinement";
  unlocked: boolean;
}

export interface JoblessJobSite {
  time: number; // Milliseconds between foraging attempts
  value: number; // Nuts found per successful forage
  chance: number; // Probability of finding nuts (0-1)
  multi: number; // Multiplier from upgrades
  level: number;
  cost: number;
  method: "ground" | "air";
}

export interface Population {
  jobless: number[]; // Array of squirrel IDs
  [key: string]: number[]; // Dynamic jobsite populations
}

export interface GameState {
  // Core resources
  nutsTotal: number;
  nutsAllTime: number;
  goldNuts: {
    total: number;
    multi: number;
  };

  // Refined resources
  resources: {
    nutwood: number;
    stone: number;
    bronze: number;
    iron: number;
  };

  // Population and jobs
  squirrels: Record<number, Squirrel>;
  nextSquirrelId: number;
  population: Population;
  jobSites: {
    jobless: JoblessJobSite;
    production: Record<string, JobSite>;
    refinement: Record<string, JobSite>;
  };

  // Get button
  getButton: {
    value: number;
    mult: number;
  };

  // Game settings
  gameSpeed: number;
  isPaused: boolean;
  tick: number;
  lastUpdate: number;

  // UI state
  activeTab: string;
  unlockedTabs: string[];

  /**
   * Seasonal settlement (wipes on hibernate).
   * Durable buildings will live elsewhere later.
   */
  town: {
    woodenHouses: number;
    /** 0 = not built this season; 1+ = lit (attraction rolls) */
    bonfireLevel: number;
  };

  // Timer
  timer: {
    ms: number;
    s: number;
    m: number;
  };
}

export interface GameUpdate {
  type: "ADD_NUTS" | "UPDATE_SQUIRREL" | "UPDATE_JOBSITE";
  data: {
    amount?: number;
    id?: number | string;
    changes?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface SaveData {
  nutsTotal: number;
  nutsAllTime: number;
  goldNuts: {
    total: number;
    multi: number;
  };
  squirrels: Record<number, Squirrel>;
  nextSquirrelId: number;
  population: Population;
  jobSites: {
    jobless: JoblessJobSite;
    production: Record<string, JobSite>;
    refinement: Record<string, JobSite>;
  };
  getButton: {
    value: number;
    mult: number;
  };
  resources?: GameState["resources"];
  unlockedTabs?: string[];
  activeTab?: string;
  timer?: GameState["timer"];
  clearing?: GameState["town"];
  town?: GameState["town"];
  meta?: MetaState;
  story?: {
    completedCheckpoints: string[];
    currentEra: string | null;
  };
  ideas?: {
    researchedIdeas: string[];
  };
  timestamp: number;
}
