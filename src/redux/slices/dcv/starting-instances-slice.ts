import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StartVMState {
  startingInstances: string[];
}

const initialState: StartVMState = {
  startingInstances: [],
};

export const startVMSlice = createSlice({
  name: "startVM",
  initialState,
  reducers: {
    addStartingInstance: (state, action: PayloadAction<string>) => {
      if (!state.startingInstances.includes(action.payload)) {
        state.startingInstances.push(action.payload);
      }
    },
    removeStartingInstance: (state, action: PayloadAction<string>) => {
      state.startingInstances = state.startingInstances.filter(
        (id) => id !== action.payload
      );
    },
    resetStartingInstances: (state) => {
      state.startingInstances = [];
    },
  },
});

export const {
  addStartingInstance,
  removeStartingInstance,
  resetStartingInstances,
} = startVMSlice.actions;

export default startVMSlice.reducer;
