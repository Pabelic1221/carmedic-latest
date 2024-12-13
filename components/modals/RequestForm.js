import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { auth, db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

export default function RequestForm({ visible, shop, onClose }) {
  const [problem, setProblem] = useState("");
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [description, setDescription] = useState("");
  const { longitude, latitude } = useSelector(
    (state) => state.userLocation.currentLocation
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Set true if user exists, otherwise false
      setIsLoading(false); // Authentication state determined
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleSubmit = async () => {
    const userId = auth.currentUser ?.uid;
  
    if (!userId) {
      Alert.alert("Authentication Required", "Please log in to submit a request.");
      return;
    }
  
    // Input validation
    if (!problem || !carBrand || !carModel || !description) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
  
    setIsLoading(true); // Start loading
  
    try {
      const requestsRef = collection(db, "requests");
  
      await addDoc(requestsRef, {
        userId,
        storeId: shop.id,
        specificProblem: problem,
        carBrand,
        carModel,
        description,
        state: "pending",
        longitude,
        latitude,
        timestamp: new Date().toISOString(),
      });
  
      Alert.alert("Request Submitted", "Your request has been submitted successfully!");
      onClose();
    } catch (error) {
      Alert.alert("Submission Error", error.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Please log in to submit a request.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={35} color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={35} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Request</Text>

          <Text style={styles.label}>Select Service Request</Text>
          <RNPickerSelect
            onValueChange={(value) => setProblem(value)}
            items={shop.specialties.map((specialty) => ({
              label: specialty,
              value: specialty,
            }))}
            style={pickerSelectStyles}
            placeholder={{ label: "Select", value: null }}
          />

          <Text style={styles.label}>Type of Car</Text>
          <TextInput
            style={styles.input}
            placeholder="Car Brand"
            value={carBrand}
            onChangeText={setCarBrand}
          />
          <TextInput
            style={styles.input}
            placeholder="Car Model"
            value={carModel}
            onChangeText={setCarModel}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please Add Description..."
            value={description}
            onChangeText={setDescription}
            multiline={true}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#000",
  },
  inputAndroid: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#000",
  },
});
