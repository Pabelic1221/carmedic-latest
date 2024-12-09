import {
  getDocs,
  collection,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { actions } from "./requests";
import { auth } from "../../firebase"; // Ensure you're importing auth properly

export const getAllRequests = () => {
  return async (dispatch) => {
    try {
      const currentUserId = auth.currentUser.uid; // Get the current user's ID
      console.log("currentUser", auth.currentUser.uid);
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
      dispatch(actions.setRequests(requests)); // Dispatch filtered requests
    } catch (error) {
      console.error("Error fetching requests: ", error);
    }
  };
};
