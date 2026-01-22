import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface SmartPcConfig {
  operatingSystem: string;
  cpu: string;
  region: string;
  storage: string;
  show: boolean;
}

const initialState: SmartPcConfig = {
  operatingSystem: "",
  cpu: "",
  region: "",
  storage: "",
  show: false,
};

type SetFullConfigPayload = Omit<SmartPcConfig, "show"> & { show?: boolean };

const smartPcConfigSlice = createSlice({
  name: "smartPcConfig",
  initialState,
  reducers: {
    setSmartPcConfig: (state, action: PayloadAction<SetFullConfigPayload>) => {
      const {
        operatingSystem,
        cpu,
        region,
        storage,
        show = true,
      } = action.payload;

      state.operatingSystem = operatingSystem;
      state.cpu = cpu;
      state.region = region;
      state.storage = storage;
      state.show = show;
    },
    clearSmartPcConfig: () => initialState,
  },
});

export const { setSmartPcConfig, clearSmartPcConfig } =
  smartPcConfigSlice.actions;

export default smartPcConfigSlice.reducer;
