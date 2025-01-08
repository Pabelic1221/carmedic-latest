import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Picker } from '@react-native-picker/picker'; // Import the Picker
import MapView, { Marker } from "react-native-maps"; // Import MapView and Marker
import * as Location from "expo-location"; // For getting current location
import { auth, db } from "../../firebase"; // Ensure Firebase is properly initialized
import { collection, addDoc } from "firebase/firestore";

const RequestForm = ({ visible, onClose, shopId, specialties, userAddress }) => {
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(""); // State for selected specialty
  const [state] = useState("pending"); // Default state
  const [userId] = useState(auth.currentUser ?.uid);
  const [userAddressState, setUserAddress] = useState(userAddress || ""); // Initialize to userAddress or empty string
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 37.78825, // Default latitude
    longitude: -122.4324, // Default longitude
  });
  const [locationMethod, setLocationMethod] = useState("currentLocation"); // "currentLocation" or "manualPinning"

  // Get current location when "Current Location" is selected
  useEffect(() => {
    if (locationMethod === "currentLocation") {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Please enable location permissions to use this feature.");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      })();
    }
  }, [locationMethod]);

  // Handle map press to update the selected location
  const handleMapPress = (event) => {
    if (locationMethod === "manualPinning") {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setSelectedLocation({ latitude, longitude });
    }
  };

  const handleSubmit = async () => {
    console.log("Car Brand:", carBrand);
    console.log("Car Model:", carModel);
    console.log("Description:", description);
    console.log("Specific Problem:", selectedSpecialty);
    console.log("User Address:", userAddressState);
    console.log("Selected Location:", selectedLocation);

    // Validate input fields
    if (!carBrand || !carModel || !description || !selectedSpecialty || !userAddressState) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    try {
      const requestsRef = collection(db, "requests");
      await addDoc(requestsRef, {
        carBrand,
        carModel,
        description,
        selectedSpecialty, // Include the selected specialty
        state,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        storeId: shopId,
        timestamp: new Date().toISOString(),
        address: userAddressState, // Use the user address here
        userId,
      });

      Alert.alert("Request Submitted", "Your request has been submitted successfully!");
      onClose(); // Close the modal after submission
    } catch (error) {
      Alert.alert("Submission Error", error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
 <Text style={styles.title}>Request Service</Text>

              <Text style={styles.label}>Vehicle Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter vehicle brand"
                value={carBrand}
                onChangeText={setCarBrand}
              />

              <Text style={styles.label}>Vehicle Model</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter vehicle model"
                value={carModel}
                onChangeText={setCarModel}
              />

              <Text style={[styles.label, styles.textArea]}>Additional Details</Text>
              <TextInput
                style={styles.input}
                placeholder="ex. My car won't start."
                value={description}
                onChangeText={setDescription}
                multiline={true}
              />

              <Text style={styles.label}>Select Specialty</Text>
              <Picker
                selectedValue={selectedSpecialty}
                onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select a specialty" value="" />
                {specialties.map((specialty, index) => (
                  <Picker.Item key={index} label={specialty} value={specialty} />
                ))}
              </Picker>

              <Text style={styles.label}>Select Location Method</Text>
              <Picker
                selectedValue={locationMethod}
                onValueChange={(itemValue) => setLocationMethod(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Current Location" value="currentLocation" />
                <Picker.Item label="Manual Map Pinning" value="manualPinning" />
              </Picker>

              {locationMethod === "manualPinning" && (
                <>
                  <Text style={styles.label}>Select Location</Text>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    }}
                    onPress={handleMapPress}
                  >
                    <Marker coordinate={selectedLocation} />
                  </MapView>
                </>
              )}

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 20,
  },
  map: {
    height: 200,
    width: "100%",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default RequestForm