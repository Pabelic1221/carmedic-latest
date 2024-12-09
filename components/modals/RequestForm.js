import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import RNPickerSelect from "react-native-picker-select";
import { auth, db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useSelector } from "react-redux";

export default function RequestForm({ shop, onClose }) {
  const [problem, setProblem] = useState("");
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [description, setDescription] = useState("");
  const { longitude, latitude } = useSelector(
    (state) => state.userLocation.currentLocation
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check user authentication status on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // User is authenticated
      } else {
        console.error("User not authenticated");
        setIsAuthenticated(false); // User is not authenticated
      }
    });

    return () => unsubscribe(); // Clean up the auth listener
  }, []);

  const handleSubmit = async () => {
    const userId = auth.currentUser?.uid; // Ensure current user is available

    if (!userId) {
      Alert.alert("User is not authenticated. Please log in first.");
      return;
    }

    try {
      // Reference to the 'requests' collection
      const requestsRef = collection(db, "requests");

      // Add a new document with a generated ID
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

      Alert.alert("Request submitted successfully!");
      onClose();
    } catch (error) {
      Alert.alert("Error submitting request: ", error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to submit a request.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Request</Text>

      <Text style={styles.label}>Select Service Request</Text>
      <RNPickerSelect
        onValueChange={(value) => setProblem(value)}
        items={shop.specialties.map((specialties) => ({
          label: specialties,
          value: specialties,
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    marginTop: 50,
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
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#000",
  },
});
