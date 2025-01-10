import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function EndTicket({ request, onClose, navigation }) {
  const [loading, setLoading] = useState(false);

  // Accept the request and update its state in Firestore
  const handleRequest = async (state) => {
    setLoading(true);
    try {
      const requestDocRef = doc(db, "requests", request.id);
      await updateDoc(requestDocRef, {
        state,
      });
      console.log("Request updated");
      Alert.alert("Success", "The ticket session has been ended.");
      onClose(); // Close the modal
      navigation.goBack(); // Navigate back to the previous screen (OngoingRescueScreen)
    } catch (error) {
      console.error("Error updating request: ", error);
      Alert.alert("Error", "Failed to update the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>
      {/* Modal Header */}
      <Text style={styles.modalHeader}>End Ticket Session</Text>
      <Text style={styles.message}>
        Are you sure you want to end this ticket's session?
      </Text>
      {/* Accept and Decline Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleRequest("ended")}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    width: "85%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1, // Add this line
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "green",
  },
  declineButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
