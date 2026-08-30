export type IdeaCategory =
  | "unlock" // One-and-done structure: jobsites, tabs, eras
  | "production" // Production-oriented (non-unlock)
  | "efficiency" // Improve production rates
  | "capacity" // Unlock more squirrels or capacity
  | "automation" // Reduce manual clicking
  | "meta"; // Other meta upgrades

export type IdeaEra =
  | "PREHISTORY"
  | "WOOD_AGE"
  | "STONE_AGE"
  | "BRONZE_AGE"
  | "IRON_AGE"
  | "INDUSTRIAL_AGE"
  | "INFORMATION_AGE"
  | "TECHNOLOGY_AGE"
  | "SPACE_AGE"
  | "GALACTIC_AGE";

export interface IdeaCost {
  nuts?: number;
  nutwood?: number;
  stone?: number;
  bronze?: number;
  // Add more resources as needed
}

export interface IdeaEffect {
  unlockJobsites?: string[];
  unlockBuildings?: string[];
  unlockRefinement?: string[]; // Unlock refinement jobsites
  increaseGatherMulti?: number; // Increase all gathering by %
  unlockSquirrelCapacity?: number; // Unlock ability to have more squirrels
  upgradeJobsite?: {
    // Increase specific jobsite property
    jobsiteId: string;
    property: string;
    amount: number;
  };
  globalEfficiency?: number; // Increase all production by %
  reduceJobsiteCost?: number; // Reduce jobsite purchase costs by %
  unlockFeature?: string; // Unlock a specific feature/tab
  increaseGetButton?: number; // Increase get button value
  setEra?: IdeaEra; // Advance current era (era-as-idea)
}

export interface Idea {
  id: string;
  name: string;
  description: string;
  category: IdeaCategory;
  era: IdeaEra;

  /**
   * Research gates only (not visibility). Idea must be visible via era catalog.
   */
  requirements?: {
    era?: IdeaEra;
    nutsCollected?: number;
    squirrelsCount?: number;
    jobsitesPurchased?: number;
    ideasResearched?: string[];
    /** Meta must allow this era (e.g. Wood Age after first winter) */
    maxEraAvailable?: IdeaEra;
    /** Completed hibernations required (e.g. Wood Age after second winter) */
    minHibernations?: number;
  };

  // Cost to research
  cost: IdeaCost;

  // What happens when researched
  effects: IdeaEffect;

  /**
   * Structure ideas (jobsite/tab unlocks) survive winter.
   * Season ideas (efficiency buffs, etc.) reset each hibernation.
   */
  persists?: boolean;

  // Metadata
  researched: boolean;
  researchedAt?: number;
  /** Synced from era catalog — do not drip-unlock */
  visible: boolean;
}

export interface IdeasState {
  ideas: Record<string, Idea>;
  researchedIdeas: string[];
  researchedCount: number;
  totalResearchPoints: number; // Future: alternative currency for research
}
