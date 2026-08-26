import type { StoryCheckpoint } from '../types/story';

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
    
    triggers: [
      { type: "time_elapsed", value: 0, operator: ">=" }
    ],
    
    effects: {
      showStory: true,
      pauseGame: false,
    },
    
    story: {
      title: "Wake Up",
      body: "You wake from hibernation, groggy and disoriented. Your stomach growls - winter is coming and you need to gather nuts to survive. Try gathering some nuts!",
      character: "narrator",
    }
  },
  
  firstSquirrel: {
    id: "firstSquirrel",
    name: "A Friend Appears",
    description: "Your first companion joins you!",
    priority: 90,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "nuts_collected", value: 5, operator: ">=" },
      { type: "time_elapsed", value: 10000, operator: ">=" } // 10 seconds
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
    }
  },

  discoverIdeas: {
    id: "discoverIdeas",
    name: "Discover Ideas",
    description: "Discover the Ideas tab",
    priority: 85,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "nuts_collected", value: 25, operator: ">="},
      { type: "squirrels_count", value: 2, operator: ">="}
    ],

    triggers: [
      { type: "time_elapsed", value: 30000, operator: ">=" }
    ],

    effects: {
      unlockTabs: ["ideas"],
      nutReward: 25,
      showStory: true,
    },

    story: {
      title: "Ideas",
      body: "A nut hits you on the head. You look up in wonder, and a whole new way of thinking dawns on you. The impact shakes loose a cluster of nuts from above! (+25 nuts)",
      character: "narrator",
    }
  },

  secondSquirrel: {
    id: "secondSquirrel",
    name: "A Second Friend Appears",
    description: "Your second companion joins you!",
    priority: 83,
    oneTime: true,
    completed: false,

    requirements: [
      { type: "nuts_collected", value: 75, operator: ">="},
      { type: "idea_researched", value: "nutRecognition", operator: "=="}
    ],

    triggers: [
      { type: "squirrels_count", value: 2, operator: ">=" }
    ],

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
    }
  },

  moreSquirrelsJoin: {
    id: "moreSquirrelsJoin",
    name: "More Squirrels Join",
    description: "More squirrels join your colony",
    priority: 82,
    oneTime: true,
    completed: false,
    
    requirements: [
      { type: "squirrels_count", value: 3, operator: ">="},
      { type: "idea_researched", value: "territorialAwareness", operator: "=="}
    ],

    triggers: [
      { type: "nuts_collected", value: 250, operator: ">="}
    ],

    effects: {
      unlockSquirrels: 2,
      nutReward: 30,
      showStory: true,
    },

    story: {
      title: "More Squirrels Join",
      body: `Two more squirrels join your colony, each bringing their own nut stash to contribute. "We should organize better," one suggests. "Together we're stronger!" (+30 nuts)`,
      character: "narrator",
    }
  },

  passingSquirrelsJoin: {
    id: "passingSquirrelsJoin",
    name: "Passing Squirrels Join",
    description: "Passing squirrels join your colony",
    priority: 81,
    oneTime: true,
    completed: false,
    
    requirements: [
      { type: "squirrels_count", value: 5, operator: ">="},
      { type: "era_reached", value: "WOOD_AGE", operator: "=="}
    ],
    
    triggers: [
      { type: "nuts_collected", value: 1000, operator: ">=" }
    ],
    
    effects: {
      nutReward: 200,
      unlockSquirrels: 5,
      showStory: true,
    },
    
    story: {
      title: "Passing Squirrels Join",
      body: `A Squirrel Envoy passes through. "We'd love to join, but we want to see how you're doing first." Gather 1000 nuts to entice the new group.`,
      character: "narrator",
    }
  },

  // ====================  MILESTONES ====================

  twoHundredNuts: {
    id: "twoHundredNuts",
    name: "Two Hundred Nuts",
    description: "Reach 200 nuts",
    priority: 79,
    oneTime: true,
    completed: false,
    
    requirements: [
      { type: "squirrels_count", value: 3, operator: ">="}
    ],
    
    triggers: [
      { type: "nuts_collected", value: 200, operator: ">=" }
    ],
    
    effects: {
      nutReward: 50,
      showStory: true,
    },

    story: {
      title: "Two Hundred Nuts",
      body: "You've reached 200 nuts! Your squirrels are starting to get organized. (+50 nuts)",
      character: "narrator",
    }
  },
  
  // ==================== JOBSITE PROGRESSION ====================
  
  firstJobsite: {
    id: "firstJobsite",
    name: "First Job",
    description: "Purchase your first jobsite",
    priority: 84,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "jobsites_purchased", value: 1, operator: ">=" }
    ],
    
    effects: {
      nutReward: 75,
      showStory: true,
    },
    
    story: {
      title: "Organized Labor",
      body: "You've set up your first official jobsite! Your squirrels immediately find a productive area and bring back a generous haul. (+75 nuts)",
      character: "narrator",
    }
  },
  
  tenJobsites: {
    id: "tenJobsites",
    name: "Efficient Operation",
    description: 'Build up to 10 jobsites',
    priority: 73,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "jobsites_purchased", value: 10, operator: ">=" }
    ],
    
    effects: {
      nutReward: 100,
      showStory: true,
    },
    
    story: {
      title: "Growing Operations",
      body: "With 10 jobsites, you're becoming a real operation! Other squirrels are taking notice. The colony's productivity earns a bonus! (+100 nuts)",
      character: "narrator",
    }
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
      { type: "resource_count", value: 0.1, operator: ">=", resource: "nutwood" }
    ],
    
    effects: {
      unlockTabs: ["eras"],
      nutReward: 100,
      showStory: true,
      pauseGame: true,
    },
    
    story: {
      title: "The First Refined Material",
      body: "Your squirrels have successfully refined their first piece of NutWood! This breakthrough transforms simple nuts into refined materials. The possibilities are endless! A new era awaits your decision. Check the Home tab to choose when to advance. (+100 nuts)",
      character: "squirrel_inventor",
    }
  },
  
  woodAgeUnlock: {
    id: "woodAgeUnlock",
    name: "The Wood Age",
    description: "Entered the Wood Age",
    priority: 77,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "era_reached", value: "WOOD_AGE", operator: "==" }
    ],
    
    effects: {
      showStory: true,
      pauseGame: false,
    },
    
    story: {
      title: "The Age of Wood",
      body: "Your colony has entered the Wood Age! With refined materials and better tools, new possibilities await. Tree Climber jobsites can now be unlocked through research.",
      character: "squirrel_elder",
    }
  },



  stoneAgeChoice: {
    id: "stoneAgeChoice",
    name: "The Stone Revolution Awaits",
    description: "Choose when to advance to the Stone Age",
    priority: 72,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "nuts_collected", value: 3000, operator: ">=" },
      { type: "jobsites_purchased", value: 40, operator: ">=" }
    ],
    
    effects: {
      showStory: true,
      pauseGame: true,
    },
    
    story: {
      title: "The Stone Revolution Awaits",
      body: "Your inventors have discovered stone tooling! These harder, sharper tools could revolutionize your colony. Or you could master nutwood technology further for lasting benefits...",
      character: "squirrel_inventor",
      choices: [
        {
          id: "advance",
          text: "Enter the Stone Age →",
          description: "Unlock stone tools and advanced jobsites",
          effects: {
            setEra: "STONE_AGE",
          }
        },
        {
          id: "perfectWoodAge",
          text: "Perfect Wood Age First",
          description: "Reach 5,000 nuts to earn +30% Stone Age production bonus",
          requirements: [
            { type: "nuts_collected", value: 5000, operator: ">=" }
          ],
          effects: {
            setEra: "STONE_AGE",
            grantBonus: {
              type: "era_multiplier",
              value: 1.30,
              target: "STONE_AGE"
            }
          }
        }
      ]
    }
  },
  
  stoneAgeUnlock: {
    id: "stoneAgeUnlock",
    name: "The Stone Age",
    description: "Entered the Stone Age",
    priority: 71,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "era_reached", value: "STONE_AGE", operator: "==" }
    ],
    
    effects: {
      nutReward: 250,
      showStory: true,
      pauseGame: false,
    },
    
    story: {
      title: "The Stone Revolution",
      body: "Your squirrels have mastered stone tooling! The first use of your new tools yields an impressive bounty. Harder, sharper, more durable - stone tools transform everything! (+250 nuts)",
      character: "squirrel_inventor",
    }
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
      { type: "squirrels_count", value: 10, operator: ">=" }
    ],
    
    triggers: [
      { type: "era_reached", value: "BRONZE_AGE", operator: "==" }
    ],
    
    effects: {
      unlockJobsites: ["farmer", "gatheringParty", "treeThumper", "stiltWalker"],
      unlockBuildings: ["refinery", "house"],
      unlockTabs: ["build"],
      showStory: true,
      pauseGame: true,
    },
    
    story: {
      title: "The Bronze Era",
      body: "Your colony has grown sophisticated enough to enter the Bronze Age! New technologies and jobsites are now available. You can now build structures in Nut City!",
      character: "squirrel_elder",
    }
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
      { type: "building_built", value: "refinery", operator: "==" }
    ],
    
    triggers: [
      { type: "era_reached", value: "IRON_AGE", operator: "==" }
    ],
    
    effects: {
      unlockJobsites: ["cropTender", "floorRakers", "treeShaker", "treeLifts"],
      unlockBuildings: ["townHall", "researchLab"],
      unlockTabs: ["population"],
      showStory: true,
      pauseGame: true,
    },
    
    story: {
      title: "Industrial Revolution",
      body: "The Iron Age dawns! Your squirrels have mastered metalworking and can now create more sophisticated tools and buildings.",
      character: "squirrel_scientist",
    }
  },
  
  // ==================== BUILDING MILESTONES ====================
  
  firstBuilding: {
    id: "firstBuilding",
    name: "First Structure",
    description: "Build your first building in Nut City",
    priority: 65,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "building_built", value: "any", operator: "==" }
    ],
    
    effects: {
      showStory: true,
    },
    
    story: {
      title: "Nut City Begins",
      body: "You've laid the foundation for Nut City! This is just the beginning of your great civilization.",
      character: "narrator",
    }
  },
  
  researchUnlock: {
    id: "researchUnlock",
    name: "Scientific Method",
    description: "Unlock the Research Lab",
    priority: 55,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "building_built", value: "researchLab", operator: "==" }
    ],
    
    effects: {
      unlockTabs: ["science"],
      showStory: true,
    },
    
    story: {
      title: "The Pursuit of Knowledge",
      body: "With the Research Lab complete, your squirrels can now pursue scientific knowledge! Research new technologies to improve your operations.",
      character: "squirrel_scientist",
    }
  },
  
  // ==================== HIBERNATION ====================
  
  firstHibernation: {
    id: "firstHibernation",
    name: 'Winter Approaches',
    description: 'Complete your first hibernation cycle',
    priority: 50,
    oneTime: true,
    completed: false,
    
    requirements: [
      { type: "nuts_collected", value: 1000000, operator: ">=" }
    ],
    
    triggers: [
      { type: "hibernations_completed", value: 1, operator: ">=" }
    ],
    
    effects: {
      showStory: true,
    },
    
    story: {
      title: "The Cycle Continues",
      body: "Winter has come. You hibernate with your colony, dreaming of Gold Nuts and future prosperity. When spring arrives, you'll start anew, stronger than before.",
      character: "narrator",
      choices: [
        {
          id: "continue",
          text: "Begin Again",
        }
      ]
    }
  },
  
  // ==================== LATE GAME ====================
  
  spaceAge: {
    id: "spaceAge",
    name: "To The Stars",
    description: "Reach the Space Age",
    priority: 40,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "era_reached", value: "SPACE_AGE", operator: "==" }
    ],
    
    effects: {
      unlockJobsites: ["orbitingFarm"],
      showStory: true,
      pauseGame: true,
    },
    
    story: {
      title: "Beyond the Planet",
      body: "Your civilization has achieved spaceflight! The cosmos itself becomes your nut garden. Orbiting farms harvest nuts from the void of space.",
      character: "squirrel_astronaut",
    }
  },
  
  galacticAge: {
    id: "galacticAge",
    name: "Galactic Empire",
    description: "Reach the Galactic Age",
    priority: 30,
    oneTime: true,
    completed: false,
    
    triggers: [
      { type: "era_reached", value: "GALACTIC_AGE", operator: "==" }
    ],
    
    effects: {
      showStory: true,
      pauseGame: true,
    },
    
    story: {
      title: "Masters of the Galaxy",
      body: "Your squirrel empire spans the galaxy. Nuts flow from a thousand worlds. You have become legend.",
      character: "narrator",
    }
  },
};

// Helper to get checkpoints by priority
export const getCheckpointsByPriority = (): StoryCheckpoint[] => {
  return Object.values(storyCheckpoints).sort((a, b) => b.priority - a.priority);
};

// Helper to get incomplete checkpoints
export const getIncompleteCheckpoints = (): StoryCheckpoint[] => {
  return Object.values(storyCheckpoints)
    .filter(cp => !cp.completed)
    .sort((a, b) => b.priority - a.priority);
};
