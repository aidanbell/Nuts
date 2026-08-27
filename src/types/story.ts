export type CheckpointTriggerType =
  | "nuts_collected"
  | "time_elapsed"
  | "squirrels_count"
  | "jobsites_purchased"
  | "era_reached"
  | "building_built"
  | "idea_researched"
  | "hibernations_completed"
  | "resource_count" // Amount of a specific refined resource
  | "combined"; // Multiple conditions required

export interface CheckpointCondition {
  type: CheckpointTriggerType;
  value: number | string;
  operator?: ">=" | ">" | "==" | "<" | "<=";
  resource?: "nutwood" | "stone" | "bronze" | "iron"; // For resource_count triggers
}

export interface StoryCheckpoint {
  id: string;
  name: string;
  description: string;

  // Trigger conditions (OR logic - any one triggers it)
  triggers?: CheckpointCondition[];

  // Required conditions (AND logic - all must be true)
  requirements?: CheckpointCondition[];

  // What happens when checkpoint is reached
  effects: {
    unlockSquirrels?: number;
    unlockJobsites?: string[];
    unlockBuildings?: string[];
    unlockTabs?: string[];
    nutReward?: number; // Bonus nuts awarded when checkpoint triggers
    showStory?: boolean;
    pauseGame?: boolean;
    setEra?: string; // Set the current era
  };

  // Story content
  story?: {
    title: string;
    body: string;
    character?: string; // Who's speaking
    choices?: StoryChoice[];
  };

  // Metadata
  completed: boolean;
  completedAt?: number;
  priority: number; // Higher priority checkpoints check first
  oneTime: boolean; // Can only trigger once
  repeatable?: boolean;
}

export interface StoryChoice {
  id: string;
  text: string;
  description?: string; // Optional flavor text for the choice
  requirements?: CheckpointCondition[]; // Conditions to enable this choice
  effects?: {
    setEra?: string;
    grantBonus?: {
      type: "global_multiplier" | "era_multiplier" | "resource_bonus";
      value: number;
      target?: string; // Which era or resource
    };
    unlockFeature?: string;
    addNuts?: number;
  };
  nextCheckpoint?: string;
}

export interface StoryState {
  checkpoints: Record<string, StoryCheckpoint>;
  activeStory: string | null;
  storyQueue: string[]; // Queue of checkpoint IDs waiting to be shown
  completedCheckpoints: string[];
  currentEra: string | null;
  storyProgress: number; // 0-100 overall story completion
  eraBonuses: Record<string, number>; // Multipliers from delayed era advancement
  pendingChoice: string | null; // ID of checkpoint waiting for player choice
}
