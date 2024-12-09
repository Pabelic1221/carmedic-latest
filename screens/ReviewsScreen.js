import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons for stars
import AppBar from "./AppBar";
import { db } from "../firebase";

const ReviewsScreen = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      let q;

      if (currentUser?.role === "Shop") {
        q = query(
          collection(db, "reviews"),
          where("shopId", "==", currentUser.id)
        );
      } else {
        q = query(
          collection(db, "reviews"),
          where("userId", "==", currentUser.id)
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const reviewsWithNames = await Promise.all(
        fetchedReviews.map(async (review) => {
          let name = "Unknown";
          try {
            if (currentUser.role === "Shop") {
              const userDoc = await getDoc(doc(db, "users", review.userId));
              name = userDoc.exists()
                ? userDoc.data().firstName + " " + userDoc.data().lastName
                : "Anonymous User";
            } else {
              const shopDoc = await getDoc(doc(db, "shops", review.shopId));
              name = shopDoc.exists()
                ? shopDoc.data().shopName
                : "Unknown Shop";
            }
          } catch (error) {
            console.error("Error fetching name:", error);
          }
          return { ...review, name };
        })
      );

      setReviews(reviewsWithNames);
    };

    fetchReviews();
  }, [currentUser]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color="#FFD700" // Gold color for filled stars
        />
      );
    }
    return stars;
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewerName}>{item.name}</Text>
      <View style={styles.starsContainer}>{renderStars(item.rating)}</View>
      <Text style={styles.reviewText}>{item.reviewText}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.content}>
        <Text style={styles.header}>
          {currentUser?.role === "Shop"
            ? "Your Shop Reviews"
            : "Reviews You Sent"}
        </Text>
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No reviews found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  reviewItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  reviewText: {
    fontSize: 14,
    color: "#555",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});
