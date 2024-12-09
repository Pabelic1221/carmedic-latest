import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase"; // Ensure you're importing properly

export const fetchAllRequests = createAsyncThunk(
  "requests/fetchAllRequests",
  async (_, { rejectWithValue }) => {
    try {
      const currentUserId = auth.currentUser.uid; // Get the current user's ID
      console.log("currentUser", currentUserId);

      const requestsCollectionRef = collection(db, "requests");
      const requestsQuery = query(
        requestsCollectionRef,
        where("state", "in", ["pending", "accepted"]),
        where("storeId", "==", currentUserId)
      );

      const querySnapshot = await getDocs(requestsQuery);

      const requests = await Promise.all(
        querySnapshot.docs.map(async (document) => {
          const request = { id: document.id, ...document.data() };

          // Fetch user info
          const userDocRef = doc(db, "users", request.userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const { firstName, lastName, profilePicUrl } = userDoc.data();
            return {
              ...request,
              firstName,
              lastName,
              profilePicUrl: profilePicUrl || "",
            };
          }

          return request;
        })
      );

      console.log("Filtered requests with user info: ", requests);
      return requests; // Return filtered requests as payload
    } catch (error) {
      console.error("Error fetching requests: ", error);
      return rejectWithValue("Failed to fetch requests");
    }
  }
);
