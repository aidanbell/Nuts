import type { StoryCheckpoint } from "../types/story";
import { FIRST_WINTER_GATHERER_LEVEL } from "../types/meta";

/**
 * Story checkpoints define the progression of the game's narrative.
 * They trigger based on player actions and game state, unlocking new features.
 */
export const storyCheckpoints: Record<string, StoryCheckpoint> = {
  // ==================== EARLY GAME ====================
  gameStart: {
    id: "gameStart",
    name: "A New Beginning",
    description: "You wake up from hibernation, alone and hungry.",
    priority: 100,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    triggers: [{ type: "time_elapsed", value: 0, operator: ">=" }],

    effects: {
      showStory: true,
      pauseGame: false,
    },

    story: {
      title: "Wake Up",
      body: "You wake from hibernation, groggy and disoriented. Your stomach growls - winter is coming and you need to gather nuts to survive. Try gathering some nuts!",
      character: "narrator",
    },
  },

  firstSquirrel: {
    id: "firstSquirrel",
    name: "A Friend Appears",
    description: "Your first companion joins you!",
    priority: 90,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    triggers: [
      { type: "nuts_collected", value: 5, operator: ">=" },
      { type: "time_elapsed", value: 10000, operator: ">=" }, // 10 seconds
    ],

    effects: {
      unlockSquirrels: 1,
      nutReward: 10,
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "You're Not Alone",
      body: "Another squirrel approaches, drawn by your impressive nut collection. 'Need help gathering?' they ask. 'I could use some work!' They drop a small cache of nuts at your feet as a gift. (+10 nuts)",
      character: "squirrel_01",
    },
  },

  discoverIdeas: {
    id: "discoverIdeas",
    name: "Discover Ideas",
    description: "Discover the Ideas tab",
    priority: 85,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    requirements: [
      { type: "nuts_collected", value: 25, operator: ">=" },
      { type: "squirrels_count", value: 2, operator: ">=" },
    ],

    triggers: [{ type: "time_elapsed", value: 30000, operator: ">=" }],

    effects: {
      unlockTabs: ["ideas"],
      nutReward: 25,
      showStory: true,
    },

    story: {
      title: "Ideas",
      body: "A nut hits you on the head. You look up in wonder, and a whole new way of thinking dawns on you. The impact shakes loose a cluster of nuts from above! (+25 nuts)",
      character: "narrator",
    },
  },

  secondSquirrel: {
    id: "secondSquirrel",
    name: "A Second Friend Appears",
    description: "Your second companion joins you!",
    priority: 83,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    requirements: [
      { type: "nuts_collected", value: 75, operator: ">=" },
      { type: "idea_researched", value: "nutRecognition", operator: "==" },
    ],

    triggers: [{ type: "squirrels_count", value: 2, operator: ">=" }],

    effects: {
      unlockSquirrels: 1,
      nutReward: 15,
      showStory: true,
      pauseGame: true,
    },
    story: {
      title: "A Second Friend Appears",
      body: "Another squirrel arrives, carrying a bundle of nuts. 'Heard you're building something special here,' they say with a grin, adding their stash to yours. (+15 nuts)",
      character: "squirrel_01",
    },
  },

  /** Season 2+: quiet return to a working trio before the population wall */
  seasonCompanions: {
    id: "seasonCompanions",
    name: "Familiar Faces",
    description: "Two companions return after winter",
    priority: 90,
    oneTime: true,
    completed: false,
    minSeason: 1,

    triggers: [
      { type: "nuts_collected", value: 5, operator: ">=" },
      { type: "time_elapsed", value: 8000, operator: ">=" },
    ],

    effects: {
      unlockSquirrels: 2,
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Familiar Faces",
      body: "Two squirrels from last season shake frost from their fur and pad into the clearing. No introductions needed — the work begins again.",
      character: "squirrel_01",
    },
  },

  moreSquirrelsJoin: {
    id: "moreSquirrelsJoin",
    name: "No Room Left",
    description: "Two more want in — but the clearing is full",
    priority: 82,
    oneTime: true,
    completed: false,
    minSeason: 1,

    requirements: [
      { type: "squirrels_count", value: 3, operator: ">=" },
      { type: "hibernations_completed", value: 1, operator: ">=" },
    ],

    triggers: [{ type: "nuts_collected", value: 200, operator: ">=" }],

    effects: {
      unlockSquirrels: 2,
      unlockTabs: ["town"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "No Room Left",
      body: "Two more squirrels press in at the edge of the clearing, eager to help — but there's nowhere left to sleep. Crowding this hard won't work. You'll have to figure out housing… and maybe more. The Town tab is open.",
      character: "narrator",
    },
  },

  passingSquirrelsJoin: {
    id: "passingSquirrelsJoin",
    name: "Passing Squirrels Join",
    description: "Passing squirrels join your colony",
    priority: 81,
    oneTime: true,
    completed: false,
    // Deferred until housing raises the soft cap
    minSeason: 99,

    requirements: [
      { type: "squirrels_count", value: 5, operator: ">=" },
      { type: "era_reached", value: "WOOD_AGE", operator: "==" },
    ],

    triggers: [{ type: "nuts_collected", value: 1000, operator: ">=" }],

    effects: {
      nutReward: 200,
      unlockSquirrels: 5,
      showStory: true,
    },

    story: {
      title: "Passing Squirrels Join",
      body: `A Squirrel Envoy passes through. "We'd love to join, but we want to see how you're doing first." Gather 1000 nuts to entice the new group.`,
      character: "narrator",
    },
  },

  // ====================  MILESTONES ====================

  twoHundredNuts: {
    id: "twoHundredNuts",
    name: "Two Hundred Nuts",
    description: "Reach 200 nuts",
    priority: 79,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    requirements: [{ type: "squirrels_count", value: 3, operator: ">=" }],

    triggers: [{ type: "nuts_collected", value: 200, operator: ">=" }],

    effects: {
      nutReward: 50,
      showStory: true,
    },

    story: {
      title: "Two Hundred Nuts",
      body: "You've reached 200 nuts! Your squirrels are starting to get organized. (+50 nuts)",
      character: "narrator",
    },
  },

  // ==================== JOBSITE PROGRESSION ====================

  firstJobsite: {
    id: "firstJobsite",
    name: "First Job",
    description: "Purchase your first jobsite",
    priority: 84,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    triggers: [{ type: "jobsites_purchased", value: 1, operator: ">=" }],

    effects: {
      nutReward: 75,
      showStory: true,
    },

    story: {
      title: "Organized Labor",
      body: "You've set up your first official jobsite! Your squirrels immediately find a productive area and bring back a generous haul. (+75 nuts)",
      character: "narrator",
    },
  },

  // ==================== WOOD AGE ====================

  firstRefinement: {
    id: "firstRefinement",
    name: "First Refined Material",
    description: "Produce your first NutWood",
    priority: 78,
    oneTime: true,
    completed: false,

    triggers: [
      {
        type: "resource_count",
        value: 0.1,
        operator: ">=",
        resource: "nutwood",
      },
    ],

    effects: {
      nutReward: 100,
      showStory: true,
    },

    story: {
      title: "The First Refined Material",
      body: "Your first piece of NutWood! Stockpile these for The Wood Age idea — twenty-five husks bound into a new chapter for the colony. (+100 nuts)",
      character: "squirrel_inventor",
    },
  },

  woodAgeUnlock: {
    id: "woodAgeUnlock",
    name: "The Wood Age",
    description: "Entered the Wood Age",
    priority: 77,
    oneTime: true,
    completed: false,

    triggers: [{ type: "era_reached", value: "WOOD_AGE", operator: "==" }],

    effects: {
      showStory: true,
      pauseGame: false,
    },

    story: {
      title: "The Age of Wood",
      body: "Your colony has entered the Wood Age! With refined materials and better tools, new possibilities await. Tree Climber jobsites can now be unlocked through research.",
      character: "squirrel_elder",
    },
  },

  stickPokerTravelers: {
    id: "stickPokerTravelers",
    name: "Travelers at the Edge",
    description:
      "Two squirrels want to join after Stick Poker — but need housing",
    priority: 88,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "idea_researched", value: "stickPoker", operator: "==" },
    ],

    triggers: [
      { type: "idea_researched", value: "stickPoker", operator: "==" },
    ],

    effects: {
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Two at the Treeline",
      body: 'Word of your Stick Poker site has traveled. Two squirrels hang at the treeline, eager to work — but they refuse to sleep under open sky. "Build us a den," they call, "and we\'ll stay." Raise a wooden house in Town if you want their help.',
      character: "narrator",
    },
  },

  stickPokerHousing: {
    id: "stickPokerHousing",
    name: "Dens for Newcomers",
    description:
      "First wooden house after Stick Poker — travelers join and ask for a signal",
    priority: 87,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "idea_researched", value: "stickPoker", operator: "==" },
      { type: "wooden_houses", value: 1, operator: ">=" },
    ],

    triggers: [{ type: "wooden_houses", value: 1, operator: ">=" }],

    effects: {
      unlockSquirrels: 2,
      unlockBuildings: ["bonfire"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Room Enough",
      body: 'The new dens smell of fresh NutWood. The two travelers move in at once, tails flicking with relief. "We\'ll put the word out," one says, "but travelers need a signal — a light in the dark. Light a bonfire in Town, and more of us will find this place."',
      character: "squirrel_01",
    },
  },

  stoneAgeUnlock: {
    id: "stoneAgeUnlock",
    name: "The Stone Age",
    description: "Entered the Stone Age",
    priority: 71,
    oneTime: true,
    completed: false,

    triggers: [{ type: "era_reached", value: "STONE_AGE", operator: "==" }],

    effects: {
      nutReward: 250,
      showStory: true,
      pauseGame: false,
    },

    story: {
      title: "The Stone Revolution",
      body: "Your squirrels have mastered stone tooling! The first use of your new tools yields an impressive bounty. Harder, sharper, more durable - stone tools transform everything! (+250 nuts)",
      character: "squirrel_inventor",
    },
  },

  bronzeAge: {
    id: "bronzeAge",
    name: "The Bronze Age",
    description: "Advance to the Bronze Age",
    priority: 70,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "nuts_collected", value: 10000, operator: ">=" },
      { type: "squirrels_count", value: 10, operator: ">=" },
    ],

    triggers: [{ type: "era_reached", value: "BRONZE_AGE", operator: "==" }],

    effects: {
      unlockJobsites: [
        "farmer",
        "gatheringParty",
        "treeThumper",
        "stiltWalker",
      ],
      unlockBuildings: ["refinery", "house"],
      unlockTabs: ["build"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "The Bronze Era",
      body: "Your colony has grown sophisticated enough to enter the Bronze Age! New technologies and jobsites are now available. You can now build structures in Nut City!",
      character: "squirrel_elder",
    },
  },

  ironAge: {
    id: "ironAge",
    name: "The Iron Age",
    description: "Advance to the Iron Age",
    priority: 60,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "era_reached", value: "BRONZE_AGE", operator: "==" },
      { type: "building_built", value: "refinery", operator: "==" },
    ],

    triggers: [{ type: "era_reached", value: "IRON_AGE", operator: "==" }],

    effects: {
      unlockJobsites: ["cropTender", "floorRakers", "treeShaker", "treeLifts"],
      unlockBuildings: ["townHall"],
      unlockTabs: ["population"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Industrial Revolution",
      body: "The Iron Age dawns! Your squirrels have mastered metalworking and can now create more sophisticated tools and buildings.",
      character: "squirrel_scientist",
    },
  },

  // ==================== BUILDING MILESTONES ====================

  firstBuilding: {
    id: "firstBuilding",
    name: "First Structure",
    description: "Build your first building in Nut City",
    priority: 65,
    oneTime: true,
    completed: false,

    triggers: [{ type: "building_built", value: "any", operator: "==" }],

    effects: {
      showStory: true,
    },

    story: {
      title: "Nut City Begins",
      body: "You've laid the foundation for Nut City! This is just the beginning of your great civilization.",
      character: "narrator",
    },
  },

  researchUnlock: {
    id: "researchUnlock",
    name: "Scientific Method",
    description: "Unlock the Research Lab",
    priority: 55,
    oneTime: true,
    completed: false,

    triggers: [
      { type: "idea_researched", value: "scientificMethod", operator: "==" },
    ],

    effects: {
      showStory: true,
    },

    story: {
      title: "The Pursuit of Knowledge",
      body: "With inquiry formalized into a discipline of its own, the Research Lab stands ready. Task a squirrel there to generate Research Resin — the currency of the new Science tab — and start trading production slots for compounding, colony-wide upside.",
      character: "squirrel_scientist",
    },
  },

  // ==================== HIBERNATION / WINTER ====================

  winterApproaching: {
    id: "winterApproaching",
    name: "Winter Approaches",
    description: "Gatherer is maxed — nowhere left to push this season",
    priority: 95,
    oneTime: true,
    completed: false,

    // First season only — later winters use different beats
    requirements: [
      { type: "hibernations_completed", value: 0, operator: "==" },
    ],

    triggers: [
      {
        type: "jobsite_level",
        value: FIRST_WINTER_GATHERER_LEVEL,
        operator: ">=",
        jobsiteId: "gatherer",
      },
    ],

    effects: {
      unlockTabs: ["hibernate"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "The Cold Creeps In",
      body: "The Gatherer site is pushed as far as it can go — every branch picked clean, every squirrel assigned. There's nothing left to chase in this clearing. Frost is already kissing the ground. Hibernate now, keep your Gold Nuts, and wake ready for scavenger routes and NutWood craft.",
      character: "narrator",
    },
  },

  secondWinterApproaching: {
    id: "secondWinterApproaching",
    name: "Second Winter",
    description: "First NutWood crafted — winter returns before the Wood Age",
    priority: 95,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "hibernations_completed", value: 1, operator: "==" },
      { type: "idea_researched", value: "nutwoodCraft", operator: "==" },
    ],

    triggers: [
      {
        type: "resource_count",
        value: 1,
        operator: ">=",
        resource: "nutwood",
      },
    ],

    effects: {
      unlockTabs: ["hibernate"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Wood Before the Freeze",
      body: "You've pressed your first NutWood — and already the nights bite harder. You could chase the full stockpile for the Wood Age before the freeze, but the smart money says bank what you've learned now: hibernate, and next spring's Gold makes the real stockpile go far faster.",
      character: "narrator",
    },
  },

  woodAgeDream: {
    id: "woodAgeDream",
    name: "Dreams of Wood",
    description: "Tease Wood Age before the first winter",
    priority: 70,
    oneTime: true,
    completed: false,
    maxSeason: 0,

    requirements: [
      { type: "hibernations_completed", value: 0, operator: "==" },
      { type: "idea_researched", value: "divisionOfLabor", operator: "==" },
    ],

    triggers: [
      {
        type: "jobsite_level",
        value: 3,
        operator: ">=",
        jobsiteId: "gatherer",
      },
    ],

    effects: {
      showStory: true,
    },

    story: {
      title: "Harder Than Shells",
      body: "A squirrel gnaws a tough husk and mutters about shaping it into something lasting — a tool, a brace, a den wall. NutWood is only a dream for now. Survive the coming winter, and spring might let you chase it.",
      character: "squirrel_inventor",
    },
  },

  springAwakening: {
    id: "springAwakening",
    name: "Spring Awakening",
    description: "Wake after hibernation into a new season",
    priority: 100,
    oneTime: false,
    repeatable: true,
    completed: false,

    // Fired manually after hibernate — triggers never auto-match
    triggers: [{ type: "hibernations_completed", value: 999, operator: ">=" }],

    effects: {
      showStory: true,
    },

    story: {
      title: "Spring",
      body: "You wake alone in a bare clearing. The den is gone. The nuts are gone. But something warm remains — Gold Nuts from the long dream — and with them, clearer memories of craft and taller trees. This season, push farther than last year.",
      character: "narrator",
    },
  },

  firstHibernation: {
    id: "firstHibernation",
    name: "First Winter Survived",
    description: "Complete your first hibernation cycle",
    priority: 50,
    oneTime: true,
    completed: false,

    requirements: [],

    triggers: [{ type: "hibernations_completed", value: 1, operator: ">=" }],

    effects: {
      showStory: true,
    },

    story: {
      title: "The Cycle Continues",
      body: "You have survived your first winter. Gold Nuts pulse with remembered warmth. The colony will grow again — faster, wiser — and this time, Wood Age craft is no longer just a dream.",
      character: "narrator",
    },
  },

  // ==================== LATE GAME ====================

  spaceAge: {
    id: "spaceAge",
    name: "To The Stars",
    description: "Reach the Space Age",
    priority: 40,
    oneTime: true,
    completed: false,

    triggers: [{ type: "era_reached", value: "SPACE_AGE", operator: "==" }],

    effects: {
      unlockJobsites: ["orbitingFarm"],
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Beyond the Planet",
      body: "Your civilization has achieved spaceflight! The cosmos itself becomes your nut garden. Orbiting farms harvest nuts from the void of space.",
      character: "squirrel_astronaut",
    },
  },

  galacticAge: {
    id: "galacticAge",
    name: "Galactic Empire",
    description: "Reach the Galactic Age",
    priority: 30,
    oneTime: true,
    completed: false,

    triggers: [{ type: "era_reached", value: "GALACTIC_AGE", operator: "==" }],

    effects: {
      showStory: true,
      pauseGame: true,
    },

    story: {
      title: "Masters of the Galaxy",
      body: "Your squirrel empire spans the galaxy. Nuts flow from a thousand worlds. You have become legend.",
      character: "narrator",
    },
  },
};

// Helper to get checkpoints by priority
export const getCheckpointsByPriority = (): StoryCheckpoint[] => {
  return Object.values(storyCheckpoints).sort(
    (a, b) => b.priority - a.priority,
  );
};

// Helper to get incomplete checkpoints
export const getIncompleteCheckpoints = (): StoryCheckpoint[] => {
  return Object.values(storyCheckpoints)
    .filter((cp) => !cp.completed)
    .sort((a, b) => b.priority - a.priority);
};
