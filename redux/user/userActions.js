import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { getAuth, signOut } from "firebase/auth";

// Fetch the current user
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("No user is authenticated");
        return rejectWithValue("No user is authenticated");
      }

      let userDocRef = doc(db, "users", currentUser.uid);
      let userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        return { id: userSnapshot.id, ...userSnapshot.data() };
      } else {
        userDocRef = doc(db, "shops", currentUser.uid);
        userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          return { id: userSnapshot.id, ...userSnapshot.data() };
        } else {
          console.log("No such user document!");
          signOut(auth);
          return rejectWithValue("No user document found");
        }
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      return rejectWithValue(error.message);
    }
  }
);

// Update user status
export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      let userDocRef = doc(db, "users", userId);
      let userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        await updateDoc(userDocRef, { status });
        console.log("User status updated in 'users' collection");
        return { userId, status };
      } else {
        userDocRef = doc(db, "shops", userId);
        const shopSnapshot = await getDoc(userDocRef);

        if (shopSnapshot.exists()) {
          await updateDoc(userDocRef, { status });
          console.log("User status updated in 'shops' collection");
          return { userId, status };
        } else {
          console.log("No such user or shop document!");
          return rejectWithValue("No such user or shop document");
        }
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      return rejectWithValue(error.message);
    }
  }
);
