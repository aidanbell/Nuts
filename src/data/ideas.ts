import type { Idea } from "../types/ideas";
import { efficiencyIdea, unlockIdea } from "./defineIdea";

/**
 * Ideas / tech tree.
 * Prefer unlockIdea / efficiencyIdea from defineIdea.ts when adding entries.
 */
export const ideas: Record<string, Idea> = {
  // ==================== PREHISTORY ====================

  nutRecognition: efficiencyIdea({
    id: "nutRecognition",
    name: "Nut Recognition",
    description:
      "Learn to identify the best nuts by sight and smell. Find 2 nuts instead of 1 when foraging succeeds!",
    era: "PREHISTORY",
    cost: { nuts: 50 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "value",
        amount: 1,
      },
    },
    visible: true,
  }),

  efficientGathering: efficiencyIdea({
    id: "efficientGathering",
    name: "Efficient Gathering",
    description:
      "Develop better foraging instincts. Increases success chance from 50% to 60%.",
    era: "PREHISTORY",
    cost: { nuts: 75 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "chance",
        amount: 0.1,
      },
    },
    visible: true,
  }),

  keenNose: efficiencyIdea({
    id: "keenNose",
    name: "Keen Nose",
    description:
      "Trust your instincts - your nose knows! Forage attempts happen 20% faster.",
    era: "PREHISTORY",
    cost: { nuts: 120 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "time",
        amount: 300,
      },
    },
    visible: true,
  }),

  territorialAwareness: {
    id: "territorialAwareness",
    name: "Territorial Awareness",
    description:
      'Mark the best foraging spots. 20% more nuts from all your foraging! The concept of "work sites" begins to emerge...',
    category: "production",
    era: "PREHISTORY",
    cost: { nuts: 200 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "multi",
        amount: 0.2,
      },
    },
    researched: false,
    visible: true,
  },

  divisionOfLabor: unlockIdea({
    id: "divisionOfLabor",
    name: "Division of Labor",
    description:
      "Organize squirrels into specialized roles. Unlocks the Gatherer jobsite.",
    era: "PREHISTORY",
    cost: { nuts: 500 },
    effects: {
      unlockJobsites: ["gatherer"],
    },
    visible: true,
  }),

  scavengerWork: unlockIdea({
    id: "scavengerWork",
    name: "Scavenger Routes",
    description:
      "Map the underbrush and scrap piles. Unlocks the Scavenger jobsite — a second place to staff while chasing NutWood.",
    era: "PREHISTORY",
    requirements: {
      ideasResearched: ["divisionOfLabor"],
      maxEraAvailable: "WOOD_AGE",
    },
    cost: { nuts: 800 },
    effects: {
      unlockJobsites: ["scavenger"],
    },
  }),

  nutwoodCraft: unlockIdea({
    id: "nutwoodCraft",
    name: "NutWood Craft",
    description:
      "Press and bind nut husks into NutWood by hand. Opens the Refinement tab — stockpile wood across winters to chase the Wood Age.",
    era: "PREHISTORY",
    requirements: {
      ideasResearched: ["divisionOfLabor"],
      maxEraAvailable: "WOOD_AGE",
    },
    cost: { nuts: 1200 },
    effects: {
      unlockFeature: "refinement",
    },
  }),

  woodAge: unlockIdea({
    id: "woodAge",
    name: "The Wood Age",
    description:
      "Commit the colony to wooden tools and dens. Opens the Wood Age idea catalog (Stick Poker, Tree Climber, and more).",
    era: "PREHISTORY",
    requirements: {
      ideasResearched: ["nutwoodCraft"],
      maxEraAvailable: "WOOD_AGE",
      minHibernations: 2,
    },
    cost: { nuts: 2000, nutwood: 25 },
    effects: {
      setEra: "WOOD_AGE",
    },
  }),

  // ==================== WOOD AGE ====================

  stickPoker: unlockIdea({
    id: "stickPoker",
    name: "Stick Poker",
    description:
      "Sharpen sticks to pry nuts from tight spots. Unlocks the Stick Poker jobsite.",
    era: "WOOD_AGE",
    cost: { nuts: 2500, nutwood: 15 },
    effects: {
      unlockJobsites: ["stickPoker"],
    },
  }),

  treeClimbing: unlockIdea({
    id: "treeClimbing",
    name: "Climbing Techniques",
    description:
      "Reach the canopy with wooden climbing gear. Unlocks the Tree Climber jobsite.",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: ["stickPoker"],
    },
    cost: { nuts: 4000, nutwood: 25 },
    effects: {
      unlockJobsites: ["treeClimber"],
    },
  }),

  louderFlame: unlockIdea({
    id: "louderFlame",
    name: "Louder Flame",
    description:
      "Stack greener wood and taller piles. Unlocks Bonfire upgrades in Town — brighter signal, more travelers. A later-age craft.",
    era: "STONE_AGE",
    requirements: {
      ideasResearched: ["stickPoker"],
    },
    cost: { nuts: 4500, nutwood: 30 },
    effects: {
      unlockBuildings: ["bonfireUpgrades"],
    },
  }),

  bracedTools: efficiencyIdea({
    id: "bracedTools",
    name: "Braced Tools",
    description:
      "Lash sticks tighter. +10% efficiency at all production jobsites this season.",
    era: "WOOD_AGE",
    cost: { nuts: 1500, nutwood: 5 },
    effects: {
      globalEfficiency: 0.1,
    },
  }),

  canopyPaths: efficiencyIdea({
    id: "canopyPaths",
    name: "Canopy Paths",
    description:
      "Mark routes through the branches. +15% global efficiency this season.",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: ["treeClimbing"],
    },
    cost: { nuts: 3500, nutwood: 12 },
    effects: {
      globalEfficiency: 0.15,
    },
  }),

  woodAgeEfficiency: efficiencyIdea({
    id: "woodAgeEfficiency",
    name: "Wood Age Mastery",
    description:
      "Perfect wooden tools and dens. +20% global efficiency this season.",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: ["stickPoker", "bracedTools"],
    },
    cost: { nuts: 5000, nutwood: 20 },
    effects: {
      globalEfficiency: 0.2,
    },
  }),

  nutwoodRefinery: unlockIdea({
    id: "nutwoodRefinery",
    name: "NutWood Refinery",
    description:
      "Build a staffed press that binds husks while others forage. Automates NutWood — at the cost of a worker slot. A step toward Stone-age industry.",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: ["treeClimbing", "woodAgeEfficiency"],
    },
    cost: { nuts: 8000, nutwood: 40 },
    effects: {
      unlockRefinement: ["nutwoodRefinement"],
    },
  }),

  stoneAge: unlockIdea({
    id: "stoneAge",
    name: "The Stone Age",
    description:
      "Commit the colony to worked stone. Opens the Stone Age idea catalog (Ground Tiller, Basket Carrier, and more) — production sites are capped at 4 active from here on; a fifth means retiring one.",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: ["nutwoodRefinery"],
      maxEraAvailable: "STONE_AGE",
      minHibernations: 5,
    },
    cost: { nuts: 25000, nutwood: 150 },
    effects: {
      setEra: "STONE_AGE",
    },
  }),

  // ==================== STONE AGE ====================

  stoneTooling: {
    id: "stoneTooling",
    name: "Stone Tooling",
    description:
      "Craft the first stone tools. A technological revolution begins!",
    category: "unlock",
    era: "STONE_AGE",
    cost: { nuts: 3000 },
    effects: {
      unlockJobsites: ["groundTiller", "basketCarrier"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  advancedStoneTools: {
    id: "advancedStoneTools",
    name: "Advanced Stone Tools",
    description: "Develop more sophisticated stone implements.",
    category: "unlock",
    era: "STONE_AGE",
    requirements: {
      ideasResearched: ["stoneTooling"],
    },
    cost: { nuts: 4500 },
    effects: {
      unlockJobsites: ["branchBeater", "ledgePercher"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  stoneAgeEfficiency: {
    id: "stoneAgeEfficiency",
    name: "Stone Age Mastery",
    description: "Master stone tool techniques for improved production.",
    category: "efficiency",
    era: "STONE_AGE",
    requirements: {
      ideasResearched: ["woodAgeEfficiency"],
    },
    cost: { nuts: 6000 },
    effects: {
      globalEfficiency: 0.2,
    },
    researched: false,
    visible: false,
  },

  organizationBasics: {
    id: "organizationBasics",
    name: "Organization Basics",
    description: "Learn to organize your squirrels more effectively.",
    category: "capacity",
    era: "STONE_AGE",
    cost: { nuts: 5000 },
    effects: {
      unlockSquirrelCapacity: 5,
    },
    researched: false,
    visible: false,
  },

  // ==================== BRONZE AGE ====================

  agriculturalMethods: {
    id: "agriculturalMethods",
    name: "Agricultural Methods",
    description: "Unlock farming techniques for sustainable nut production.",
    category: "unlock",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
    },
    cost: { nuts: 5000 },
    effects: {
      unlockJobsites: ["farmer"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  groupForaging: {
    id: "groupForaging",
    name: "Group Foraging",
    description: "Organize gathering parties for more efficient collection.",
    category: "unlock",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
    },
    cost: { nuts: 5000 },
    effects: {
      unlockJobsites: ["gatheringParty"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  treeTechnology: {
    id: "treeTechnology",
    name: "Tree Technology",
    description: "Develop tools to shake nuts from trees more effectively.",
    category: "unlock",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
      ideasResearched: ["toolBasics"],
    },
    cost: { nuts: 7500 },
    effects: {
      unlockJobsites: ["treeThumper"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  heightAdvantage: {
    id: "heightAdvantage",
    name: "Height Advantage",
    description: "Learn to use stilts to reach higher branches.",
    category: "unlock",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
    },
    cost: { nuts: 6000 },
    effects: {
      unlockJobsites: ["stiltWalker"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  bronzeEfficiency: {
    id: "bronzeEfficiency",
    name: "Bronze Age Efficiency",
    description: "Master Bronze Age techniques to improve all production.",
    category: "efficiency",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
      ideasResearched: ["stoneAgeEfficiency"],
    },
    cost: { nuts: 10000 },
    effects: {
      globalEfficiency: 0.15, // Additional 15% increase
    },
    researched: false,
    visible: false,
  },

  expandedPopulation: {
    id: "expandedPopulation",
    name: "Expanded Population",
    description: "Support a larger squirrel community.",
    category: "capacity",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
      ideasResearched: ["organizationBasics"],
    },
    cost: { nuts: 8000 },
    effects: {
      unlockSquirrelCapacity: 10,
    },
    researched: false,
    visible: false,
  },

  costReduction: {
    id: "costReduction",
    name: "Cost Reduction",
    description: "Learn to build jobsites more efficiently.",
    category: "meta",
    era: "BRONZE_AGE",
    requirements: {
      era: "BRONZE_AGE",
    },
    cost: { nuts: 12000 },
    effects: {
      reduceJobsiteCost: 0.1, // 10% reduction in jobsite costs
    },
    researched: false,
    visible: false,
  },

  // ==================== IRON AGE ====================

  advancedFarming: {
    id: "advancedFarming",
    name: "Advanced Farming",
    description: "Develop sophisticated crop tending techniques.",
    category: "unlock",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
      ideasResearched: ["agriculturalMethods"],
    },
    cost: { nuts: 50000 },
    effects: {
      unlockJobsites: ["cropTender"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  groundOptimization: {
    id: "groundOptimization",
    name: "Ground Optimization",
    description: "Rake the forest floor for maximum nut collection.",
    category: "unlock",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
    },
    cost: { nuts: 45000 },
    effects: {
      unlockJobsites: ["floorRakers"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  mechanicalShaking: {
    id: "mechanicalShaking",
    name: "Mechanical Shaking",
    description: "Create mechanical tree shakers for better yields.",
    category: "unlock",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
      ideasResearched: ["treeTechnology", "advancedStoneTools"],
    },
    cost: { nuts: 60000 },
    effects: {
      unlockJobsites: ["treeShaker"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  verticalExpansion: {
    id: "verticalExpansion",
    name: "Vertical Expansion",
    description: "Build lift systems to access the highest branches.",
    category: "unlock",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
      ideasResearched: ["heightAdvantage"],
    },
    cost: { nuts: 55000 },
    effects: {
      unlockJobsites: ["treeLifts"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  ironEfficiency: {
    id: "ironEfficiency",
    name: "Iron Age Mastery",
    description: "Master Iron Age technology for massive efficiency gains.",
    category: "efficiency",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
      ideasResearched: ["bronzeEfficiency"],
    },
    cost: { nuts: 75000 },
    effects: {
      globalEfficiency: 0.25, // Additional 25% increase
    },
    researched: false,
    visible: false,
  },

  massProduction: {
    id: "massProduction",
    name: "Mass Production",
    description: "Organize your colony for large-scale operations.",
    category: "capacity",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
      ideasResearched: ["expandedPopulation"],
    },
    cost: { nuts: 80000 },
    effects: {
      unlockSquirrelCapacity: 25,
    },
    researched: false,
    visible: false,
  },

  automation101: {
    id: "automation101",
    name: "Automation 101",
    description: "Take the first steps toward automated production.",
    category: "automation",
    era: "IRON_AGE",
    requirements: {
      era: "IRON_AGE",
      ideasResearched: ["mechanicalShaking"],
    },
    cost: { nuts: 100000 },
    effects: {
      globalEfficiency: 0.1, // Boost to all production
    },
    researched: false,
    visible: false,
  },
};

// Helper functions
export const getIdeasByEra = (era: string): Idea[] => {
  return Object.values(ideas).filter((idea) => idea.era === era);
};

export const getVisibleIdeas = (): Idea[] => {
  return Object.values(ideas).filter((idea) => idea.visible);
};

export const getResearchedIdeas = (): Idea[] => {
  return Object.values(ideas).filter((idea) => idea.researched);
};

export const getAffordableIdeas = (nutsTotal: number): Idea[] => {
  return Object.values(ideas).filter(
    (idea) =>
      idea.visible && !idea.researched && (idea.cost.nuts || 0) <= nutsTotal,
  );
};
