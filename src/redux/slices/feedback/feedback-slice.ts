import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface feedbackState {
  isShow: boolean;
}

const initialState: feedbackState = {
  isShow: false,
};

export const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setIsShow: (state, action: PayloadAction<boolean>) => {
      state.isShow = action.payload;
    },
  },
});

export const { setIsShow } = feedbackSlice.actions;

export default feedbackSlice.reducer;

export const selectIsShow = (state: RootState) => state.feedback.isShow;
