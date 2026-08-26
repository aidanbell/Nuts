import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { completeCheckpoint, queueStories } from '../store/storySlice';
import { addLog } from '../store/gameLogSlice';
import type { CheckpointCondition, StoryCheckpoint } from '../types/story';
import { processEffects } from '../utils/effectProcessor';

/**
 * Hook to check and trigger story checkpoints based on game state
 */
const useStoryCheckpoints = () => {
  const dispatch = useDispatch();
  
  // Game state
  const gameState = useSelector((state: RootState) => state.game);
  const storyState = useSelector((state: RootState) => state.story);
  const ideasState = useSelector((state: RootState) => state.ideas);

  // Check if a condition is met
  const checkCondition = useCallback((condition: CheckpointCondition): boolean => {
    const { type, value, operator = '>=' } = condition;
    let currentValue: number | string = 0;
    
    switch (type) {
      case 'nuts_collected':
        currentValue = gameState.nutsTotal;
        break;
        
      case 'time_elapsed':
        // Convert timer to milliseconds
        currentValue = (gameState.timer.m * 60000) + (gameState.timer.s * 1000) + gameState.timer.ms;
        break;
        
      case 'squirrels_count':
        currentValue = Object.keys(gameState.squirrels).length;
        break;
        
      case 'jobsites_purchased': {
        // Count total level across all jobsites (production and refinement)
        const productionLevel = Object.values(gameState.jobSites.production).reduce(
          (total, jobsite) => total + jobsite.level, 
          0
        );
        const refinementLevel = Object.values(gameState.jobSites.refinement).reduce(
          (total, jobsite) => total + jobsite.level, 
          0
        );
        currentValue = productionLevel + refinementLevel;
        break;
      }
      case 'era_reached':
        currentValue = storyState.currentEra || '';
        break;
        
      case 'building_built':
        // TODO: Implement building tracking when building system is complete
        // For now, always return false until buildings are implemented
        return false;
        
      case 'idea_researched':
        if (ideasState.researchedIdeas.includes(value as string)) {
          return true;
        }
        return false;
        
      case 'hibernations_completed':
        currentValue = gameState.goldNuts?.total || 0;
        break;
        
      case 'resource_count': {
        // Check refined resource counts
        const resourceType = condition.resource;
        if (resourceType && gameState.resources && resourceType in gameState.resources) {
          currentValue = gameState.resources[resourceType as keyof typeof gameState.resources];
        } else {
          return false;
        }
        break;
      }
        
      default:
        return false;
    }
    
    // Handle string comparisons (for era_reached)
    if (typeof value === 'string' && typeof currentValue === 'string') {
      return operator === '==' ? currentValue === value : false;
    }
    
    // Handle numeric comparisons
    if (typeof value === 'number' && typeof currentValue === 'number') {
      switch (operator) {
        case '>=': return currentValue >= value;
        case '>': return currentValue > value;
        case '==': return currentValue === value;
        case '<': return currentValue < value;
        case '<=': return currentValue <= value;
        default: return false;
      }
    }
    
    return false;
  }, [gameState, storyState.currentEra, ideasState.researchedIdeas]);
  
  // Check if checkpoint should trigger
  const shouldTriggerCheckpoint = useCallback((checkpoint: StoryCheckpoint): boolean => {
    // Don't retrigger completed one-time checkpoints
    if (checkpoint.completed && checkpoint.oneTime) {
      return false;
    }
    
    // Check requirements (AND logic - all must be true)
    if (checkpoint.requirements) {
      const allRequirementsMet = checkpoint.requirements.every(req => checkCondition(req));
      if (!allRequirementsMet) {
        return false;
      }
    }
    
    // Check triggers (OR logic - any one triggers)
    if (checkpoint.triggers) {
      return checkpoint.triggers.some(trigger => checkCondition(trigger));
    }
    
    return false;
  }, [checkCondition]);
  
  // Process all checkpoints
  const processCheckpoints = useCallback(() => {
    // Get uncompleted checkpoints sorted by priority
    const checkpointsToCheck = Object.values(storyState.checkpoints)
      .filter(cp => !cp.completed || cp.repeatable)
      .sort((a, b) => b.priority - a.priority);
    
    // Collect all triggered checkpoints
    const triggeredCheckpoints: StoryCheckpoint[] = [];
    
    for (const checkpoint of checkpointsToCheck) {
      if (shouldTriggerCheckpoint(checkpoint)) {
        triggeredCheckpoints.push(checkpoint);
      }
    }
    
    // Process all triggered checkpoints
    if (triggeredCheckpoints.length > 0) {
      const checkpointIds: string[] = [];
      
      for (const checkpoint of triggeredCheckpoints) {
        dispatch(addLog({ message: `Story checkpoint: ${checkpoint.name}`, level: 'success' }));
        
        // Mark as completed
        dispatch(completeCheckpoint(checkpoint.id));
        
        // Apply effects using centralized processor
        processEffects(checkpoint.effects, dispatch, {
          sourceName: checkpoint.name,
          sourceType: 'checkpoint',
          checkpointId: checkpoint.id,
        });
        
        // Add to queue if it has a story to show
        if (checkpoint.effects.showStory && checkpoint.story) {
          checkpointIds.push(checkpoint.id);
        }
      }
      
      // Queue all stories at once (in priority order)
      if (checkpointIds.length > 0) {
        dispatch(queueStories(checkpointIds));
      }
    }
  }, [storyState.checkpoints, shouldTriggerCheckpoint, dispatch]);
  
  // Check for checkpoints every second
  useEffect(() => {
    const interval = setInterval(() => {
      processCheckpoints();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [processCheckpoints]);
  
  // Also check immediately when game state changes significantly
  const squirrelCount = Object.keys(gameState.squirrels).length;
  const nutwoodCount = gameState.resources?.nutwood || 0;
  useEffect(() => {
    processCheckpoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameState.nutsTotal,
    storyState.currentEra,
    squirrelCount,
    nutwoodCount,
  ]);
};

export default useStoryCheckpoints;
