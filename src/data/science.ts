import type { Idea } from "../types/ideas";

/**
 * Science tab — the formal research tree. Priced in Research Resin, produced
 * by squirrels staffed at the Research Lab (unlocked by `scientificMethod`
 * in data/ideas.ts). Everything here is a colony-wide multiplier or capacity
 * bump; hands-on skill upgrades (foraging instinct, jobless buffs) stay in
 * the nut-priced Ideas catalog since they matter before the Lab exists.
 *
 * All entries require "scientificMethod" directly or transitively — see
 * requirements.ideasResearched chains below.
 */
export const scienceIdeas: Record<string, Idea> = {
  // ==================== STONE AGE ====================

  stoneAgeEfficiency: {
    id: "stoneAgeEfficiency",
    name: "Stone Age Mastery",
    description:
      "Formalize stone tool technique into a shared discipline. +20% global efficiency this season.",
    category: "efficiency",
    era: "STONE_AGE",
    requirements: {
      ideasResearched: ["scientificMethod", "canopyLadders"],
    },
    cost: { researchResin: 40, stone: 10 },
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
    requirements: {
      ideasResearched: ["scientificMethod"],
    },
    cost: { researchResin: 60, stone: 15 },
    effects: {
      unlockSquirrelCapacity: 5,
    },
    researched: false,
    visible: false,
  },

  // ==================== BRONZE AGE ====================

  bronzeEfficiency: {
    id: "bronzeEfficiency",
    name: "Bronze Age Efficiency",
    description: "Master Bronze Age techniques to improve all production.",
    category: "efficiency",
    era: "BRONZE_AGE",
    requirements: {
      ideasResearched: ["stoneAgeEfficiency"],
    },
    cost: { researchResin: 150 },
    effects: {
      globalEfficiency: 0.15,
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
      ideasResearched: ["organizationBasics"],
    },
    cost: { researchResin: 220 },
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
      ideasResearched: ["scientificMethod"],
    },
    cost: { researchResin: 300 },
    effects: {
      reduceJobsiteCost: 0.1,
    },
    researched: false,
    visible: false,
  },

  // ==================== IRON AGE ====================

  ironEfficiency: {
    id: "ironEfficiency",
    name: "Iron Age Mastery",
    description: "Master Iron Age technology for massive efficiency gains.",
    category: "efficiency",
    era: "IRON_AGE",
    requirements: {
      ideasResearched: ["bronzeEfficiency"],
    },
    cost: { researchResin: 500 },
    effects: {
      globalEfficiency: 0.25,
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
      ideasResearched: ["expandedPopulation"],
    },
    cost: { researchResin: 650 },
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
      ideasResearched: ["ironEfficiency", "mechanicalShaking"],
    },
    cost: { researchResin: 800 },
    effects: {
      globalEfficiency: 0.1,
    },
    researched: false,
    visible: false,
  },
};
