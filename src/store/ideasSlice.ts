import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IdeasState } from '../types/ideas';
import { ideas } from '../data/ideas';

const initialState: IdeasState = {
  ideas: ideas,
  researchedIdeas: [],
  researchedCount: 0,
  totalResearchPoints: 0,
};

const ideasSlice = createSlice({
  name: 'ideas',
  initialState,
  reducers: {
    // Research an idea
    researchIdea: (state, action: PayloadAction<string>) => {
      const ideaId = action.payload;
      const idea = state.ideas[ideaId];
      
      if (idea && !idea.researched) {
        idea.researched = true;
        idea.researchedAt = Date.now();
        state.researchedIdeas.push(ideaId);
        state.researchedCount += 1;
      }
      // Effects are applied in gameSlice via extraReducers
    },
    
    // Make an idea visible
    showIdea: (state, action: PayloadAction<string>) => {
      const ideaId = action.payload;
      const idea = state.ideas[ideaId];
      
      if (idea) {
        idea.visible = true;
      }
    },
    
    // Batch show multiple ideas
    showIdeas: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(ideaId => {
        const idea = state.ideas[ideaId];
        if (idea) {
          idea.visible = true;
        }
      });
    },
    
    // Check and update idea visibility based on requirements
    updateIdeaVisibility: (state, action: PayloadAction<{
      nutsCollected: number;
      squirrelsCount: number;
      currentEra: string;
    }>) => {
      const { nutsCollected, squirrelsCount, currentEra } = action.payload;
      
      Object.values(state.ideas).forEach(idea => {
        if (idea.visible || idea.researched) return;
        
        const reqs = idea.requirements;
        if (!reqs) {
          idea.visible = true;
          return;
        }
        
        let meetsRequirements = true;
        
        // Check era requirement
        if (reqs.era && reqs.era !== currentEra) {
          meetsRequirements = false;
        }
        
        // Check nuts requirement
        if (reqs.nutsCollected && nutsCollected < reqs.nutsCollected) {
          meetsRequirements = false;
        }
        
        // Check squirrels requirement
        if (reqs.squirrelsCount && squirrelsCount < reqs.squirrelsCount) {
          meetsRequirements = false;
        }
        
        // Check prerequisite ideas
        if (reqs.ideasResearched) {
          const allResearched = reqs.ideasResearched.every(
            reqId => state.ideas[reqId]?.researched
          );
          if (!allResearched) {
            meetsRequirements = false;
          }
        }
        
        if (meetsRequirements) {
          idea.visible = true;
        }
      });
    },
    
    // Reset all ideas (for new game/hibernation)
    resetIdeas: (state) => {
      Object.values(state.ideas).forEach(idea => {
        idea.researched = false;
        idea.researchedAt = undefined;
        idea.visible = idea.requirements ? false : true; // Only show ideas without requirements
      });
      state.researchedCount = 0;
    },
    
    // Load ideas state from save
    loadIdeasState: (state, action: PayloadAction<Partial<IdeasState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  researchIdea,
  showIdea,
  showIdeas,
  updateIdeaVisibility,
  resetIdeas,
  loadIdeasState,
} = ideasSlice.actions;

export default ideasSlice.reducer;

