/* eslint-disable @typescript-eslint/no-explicit-any */
import { routes } from "@/constants/routes";
import { syncAuthState } from "@/lib/utils/auth-sync";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    email: string;
    firstName: string;
    lastName?: string;
    // country: string;
    // organization: string;
    id?: string; // Add optional 'id' property
    role: string;
    // cellPhone: string;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  token: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: {
          email: string;
          firstName: string;
          lastName?: string;
          // country: string;
          // organization: string;
          id?: string;
          role: string;
          // cellPhone: string;
        };
        token: string;
      } | null>
    ) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        syncAuthState(true, action.payload.token);
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        syncAuthState(false, null);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      syncAuthState(false, null);

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Clear browser history before redirecting
        window.history.pushState(null, "", "/");

        if (currentPath === "/" || currentPath === "/index") {
          window.location.reload();
        } else {
          // For private routes, go to login with clean 'from' parameter
          // const cleanPath = currentPath.replace(/\?.*$/, ""); // Remove any query params
          window.location.replace(`${routes?.signIn}`);
          // window.location.replace(`${routes?.signIn}?from=${cleanPath}`);
        }
      }
    },
  },
});

export const { setUser, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
