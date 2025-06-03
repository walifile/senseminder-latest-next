import { routes } from "@/constants/routes";
import { syncAuthState } from "@/lib/utils/auth-sync";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  email: string;
  firstName: string;
  lastName?: string;
  // country: string;
  // organization: string;
  id?: string; // Add optional 'id' property
  role: string;
  // cellPhone: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  tempUser: any | null; // <-- Add tempUser for NEW_PASSWORD_REQUIRED flow
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
      action: PayloadAction<
        | {
            user: User;
            token: string;
          }
        | null
      >
    ) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        syncAuthState(true, action.payload.token);
        state.tempUser = null; // clear tempUser on full login
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        syncAuthState(false, null);
        state.tempUser = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.tempUser = null;
      syncAuthState(false, null);

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Clear browser history before redirecting
        window.history.pushState(null, "", "/");

        if (currentPath === "/" || currentPath === "/index") {
          window.location.reload();
        } else {
          window.location.replace(`${routes?.signIn}`);
        }
      }
    },
    setTempUser: (state, action: PayloadAction<any | null>) => {
      state.tempUser = action.payload;
    },
    clearTempUser: (state) => {
      state.tempUser = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  clearAuth,
  setTempUser,
  clearTempUser,  // <--- Export clearTempUser here
} = authSlice.actions;

export default authSlice.reducer;
