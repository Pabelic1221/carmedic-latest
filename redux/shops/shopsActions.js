import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { actions } from "./shops";

// Function to fetch all shops along with reviews, average rating, and shop locations
export const getAllShops = () => {
  return async (dispatch) => {
    try {
      const shopsCollectionRef = collection(db, "shops");
      const querySnapshot = await getDocs(shopsCollectionRef);

      // Fetch all shops with review details and location
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

          // Fetch the shop location data (assuming location fields are lat and lng)
          const location = shopData.location || {}; // Assuming location is stored like { lat: 0, lng: 0 }

          return {
            id: shopId,
            ...shopData,
            averageRating: parseFloat(averageRating),
            reviewCount,
            location, // Adding location data to the returned shop object
          };
        })
      );

      // Dispatch the shops with rating and location data to the Redux store
      dispatch(actions.setShops(shops));

      // Assuming that you want to add the map-related logic here
      // If you are using a map component to render these locations, you can dispatch the locations too

      const shopLocations = shops.map((shop) => shop.location);

      // Dispatch the locations for the map rendering (optional)
      dispatch(actions.setShopLocations(shopLocations)); // Create an action to store shop locations in Redux if needed

    } catch (error) {
      console.error("Error fetching shops: ", error);
    }
  };
};
