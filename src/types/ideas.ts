export type IdeaCategory =
  | "production" // Unlock jobsites
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
}

export interface Idea {
  id: string;
  name: string;
  description: string;
  category: IdeaCategory;
  era: IdeaEra;

  // Requirements to see this idea
  requirements?: {
    era?: IdeaEra;
    nutsCollected?: number;
    squirrelsCount?: number;
    jobsitesPurchased?: number;
    ideasResearched?: string[]; // Prerequisite ideas
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
  visible: boolean; // Whether player can see this idea yet
}

export interface IdeasState {
  ideas: Record<string, Idea>;
  researchedIdeas: string[];
  researchedCount: number;
  totalResearchPoints: number; // Future: alternative currency for research
}
