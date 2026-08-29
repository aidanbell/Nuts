import type { Idea } from "../types/ideas";

/**
 * Ideas represent the research/tech tree of the game.
 * They unlock jobsites, buildings, and provide various meta upgrades.
 */
export const ideas: Record<string, Idea> = {
  // ==================== PREHISTORY ====================

  nutRecognition: {
    id: "nutRecognition",
    name: "Nut Recognition",
    description:
      "Learn to identify the best nuts by sight and smell. Find 2 nuts instead of 1 when foraging succeeds!",
    category: "efficiency",
    era: "PREHISTORY",
    cost: { nuts: 50 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "value",
        amount: 1,
      },
    },
    researched: false,
    visible: true,
  },

  efficientGathering: {
    id: "efficientGathering",
    name: "Efficient Gathering",
    description:
      "Develop better foraging instincts. Increases success chance from 50% to 60%.",
    category: "efficiency",
    era: "PREHISTORY",
    requirements: {
      nutsCollected: 100,
    },
    cost: { nuts: 150 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "chance",
        amount: 0.1,
      },
    },
    researched: false,
    visible: false,
  },

  keenNose: {
    id: "keenNose",
    name: "Keen Nose",
    description:
      "Trust your instincts - your nose knows! Forage attempts happen 20% faster.",
    category: "efficiency",
    era: "PREHISTORY",
    requirements: {
      nutsCollected: 175,
      squirrelsCount: 2,
    },
    cost: { nuts: 200 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "time",
        amount: 300, // Reduces from 1500ms to 1200ms
      },
    },
    researched: false,
    visible: false,
  },

  territorialAwareness: {
    id: "territorialAwareness",
    name: "Territorial Awareness",
    description:
      'Mark the best foraging spots. 20% more nuts from all your foraging! The concept of "work sites" begins to emerge...',
    category: "production",
    era: "PREHISTORY",
    requirements: {
      nutsCollected: 250,
      squirrelsCount: 3,
    },
    cost: { nuts: 300 },
    effects: {
      upgradeJobsite: {
        jobsiteId: "jobless",
        property: "multi",
        amount: 0.2,
      },
    },
    researched: false,
    visible: false,
  },

  divisionOfLabor: {
    id: "divisionOfLabor",
    name: "Division of Labor",
    description:
      "Organize your squirrels into specialized roles. Unlock the first jobsites!",
    category: "production",
    era: "PREHISTORY",
    cost: { nuts: 500 },
    effects: {
      unlockJobsites: ["gatherer"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  discoverRefinement: {
    id: "discoverRefinement",
    name: "Discover Refinement",
    description:
      "Your squirrels discover they can process nuts into refined materials! Unlock manual refinement.",
    category: "production",
    era: "PREHISTORY",
    requirements: {
      nutsCollected: 800,
      squirrelsCount: 5,
      ideasResearched: ["divisionOfLabor"],
    },
    cost: { nuts: 800 },
    effects: {
      unlockFeature: "refinement",
    },
    persists: true,
    researched: false,
    visible: false,
  },

  // ==================== WOOD AGE ====================

  airMethods: {
    id: "airMethods",
    name: "Climbing Techniques",
    description:
      "Master the art of climbing to harvest nuts from the canopy above. Requires NutWood to build climbing tools.",
    category: "production",
    era: "WOOD_AGE",
    requirements: {
      era: "WOOD_AGE",
    },
    cost: {
      nuts: 750,
      nutwood: 5,
    },
    effects: {
      unlockJobsites: ["treeClimber"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  woodRefinement: {
    id: "woodRefinement",
    name: "Wood Refinement",
    description: "Learn to process nuts into usable nutwood materials.",
    category: "production",
    era: "WOOD_AGE",
    requirements: {
      nutsCollected: 2000,
      jobsitesPurchased: 5,
    },
    cost: { nuts: 1500 },
    effects: {
      unlockRefinement: ["nutWood"],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  woodAgeEfficiency: {
    id: "woodAgeEfficiency",
    name: "Wood Age Mastery",
    description: "Perfect your wooden tools and techniques.",
    category: "efficiency",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: ["basicForaging"],
    },
    cost: { nuts: 2000 },
    effects: {
      globalEfficiency: 0.15,
    },
    researched: false,
    visible: false,
  },

  // ==================== STONE AGE ====================

  stoneTooling: {
    id: "stoneTooling",
    name: "Stone Tooling",
    description:
      "Craft the first stone tools. A technological revolution begins!",
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
    category: "production",
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
