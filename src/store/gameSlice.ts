import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameState, GameUpdate, JobSite } from '../types/game';
import { researchIdea } from './ideasSlice';
import { ideas } from '../data/ideas';
import { productionJobsites, refinementJobsites } from '../data/jobsites';

const initialState: GameState = {
  nutsTotal: 0,
  nutsAllTime: 0,
  goldNuts: {
    total: 0,
    multi: 0.12,
  },
  
  resources: {
    nutwood: 0,
    stone: 0,
    bronze: 0,
    iron: 0,
  },
  
  squirrels: {
    0: {
      _id: 0,
      employed: false,
      jobSite: null,
      total: 0,
    }
  },
  nextSquirrelId: 1,
  population: {
    jobless: [0],
  },
  
  jobSites: {
    jobless: {
      time: 1500, // Check every 1.5 seconds (faster than before)
      value: 1, // Find 1 nut per success
      chance: 0.5, // 50% chance (higher than old 30%)
      multi: 1,
      level: 0,
      cost: 0,
      method: "ground",
    },
    production: {},
    refinement: {},
  },
  
  getButton: {
    value: 1,
    mult: 1,
  },
  
  gameSpeed: 1,
  isPaused: false,
  tick: 0,
  lastUpdate: Date.now(),
  activeTab: 'home',
  unlockedTabs: ['home'], // Start with only home unlocked
  
  timer: {
    ms: 0,
    s: 0,
    m: 0,
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Core resource actions
    addNuts: (state, action: PayloadAction<number>) => {
      state.nutsTotal += action.payload;
      state.nutsAllTime += action.payload;
    },

    spendNuts: (state, action: PayloadAction<number>) => {
      state.nutsTotal -= action.payload;
    },
    
    // Resource actions
    addResource: (state, action: PayloadAction<{ resource: keyof GameState['resources']; amount: number }>) => {
      const { resource, amount } = action.payload;
      state.resources[resource] += amount;
    },
    
    spendResource: (state, action: PayloadAction<{ resource: keyof GameState['resources']; amount: number }>) => {
      const { resource, amount } = action.payload;
      state.resources[resource] -= amount;
    },
    
    // Manual refinement (craft one at a time)
    craftRefinement: (state, action: PayloadAction<{ refinementId: string }>) => {
      const { refinementId } = action.payload;
      
      // Find the refinement template
      const refinement = refinementJobsites.find(js => js.id === refinementId);
      
      if (!refinement || !refinement.consumes || !refinement.produces) return;
      
      const { resource: consumeType, amount: consumeAmount } = refinement.consumes;
      const { resource: produceType, amount: produceAmount } = refinement.produces;
      
      // Check if we have enough resources
      const availableResource = consumeType === 'nuts' 
        ? state.nutsTotal 
        : state.resources[consumeType as keyof typeof state.resources];
      
      if (availableResource >= consumeAmount) {
        // Consume input resource
        if (consumeType === 'nuts') {
          state.nutsTotal -= consumeAmount;
        } else {
          state.resources[consumeType as keyof typeof state.resources] -= consumeAmount;
        }
        
        // Produce output resource
        state.resources[produceType] += produceAmount;
      }
    },
    
    // Squirrel actions
    createSquirrel: (state) => {
      const id = state.nextSquirrelId;
      state.squirrels[id] = {
        _id: id,
        employed: false,
        jobSite: null,
        total: 0,
      };
      state.population.jobless.push(id);
      state.nextSquirrelId += 1;
    },
    
    squirrelFoundNut: (state, action: PayloadAction<number>) => {
      const squirrelId = action.payload;
      const squirrel = state.squirrels[squirrelId];
      const jobSite = state.jobSites.jobless;
      if (squirrel && jobSite) {
        const amount = Math.max(0, jobSite.value * jobSite.multi);
        squirrel.total += amount;
        state.nutsTotal += amount;
        state.nutsAllTime += amount;
      }
    },
    
    // JobSite actions
    unlockJobsites: (state, action: PayloadAction<string[]>) => {
      if (!state.unlockedTabs.includes('jobsites')) {
        state.unlockedTabs.push('jobsites');
      }
      const jobsiteIds = action.payload;
      
      jobsiteIds.forEach(id => {
        // Find the jobsite in the master list
        const jobsiteTemplate = productionJobsites.find(js => js.id === id) ||
                                refinementJobsites.find(js => js.id === id);
        
        if (jobsiteTemplate) {
          // Create a new jobsite instance from the template
          const newJobsite: JobSite = {
            ...jobsiteTemplate,
            unlocked: true,
            maxSquirrels: jobsiteTemplate.maxSquirrels, // Initial squirrel capacity
            workers: [],
            level: 0,
            // Production values
            baseProduction: jobsiteTemplate.baseProduction,
            squirrelBonus: jobsiteTemplate.squirrelBonus,
            // Cost growth properties
            cost: jobsiteTemplate.baseCost, // Start at base cost
            costGrowthRate: jobsiteTemplate.costGrowthRate,
            baseCost: jobsiteTemplate.baseCost,
            // Refinement properties (if applicable)
            consumes: jobsiteTemplate.consumes,
            produces: jobsiteTemplate.produces,
          };
          
          // Add to the appropriate category
          if (newJobsite.type === 'production') {
            state.jobSites.production[id] = newJobsite;
          } else if (newJobsite.type === 'refinement') {
            state.jobSites.refinement[id] = newJobsite;
          }
        }
      });
    },
    
    buyJobSiteCapacity: (state, action: PayloadAction<string>) => {
      const jobSiteId = action.payload;
      const jobSite = state.jobSites.production[jobSiteId] || state.jobSites.refinement[jobSiteId];
      
      if (jobSite && state.nutsTotal >= jobSite.cost) {
        state.nutsTotal -= jobSite.cost;
        jobSite.level += 1;
        
        // Every 5 levels, increase max squirrels by 1
        if (jobSite.level % 5 === 0) {
          jobSite.maxSquirrels += 1;
        }
        
        // Every level, slightly increase production (5% boost to both base and bonus)
        jobSite.baseProduction *= 1.05;
        jobSite.squirrelBonus *= 1.05;
        
        // Calculate next cost using exponential growth formula from Kongregate article:
        // cost_next = baseCost × (costGrowthRate)^level
        jobSite.cost = Math.floor(jobSite.baseCost * Math.pow(jobSite.costGrowthRate, jobSite.level));
      }
    },
    
    assignSquirrelToJobSite: (state, action: PayloadAction<{ squirrelId: number; jobSiteId: string }>) => {
      const { squirrelId, jobSiteId } = action.payload;
      const squirrel = state.squirrels[squirrelId];
      // Find jobsite in either production or refinement
      const jobSite = state.jobSites.production[jobSiteId] || state.jobSites.refinement[jobSiteId];
      
      if (squirrel && jobSite && jobSite.workers.length < jobSite.maxSquirrels) {
        // Remove from jobless
        state.population.jobless = state.population.jobless.filter(id => id !== squirrelId);
        
        // Add to jobsite
        jobSite.workers.push(squirrelId);
        squirrel.employed = true;
        squirrel.jobSite = jobSiteId;
        
        // Initialize population array for this jobsite if needed
        if (!state.population[jobSiteId]) {
          state.population[jobSiteId] = [];
        }
        state.population[jobSiteId].push(squirrelId);
      }
    },
    
    removeSquirrelFromJobSite: (state, action: PayloadAction<{ squirrelId: number; jobSiteId: string }>) => {
      const { squirrelId, jobSiteId } = action.payload;
      const squirrel = state.squirrels[squirrelId];
      // Find jobsite in either production or refinement
      const jobSite = state.jobSites.production[jobSiteId] || state.jobSites.refinement[jobSiteId];
      
      if (squirrel && jobSite) {
        // Remove from jobsite
        jobSite.workers = jobSite.workers.filter(id => id !== squirrelId);
        
        // Remove from population
        if (state.population[jobSiteId]) {
          state.population[jobSiteId] = state.population[jobSiteId].filter(id => id !== squirrelId);
        }
        
        // Add back to jobless
        state.population.jobless.push(squirrelId);
        squirrel.employed = false;
        squirrel.jobSite = null;
      }
    },
    
    // Batch update for performance
    batchUpdate: (state, action: PayloadAction<GameUpdate[]>) => {
      action.payload.forEach(update => {
        switch (update.type) {
          case 'ADD_NUTS':
            if (update.data.amount !== undefined) {
              state.nutsTotal += update.data.amount;
              state.nutsAllTime += update.data.amount;
            }
            break;
          case 'UPDATE_SQUIRREL':
            if (update.data.id !== undefined && update.data.changes) {
              Object.assign(state.squirrels[update.data.id as number], update.data.changes);
            }
            break;
          case 'UPDATE_JOBSITE':
            if (update.data.id !== undefined && state.jobSites.production[update.data.id as string]) {
              Object.assign(state.jobSites.production[update.data.id as string], update.data.changes);
            }
            break;
        }
      });
    },
    
    // Game control actions
    incrementTick: (state) => {
      state.tick += 1;
    },
    
    updateTimer: (state) => {
      state.timer.ms += 1;
      if (state.timer.ms >= 100) {
        state.timer.s += 1;
        state.timer.ms = 0;
      }
      if (state.timer.s >= 60) {
        state.timer.m += 1;
        state.timer.s = 0;
      }
    },
    
    setGameSpeed: (state, action: PayloadAction<number>) => {
      state.gameSpeed = action.payload;
    },
    
    pauseGame: (state) => {
      state.isPaused = true;
    },
    
    resumeGame: (state) => {
      state.isPaused = false;
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    unlockTab: (state, action: PayloadAction<string>) => {
      if (!state.unlockedTabs.includes(action.payload)) {
        state.unlockedTabs.push(action.payload);
      }
    },
    
    unlockTabs: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(tab => {
        if (!state.unlockedTabs.includes(tab)) {
          state.unlockedTabs.push(tab);
        }
      });
    },
    
    // Hibernate action
    hibernate: (state) => {
      state.goldNuts.total += Math.floor(state.nutsAllTime / Math.pow(10, 6) * state.goldNuts.multi);
      // Reset game state
      state.nutsTotal = 0;
      state.nutsAllTime = 0;
      state.squirrels = {};
      state.nextSquirrelId = 1;
      state.population = { jobless: [] };
      state.jobSites = initialState.jobSites;
      state.timer = { ms: 0, s: 0, m: 0 };
      state.tick = 0;
    },
    
    // Load save data
    loadSaveData: (state, action: PayloadAction<Partial<GameState>>) => {
      Object.assign(state, action.payload);
    },
    
    // Update timestamp
    updateTimestamp: (state) => {
      state.lastUpdate = Date.now();
    },
  },
  
  extraReducers: (builder) => {
    // Handle idea research effects that modify state directly
    // (Dispatch-requiring effects are handled in useIdeas hook via effectProcessor)
    builder.addCase(researchIdea, (state, action) => {
      const ideaId = action.payload;
      const idea = ideas[ideaId];
      
      if (!idea) return;
      
      const effects = idea.effects;
      
      // Apply upgradeJobsite - modifies specific jobsite properties
      if (effects.upgradeJobsite) {
        const { jobsiteId, property, amount } = effects.upgradeJobsite;
        
        // Handle jobless jobsite
        if (jobsiteId === 'jobless') {
          const jobless = state.jobSites.jobless;
          if (property === 'multi') jobless.multi += amount;
          else if (property === 'value') jobless.value += amount;
          else if (property === 'time') jobless.time -= amount; // Decrease time
          else if (property === 'chance') jobless.chance += amount;
        }
        // Handle production jobsites
        else if (state.jobSites.production[jobsiteId]) {
          state.jobSites.production[jobsiteId].multi += amount;
        }
        // Handle refinement jobsites
        else if (state.jobSites.refinement[jobsiteId]) {
          state.jobSites.refinement[jobsiteId].multi += amount;
        }
      }
      
      // Apply globalEfficiency - increases all jobsite multipliers
      if (effects.globalEfficiency) {
        const efficiencyBoost = effects.globalEfficiency;
        
        // Increase jobless multi
        state.jobSites.jobless.multi += efficiencyBoost;
        
        // Increase all production jobsites
        Object.values(state.jobSites.production).forEach(jobsite => {
          jobsite.multi += efficiencyBoost;
        });
        
        // Increase all refinement jobsites
        Object.values(state.jobSites.refinement).forEach(jobsite => {
          jobsite.multi += efficiencyBoost;
        });
      }
      
      // Apply increaseGatherMulti - increases manual gathering multiplier
      if (effects.increaseGatherMulti) {
        state.getButton.mult += effects.increaseGatherMulti;
      }
      
      // Apply increaseGetButton - increases get button base value
      if (effects.increaseGetButton) {
        state.getButton.value += effects.increaseGetButton;
      }
      
      // Note: unlockJobsites, unlockBuildings, unlockTabs, etc. are now handled
      // in useIdeas hook via the centralized effectProcessor
    });
  },
});

export const {
  addNuts,
  spendNuts,
  addResource,
  spendResource,
  craftRefinement,
  createSquirrel,
  squirrelFoundNut,
  unlockJobsites,
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
  batchUpdate,
  incrementTick,
  updateTimer,
  setGameSpeed,
  pauseGame,
  resumeGame,
  setActiveTab,
  unlockTab,
  unlockTabs,
  hibernate,
  loadSaveData,
  updateTimestamp,
} = gameSlice.actions;

export default gameSlice.reducer;

