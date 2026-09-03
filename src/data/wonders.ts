import type { Idea } from "../types/ideas";

/**
 * Wonders / Projects — era-defining monuments to the settlement itself, not
 * to any one squirrel's skill. Rendered in the Town tab's Projects section,
 * not Ideas or Science. Priced to be out of reach on a first run through an
 * era; a long grind within the era, or comfortably affordable once you've
 * moved a tier or two ahead.
 */
export const wonders: Record<string, Idea> = {
  pathsAndTrails: {
    id: "pathsAndTrails",
    name: "Paths and Trails",
    description:
      "Wear proper paths through the clearing so every squirrel — new arrivals included — moves like they've lived here for years. Permanently keeps the Prehistory foraging techniques; no more re-learning Nut Recognition, Efficient Gathering, Keen Nose, and Territorial Awareness from scratch each spring.",
    category: "wonder",
    era: "PREHISTORY",
    requirements: {
      ideasResearched: [
        "nutRecognition",
        "efficientGathering",
        "keenNose",
        "territorialAwareness",
      ],
    },
    cost: { nuts: 10000 },
    effects: {
      permanentlyPersistIdeas: [
        "nutRecognition",
        "efficientGathering",
        "keenNose",
        "territorialAwareness",
      ],
    },
    persists: true,
    researched: false,
    visible: false,
  },

  canopyLadders: {
    id: "canopyLadders",
    name: "Canopy Ladders",
    description:
      "Lash rope ladders between the treetops and the ground crews below, so every Wood Age site works off the same well-trodden network. +20% to all Wood Age production, permanently.",
    category: "wonder",
    era: "WOOD_AGE",
    requirements: {
      ideasResearched: [
        "stickPoker",
        "treeClimbing",
        "bracedTools",
        "canopyPaths",
        "nutwoodRefinery",
      ],
    },
    cost: { nutwood: 2000 },
    effects: {
      globalEfficiency: 0.2,
    },
    persists: true,
    researched: false,
    visible: false,
  },
};
