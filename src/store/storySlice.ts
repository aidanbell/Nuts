import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { StoryState } from '../types/story';
import { storyCheckpoints } from '../data/storyCheckpoints';

const initialState: StoryState = {
  checkpoints: storyCheckpoints,
  activeStory: null,
  storyQueue: [],
  completedCheckpoints: [],
  currentEra: "PREHISTORY",
  storyProgress: 0,
  eraBonuses: {},
  pendingChoice: null,
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    // Mark a checkpoint as completed
    completeCheckpoint: (state, action: PayloadAction<string>) => {
      const checkpointId = action.payload;
      const checkpoint = state.checkpoints[checkpointId];
      
      if (checkpoint && !checkpoint.completed) {
        checkpoint.completed = true;
        checkpoint.completedAt = Date.now();
        state.completedCheckpoints.push(checkpointId);
        
        // Calculate story progress
        const totalCheckpoints = Object.keys(state.checkpoints).length;
        state.storyProgress = Math.floor((state.completedCheckpoints.length / totalCheckpoints) * 100);
      }
    },
    
    // Show a story modal
    showStory: (state, action: PayloadAction<string>) => {
      state.activeStory = action.payload;
    },
    
    // Dismiss the active story and show next in queue
    dismissStory: (state) => {
      state.activeStory = null;
      
      // Show next story in queue if available
      if (state.storyQueue.length > 0) {
        const nextStoryId = state.storyQueue.shift(); // Remove first item from queue
        if (nextStoryId) {
          state.activeStory = nextStoryId;
        }
      }
    },
    
    // Add a story to the queue
    queueStory: (state, action: PayloadAction<string>) => {
      const checkpointId = action.payload;
      
      // Don't queue if already in queue or currently active
      if (state.activeStory === checkpointId || state.storyQueue.includes(checkpointId)) {
        return;
      }
      
      // If no active story, show immediately
      if (!state.activeStory) {
        state.activeStory = checkpointId;
      } else {
        // Otherwise add to queue
        state.storyQueue.push(checkpointId);
      }
    },
    
    // Queue multiple stories at once (sorted by priority)
    queueStories: (state, action: PayloadAction<string[]>) => {
      const checkpointIds = action.payload;
      
      // Filter out any that are already active or queued
      const newStories = checkpointIds.filter(
        id => id !== state.activeStory && !state.storyQueue.includes(id)
      );
      
      if (newStories.length === 0) return;
      
      // If no active story, show the first one
      if (!state.activeStory) {
        state.activeStory = newStories[0];
        // Add the rest to queue
        state.storyQueue.push(...newStories.slice(1));
      } else {
        // Add all to queue
        state.storyQueue.push(...newStories);
      }
    },
    
    // Update current era
    setEra: (state, action: PayloadAction<string>) => {
      state.currentEra = action.payload;
    },
    
    // Set pending choice (story with choices shown)
    setPendingChoice: (state, action: PayloadAction<string | null>) => {
      state.pendingChoice = action.payload;
    },
    
    // Make a story choice
    makeChoice: (state, action: PayloadAction<{ checkpointId: string; choiceId: string }>) => {
      const { checkpointId, choiceId } = action.payload;
      const checkpoint = state.checkpoints[checkpointId];
      
      if (!checkpoint?.story?.choices) return;
      
      const choice = checkpoint.story.choices.find(c => c.id === choiceId);
      if (!choice?.effects) return;
      
      // Apply choice effects
      if (choice.effects.setEra) {
        state.currentEra = choice.effects.setEra;
      }
      
      if (choice.effects.grantBonus) {
        const { type, value, target } = choice.effects.grantBonus;
        if (type === 'era_multiplier' && target) {
          state.eraBonuses[target] = (state.eraBonuses[target] || 1) * value;
        }
      }
      
      // Note: addNuts effect is handled in StoryModal component via direct dispatch
      // This is because we can't dispatch to gameSlice from storySlice
      
      // Mark checkpoint as complete
      if (!checkpoint.completed && checkpoint.oneTime) {
        checkpoint.completed = true;
        checkpoint.completedAt = Date.now();
        state.completedCheckpoints.push(checkpointId);
        
        // Calculate story progress
        const totalCheckpoints = Object.keys(state.checkpoints).length;
        state.storyProgress = Math.floor((state.completedCheckpoints.length / totalCheckpoints) * 100);
      }
      
      // Clear pending choice
      state.pendingChoice = null;
      state.activeStory = null;
      
      // Show next story in queue if available
      if (state.storyQueue.length > 0) {
        const nextStoryId = state.storyQueue.shift();
        if (nextStoryId) {
          state.activeStory = nextStoryId;
        }
      }
    },
    
    // Reset all checkpoints (for new game)
    resetCheckpoints: (state) => {
      Object.values(state.checkpoints).forEach(checkpoint => {
        checkpoint.completed = false;
        checkpoint.completedAt = undefined;
      });
      state.completedCheckpoints = [];
      state.storyProgress = 0;
      state.activeStory = null;
      state.storyQueue = [];
      state.currentEra = 'PREHISTORY';
      state.eraBonuses = {};
      state.pendingChoice = null;
    },
    
    // Load checkpoint state from save
    loadCheckpointState: (state, action: PayloadAction<{ completedCheckpoints: string[]; currentEra: string }>) => {
      state.completedCheckpoints = action.payload.completedCheckpoints;
      state.currentEra = action.payload.currentEra;
      
      // Mark checkpoints as completed
      action.payload.completedCheckpoints.forEach(checkpointId => {
        if (state.checkpoints[checkpointId]) {
          state.checkpoints[checkpointId].completed = true;
        }
      });
      
      // Calculate progress
      const totalCheckpoints = Object.keys(state.checkpoints).length;
      state.storyProgress = Math.floor((state.completedCheckpoints.length / totalCheckpoints) * 100);
    },
  },
});

export const {
  completeCheckpoint,
  showStory,
  dismissStory,
  queueStory,
  queueStories,
  setEra,
  setPendingChoice,
  makeChoice,
  resetCheckpoints,
  loadCheckpointState,
} = storySlice.actions;

export default storySlice.reducer;
