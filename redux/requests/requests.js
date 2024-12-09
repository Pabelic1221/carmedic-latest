import { createSlice } from "@reduxjs/toolkit";
import { fetchAllRequests } from "./requestsThunk"; // Import the asyncThunk

const initialState = {
  requests: [],
  rescueRoute: [],
  shopLocation: {},
  requestLocation: {},
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setRescueRoute: (state, action) => {
      state.rescueRoute = action.payload;
    },
    setShopLocation: (state, action) => {
      state.shopLocation = action.payload;
    },
    setRequestLocation: (state, action) => {
      state.requestLocation = action.payload;
    },
    resetRequests: (state) => {
      Object.assign(state, initialState);
    },
    updateRequests: (state, action) => {
      state.requests = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setRescueRoute,
  setShopLocation,
  setRequestLocation,
  resetRequests,
  updateRequests,
} = productSlice.actions;
export const reducer = productSlice.reducer;
