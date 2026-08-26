import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameLogState, LogLevel } from '../types/gameLog';

const initialState: GameLogState = {
  logs: [],
  maxLogs: 50, // Keep last 50 log entries
};

const gameLogSlice = createSlice({
  name: 'gameLog',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<{ message: string; level?: LogLevel }>) => {
      const { message, level = 'info' } = action.payload;
      
      const newLog = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        level,
        timestamp: Date.now(),
      };
      
      state.logs.push(newLog);
      
      // Keep only the last maxLogs entries
      if (state.logs.length > state.maxLogs) {
        state.logs = state.logs.slice(-state.maxLogs);
      }
    },
    
    clearLogs: (state) => {
      state.logs = [];
    },
  },
});

export const { addLog, clearLogs } = gameLogSlice.actions;
export default gameLogSlice.reducer;

