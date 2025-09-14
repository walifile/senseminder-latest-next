import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

interface LaunchVMResponse {
  sessionId: string;
  sessionToken: string;
  dnsName: string;
  authToken?: string;
  pcName?: string;
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
        instanceId: string;
        response: LaunchVMResponse;
        pcName?: string;
      }>
    ) => {
      const { instanceId, response, pcName } = action.payload;

      state.instances[instanceId] = {
        ...state.instances[instanceId],
        ...response,
        ...(pcName ? { pcName } : {}),
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
  instanceId: string
) => state.dcv.instances[instanceId];

export const selectAllLaunchVMResponses = (state: { dcv: DcvState }) =>
  state.dcv.instances;

export const selectLoading = (state: { dcv: DcvState }) => state.dcv.loading;

export const selectError = (state: { dcv: DcvState }) => state.dcv.error;

export default dcvSlice.reducer;
