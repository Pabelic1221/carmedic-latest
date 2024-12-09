import { createSlice } from "@reduxjs/toolkit";
import { fetchAllShops } from "./shopsThunk";

const initialState = {
  shops: [],
  loading: false,
  error: null,
};

const shopSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {
    resetShops: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload;
      })
      .addCase(fetchAllShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetShops } = shopSlice.actions;
export const reducer = shopSlice.reducer;
