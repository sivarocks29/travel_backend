import { configureStore } from '@reduxjs/toolkit';
import fleetAuthReducer from '@/features/fleet/fleetAuthSlice';

export const store = configureStore({
  reducer: {
    fleetAuth: fleetAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
