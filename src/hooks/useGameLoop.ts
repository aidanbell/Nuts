import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { 
  batchUpdate, 
  updateTimestamp, 
  incrementTick, 
  updateTimer,
  squirrelFoundNut,
  addResource,
  spendResource
} from '../store/gameSlice';
import type { GameUpdate } from '../types/game';

// Random chance helper
const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

const useGameLoop = () => {
  const dispatch = useDispatch();
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  
  const { 
    jobSites, 
    gameSpeed, 
    isPaused, 
    population,
    nutsTotal,
    resources
  } = useSelector((state: RootState) => state.game);
  
  // Track last refinement cycle time for each worker at each jobsite
  const lastRefinementCycleRef = useRef<Record<string, Record<number, number>>>({});
  
  // Process jobsite workers - NEW BUILDING SYSTEM
  // Buildings produce passively (baseProduction) + bonus from assigned squirrels
  const processJobSites = useCallback((deltaTime: number, currentTime: number) => {
    const updates: GameUpdate[] = [];
    const { production: productionJobsites, refinement: refinementJobsites } = jobSites;
    
    Object.values(productionJobsites).forEach(jobSite => {
      // Buildings always produce (baseProduction), squirrels add bonus
      const baseRate = jobSite.baseProduction * jobSite.multi; // Passive production
      const squirrelRate = jobSite.squirrelBonus * jobSite.multi * jobSite.workers.length; // Squirrel bonus
      const totalRate = baseRate + squirrelRate; // nuts per second
      const totalProduction = (totalRate * deltaTime * gameSpeed) / 1000; // Convert ms to seconds
      
      if (totalProduction > 0) {
        updates.push({
          type: 'ADD_NUTS',
          data: { amount: totalProduction }
        });
      }
    });
    
    // Refinement jobsites consume resources and produce refined materials (CYCLE-BASED)
    Object.values(refinementJobsites).forEach(jobSite => {
      if (jobSite.workers.length === 0 || !jobSite.consumes || !jobSite.produces) return;
      
      // Initialize tracking for this jobsite if needed
      if (!lastRefinementCycleRef.current[jobSite.id]) {
        lastRefinementCycleRef.current[jobSite.id] = {};
      }
      
      const { resource: consumeType, amount: consumeAmount } = jobSite.consumes;
      const { resource: produceType, amount: produceAmount } = jobSite.produces;
      
      // Process each worker individually with their own cycle timer
      jobSite.workers.forEach(workerId => {
        const lastCycle = lastRefinementCycleRef.current[jobSite.id][workerId] ?? 0;
        
        // Check if enough time has passed for this worker to complete a cycle
        if (currentTime - lastCycle >= jobSite.time) {
          // Check if we have enough resources for this cycle
          const availableResource = consumeType === 'nuts' ? nutsTotal : resources[consumeType as keyof typeof resources];
          
          if (availableResource >= consumeAmount) {
            // Consume input resource
            if (consumeType === 'nuts') {
              updates.push({
                type: 'ADD_NUTS',
                data: { amount: -consumeAmount }
              });
            } else {
              dispatch(spendResource({ resource: consumeType as keyof typeof resources, amount: consumeAmount }));
            }
            
            // Produce output resource
            dispatch(addResource({ resource: produceType, amount: produceAmount }));
            
            // Update the last cycle time for this worker
            lastRefinementCycleRef.current[jobSite.id][workerId] = currentTime;
          }
          // If not enough resources, skip this cycle (try again next tick)
        }
      });
    });
    
    // Batch all updates for performance
    if (updates.length > 0) {
      dispatch(batchUpdate(updates));
    }
  }, [jobSites, gameSpeed, dispatch, nutsTotal, resources, lastRefinementCycleRef]);
  
  // Process jobless squirrels - RNG-BASED FORAGING
  // Creates contrast: random early game vs steady jobsite production
  const lastJoblessAttemptRef = useRef<Record<number, number>>({});
  const processJoblessSquirrels = useCallback((currentTime: number) => {
    const { time, chance: foragingChance } = jobSites.jobless;
    
    population.jobless.forEach(squirrelId => {
      const lastAttempt = lastJoblessAttemptRef.current[squirrelId] ?? 0;
      if (currentTime - lastAttempt >= time) {
        // Random chance to find nuts (value & multi applied in squirrelFoundNut reducer)
        if (chance(foragingChance)) {
          dispatch(squirrelFoundNut(squirrelId));
        }
        lastJoblessAttemptRef.current[squirrelId] = currentTime;
      }
    });
  }, [jobSites.jobless, population.jobless, dispatch]);
  
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      const deltaTime = currentTime - lastUpdateRef.current;
      
      // Run game logic at ~100 FPS (every 10ms, matching original)
      if (deltaTime >= 10) {
        dispatch(incrementTick());
        dispatch(updateTimer());
        processJobSites(deltaTime, currentTime); // Pass currentTime for refinement cycles
        processJoblessSquirrels(currentTime); // Pass currentTime for RNG checks
        dispatch(updateTimestamp());
        lastUpdateRef.current = currentTime;
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [processJobSites, processJoblessSquirrels, isPaused, dispatch]);
};

export default useGameLoop;

