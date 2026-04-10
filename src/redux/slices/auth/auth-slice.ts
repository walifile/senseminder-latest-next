import type { RootState } from "@/redux/store";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Logger } from "@/lib/utils/logger";
import { syncAuthState } from "@/lib/utils/auth-sync";

import { createSlice } from "@reduxjs/toolkit";

interface User {
  email: string;
  firstName: string;
  lastName?: string;
  // country: string;
  organization?: string;
  id?: string; // Add optional 'id' property
  role: string;
  ownerid?: string;
  idToken?: string;
  acceptedLegal?: string;
  onboarded?: string;
  // cellPhone: string;
}

interface TempUser {
  isSignedIn: boolean;
  nextStep: {
    signInStep: string;
    missingAttributes?: string[];
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  tempUser: TempUser | null; // <-- Add tempUser for NEW_PASSWORD_REQUIRED flow
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  token: null,
  tempUser: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      syncAuthState(true, action.payload.token);
      state.tempUser = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.tempUser = null;
      syncAuthState(false, null);
    },
    setTempUser: (state, action: PayloadAction<TempUser | null>) => {
      Logger.log("Setting temp user in auth slice:", action.payload);
      state.tempUser = action.payload;
    },
    clearTempUser: (state) => {
      state.tempUser = null;
    },
  },
});

export const { setUser, setLoading, clearAuth, setTempUser, clearTempUser } =
  authSlice.actions;

export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectUserId = (state: RootState) => state.auth.user?.id;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectTempUser = (state: RootState) => state.auth.tempUser;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectUserEmail = (state: RootState) => state.auth.user?.email;
