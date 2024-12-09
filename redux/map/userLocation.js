import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentLocation: null,
};
const locationSlice = createSlice({
  name: "userLocation",
  initialState: initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      return state;
    },
    resetLocation: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const reducer = locationSlice.reducer;
export const actions = locationSlice.actions;
