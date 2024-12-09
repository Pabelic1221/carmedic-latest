import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Firebase configuration

const ReviewModal = ({ visible, onClose, shopId }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleStarPress = (index) => {
    setRating(index + 1);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please provide a star rating before submitting."
      );
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to submit a review."
        );
        return;
      }

      // Add review to Firebase
      await addDoc(collection(db, "reviews"), {
        shopId: shopId,
        userId: userId,
        rating: rating,
        reviewText: reviewText,
        createdAt: new Date(),
      });

      // Reset the form and close modal
      setRating(0);
      setReviewText("");
      Alert.alert(
        "Review Submitted",
        "Your review has been successfully submitted."
      );
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Submission Error",
        "There was an error submitting your review. Please try again."
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rate and Review</Text>

          {/* Star Rating */}
          <View style={styles.starContainer}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleStarPress(index)}
              >
                <Ionicons
                  name={index < rating ? "star" : "star-outline"}
                  size={32}
                  color="#FFD700" // Gold color for stars
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Review Text Input */}
          <TextInput
            style={styles.reviewInput}
            placeholder="Write an optional review..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitReview}
          >
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  reviewInput: {
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#888",
  },
});

export default ReviewModal;
