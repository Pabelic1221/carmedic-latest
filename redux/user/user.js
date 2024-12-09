import { createSlice } from "@reduxjs/toolkit";
import { fetchCurrentUser, updateUserStatus } from "./userActions";

const initialState = {
  currentUser: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUser: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle updateUserStatus
      .addCase(updateUserStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.currentUser?.id === action.payload.userId) {
          state.currentUser.status = action.payload.status;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetUser } = userSlice.actions;
export const reducer = userSlice.reducer;
