import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function RequestTicket({ request, onClose, onAcceptRequest }) {
  const [loading, setLoading] = useState(false);

  // Accept request and call the passed function to fetch the route
  const handleAcceptRequest = async () => {
    setLoading(true);
    try {
      const requestDocRef = doc(db, "requests", request.id);
      await updateDoc(requestDocRef, { state: "accepted" });
      console.log("Request accepted");

      // Call the function to fetch route coordinates
      onAcceptRequest(request); // Pass the request to the parent function
      onClose(); // Close the modal
    } catch (error) {
      console.error(`Error accepting request: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Decline the request
  const handleDeclineRequest = async () => {
    setLoading(true);
    try {
      const requestDocRef = doc(db, "requests", request.id);
      await updateDoc(requestDocRef, { state: "declined" });
      onClose();
    } catch (error) {
      console.error(`Error declining request: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // End the session
  const handleEndSession = async () => {
    setLoading(true);
    try {
      const requestDocRef = doc(db, "requests", request.id);
      await updateDoc(requestDocRef, { state: "ended" });
      console.log("Session ended");
      onClose();
    } catch (error) {
      console.error(`Error ending session: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.modalHeader}>Request Ticket</Text>
          <Text style={styles.label}>
            Name: {request.firstname} {request.lastname}
          </Text>
          <Text style={styles.label}>
            Car: {request.carBrand} {request.carModel}
          </Text>
          <Text style={styles.label}>Concern: {request.specificProblem}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptRequest}
              disabled={loading}
            >
              <Text style={styles.acceptButtonText}>Accept Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={handleDeclineRequest}
              disabled={loading}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "green",
    paddingVertical: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "red",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  declineButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
