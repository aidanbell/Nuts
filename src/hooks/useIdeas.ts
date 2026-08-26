import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { researchIdea, updateIdeaVisibility } from '../store/ideasSlice';
import { spendNuts, spendResource } from '../store/gameSlice';
import { addLog } from '../store/gameLogSlice';
import type { Idea } from '../types/ideas';
import { processEffects } from '../utils/effectProcessor';

/**
 * Hook to manage ideas/research system
 */
export const useIdeas = () => {
  const dispatch = useDispatch();
  
  const ideas = useSelector((state: RootState) => state.ideas.ideas);
  const researchedCount = useSelector((state: RootState) => state.ideas.researchedCount);
  const nutsTotal = useSelector((state: RootState) => state.game.nutsTotal);
  const resources = useSelector((state: RootState) => state.game.resources);
  const squirrelsCount = useSelector((state: RootState) => 
    Object.keys(state.game.squirrels).length
  );
  const currentEra = useSelector((state: RootState) => state.story.currentEra);
  
  // Update idea visibility based on game state
  useEffect(() => {
    dispatch(updateIdeaVisibility({
      nutsCollected: nutsTotal,
      squirrelsCount,
      currentEra: currentEra || 'WOOD_AGE',
    }));
  }, [nutsTotal, squirrelsCount, currentEra, dispatch]);
  
  // Check if player can afford an idea
  const canAfford = useCallback((idea: Idea): boolean => {
    if (idea.researched) return false;
    
    const nutCost = idea.cost.nuts || 0;
    const woodCost = idea.cost.nutwood || 0;
    const stoneCost = idea.cost.stone || 0;
    const bronzeCost = idea.cost.bronze || 0;
    return nutsTotal >= nutCost && resources.nutwood >= woodCost && resources.stone >= stoneCost && resources.bronze >= bronzeCost;
  }, [nutsTotal, resources]);
  
  // Research an idea
  const research = useCallback((ideaId: string) => {
    const idea = ideas[ideaId];
    if (!idea || idea.researched || !canAfford(idea)) return;
    
    // Deduct costs
    const nutCost = idea.cost.nuts || 0;
    const woodCost = idea.cost.nutwood || 0;
    const stoneCost = idea.cost.stone || 0;
    const bronzeCost = idea.cost.bronze || 0;
    if (nutCost > 0) {
      dispatch(spendNuts(nutCost));
    }
    if (woodCost > 0) {
      dispatch(spendResource({ resource: 'nutwood', amount: woodCost }));
    }
    if (stoneCost > 0) {
      dispatch(spendResource({ resource: 'stone', amount: stoneCost }));
    }
    if (bronzeCost > 0) {
      dispatch(spendResource({ resource: 'bronze', amount: bronzeCost }));
    }
    
    // Mark as researched (this will trigger extraReducers in gameSlice for state-only effects)
    dispatch(researchIdea(ideaId));
    dispatch(addLog({ message: `Researched: ${idea.name}`, level: 'success' }));
    
    // Apply dispatch-requiring effects using centralized processor
    // (State-modifying effects are handled in gameSlice extraReducers)
    processEffects(idea.effects, dispatch, {
      sourceName: idea.name,
      sourceType: 'idea',
      suppressLogs: true, // Suppress individual effect logs to avoid spam
    });
  }, [ideas, canAfford, dispatch]);
  
  // Get visible ideas
  const visibleIdeas = Object.values(ideas).filter(idea => idea.visible);
  
  // Get researched ideas
  const researchedIdeas = Object.values(ideas).filter(idea => idea.researched);
  
  // Get affordable ideas
  const affordableIdeas = visibleIdeas.filter(idea => 
    !idea.researched && canAfford(idea)
  );
  
  return {
    ideas: Object.values(ideas),
    visibleIdeas,
    researchedIdeas,
    affordableIdeas,
    researchedCount,
    canAfford,
    research,
  };
};

