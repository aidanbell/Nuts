import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import storyReducer from './storySlice';
import ideasReducer from './ideasSlice';
import gameLogReducer from './gameLogSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    story: storyReducer,
    ideas: ideasReducer,
    gameLog: gameLogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['game/updateTimestamp'],
        ignoredPaths: ['game.lastUpdate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

