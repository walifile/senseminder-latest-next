/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
