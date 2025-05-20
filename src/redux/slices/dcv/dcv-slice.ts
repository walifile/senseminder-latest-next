import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LaunchVMResponse {
  sessionId: string;
  sessionToken: string;
  dnsName: string;
  authToken?: string;
}

interface DcvState {
  launchVMResponse: LaunchVMResponse | null; // Now it uses the 'LaunchVMResponse' type
  loading: boolean;
  error: string | null;
}

const initialState: DcvState = {
  launchVMResponse: null,
  loading: false,
  error: null,
};

const dcvSlice = createSlice({
  name: "dcv",
  initialState,
  reducers: {
    setLaunchVMResponse: (
      state,
      action: PayloadAction<LaunchVMResponse | null>
    ) => {
      state.launchVMResponse = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLaunchVMResponse, setLoading, setError } = dcvSlice.actions;

export const selectLaunchVMResponse = (state: { dcv: DcvState }) =>
  state.dcv.launchVMResponse;
export const selectLoading = (state: { dcv: DcvState }) => state.dcv.loading;
export const selectError = (state: { dcv: DcvState }) => state.dcv.error;

export default dcvSlice.reducer;
