import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { actions } from "./shops";

export const getAllShops = () => {
  return async (dispatch) => {
    try {
      const shopsCollectionRef = collection(db, "shops");
      const querySnapshot = await getDocs(shopsCollectionRef);

      // Fetch all shops with review details
      const shops = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const shopData = doc.data();
          const shopId = doc.id;

          // Fetch reviews for this shop
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("shopId", "==", shopId)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);

          // Calculate the average rating and count of reviews
          let totalRating = 0;
          const reviewCount = reviewsSnapshot.size;

          reviewsSnapshot.forEach((reviewDoc) => {
            const reviewData = reviewDoc.data();
            totalRating += reviewData.rating;
          });

          const averageRating =
            reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

          return {
            id: shopId,
            ...shopData,
            averageRating: parseFloat(averageRating),
            reviewCount,
          };
        })
      );

      // Dispatch the shops with rating data to the Redux store
      dispatch(actions.setShops(shops));
    } catch (error) {
      console.error("Error fetching shops: ", error);
    }
  };
};
