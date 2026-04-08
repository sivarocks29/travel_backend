/**
 * Redux slice for fleet management authentication.
 * Stores role + JWT tokens, synced to localStorage for axios interceptors.
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../../types/fleet';

interface FleetUser {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export interface FleetAuthState {
  user: FleetUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: FleetAuthState = {
  user: localStorage.getItem('fleet_user') ? JSON.parse(localStorage.getItem('fleet_user')!) : null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
};

const fleetAuthSlice = createSlice({
  name: 'fleetAuth',
  initialState,
  reducers: {
    setFleetCredentials(
      state,
      action: PayloadAction<{ user: FleetUser; access: string; refresh: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload.access);
      localStorage.setItem('refresh_token', action.payload.refresh);
      localStorage.setItem('fleet_user', JSON.stringify(action.payload.user));
    },
    clearFleetCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('fleet_user');
    },
  },
});

export const { setFleetCredentials, clearFleetCredentials } = fleetAuthSlice.actions;
export default fleetAuthSlice.reducer;

// Selectors
export const selectFleetUser = (state: { fleetAuth: FleetAuthState }) => state.fleetAuth.user;
export const selectFleetRole = (state: { fleetAuth: FleetAuthState }) => state.fleetAuth.user?.role;
export const selectFleetIsAuthenticated = (state: { fleetAuth: FleetAuthState }) => state.fleetAuth.isAuthenticated;
