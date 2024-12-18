import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { auth, db } from "../../firebase"; // Ensure Firebase is properly initialized
import { collection, addDoc } from "firebase/firestore";

const RequestForm = ({ visible, onClose, shopId, latitude, longitude }) => {
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [description, setDescription] = useState("");
  const [specificProblem, setSpecificProblem] = useState("");
  const [state] = useState("pending"); // Default state
  const [userId] = useState(auth.currentUser  ?.uid); // Get the current user's ID

  // Log latitude and longitude when the component mounts or when props change
  useEffect(() => {
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
  }, [latitude, longitude]);

  const handleSubmit = async () => {
    // Validate input fields
    if (!carBrand || !carModel || !description || !specificProblem) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    // Check if latitude and longitude are defined
    if (latitude === undefined || longitude === undefined) {
      Alert.alert("Error", "Location data is missing.");
      return;
    }

    try {
      const requestsRef = collection(db, "requests");
      await addDoc(requestsRef, {
        carBrand,
        carModel,
        description,
        specificProblem,
        state,
        latitude, // Use the passed latitude
        longitude, // Use the passed longitude
        storeId: shopId, // Pass the shop ID
        timestamp: new Date().toISOString(),
        userId, // Pass the user ID
      });

      Alert.alert("Request Submitted", "Your request has been submitted successfully!");
      onClose(); // Close the modal after submission
    } catch (error) {
      Alert.alert("Submission Error", error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Request Service</Text>

          <Text style={styles.label}>Car Brand</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter car brand"
            value={carBrand}
            onChangeText={setCarBrand}
          />

          <Text style={styles.label}>Car Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter car model"
            value={carModel}
            onChangeText={setCarModel}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Specific Problem</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the specific problem"
            value={specificProblem}
            onChangeText={setSpecificProblem}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
    backgroundColor : "#fff",
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default RequestForm;