import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

interface LaunchVMResponse {
  sessionId: string;
  sessionToken: string;
  dnsName: string;
  authToken?: string;
  pcName?: string;
  instanceId?: string;
  userId?: string;
}

interface DcvState {
  instances: Record<string, LaunchVMResponse>;
  loading: boolean;
  error: string | null;
}

const initialState: DcvState = {
  instances: {},
  loading: false,
  error: null,
};

const dcvSlice = createSlice({
  name: "dcv",
  initialState,
  reducers: {
    setLaunchVMResponse: (
      state,
      action: PayloadAction<{
        sessionKey: string;
        response: LaunchVMResponse;
        pcName?: string;
        instanceId?: string;
        userId?: string;
      }>
    ) => {
      const { sessionKey, response, pcName, instanceId, userId } = action.payload;

      state.instances[sessionKey] = {
        ...state.instances[sessionKey],
        ...response,
        ...(pcName ? { pcName } : {}),
        ...(instanceId ? { instanceId } : {}),
        ...(userId ? { userId } : {}),
      };
    },
    removeLaunchVMResponse: (state, action: PayloadAction<string>) => {
      delete state.instances[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLaunchVMResponse,
  removeLaunchVMResponse,
  setLoading,
  setError,
} = dcvSlice.actions;

// Selectors
export const selectLaunchVMResponse = (
  state: { dcv: DcvState },
  sessionKey: string
) => state.dcv.instances[sessionKey];

export const selectAllLaunchVMResponses = (state: { dcv: DcvState }) =>
  state.dcv.instances;

export const selectLoading = (state: { dcv: DcvState }) => state.dcv.loading;

export const selectError = (state: { dcv: DcvState }) => state.dcv.error;

export default dcvSlice.reducer;
