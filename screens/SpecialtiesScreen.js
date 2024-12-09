import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore initialization
import { uploadImageToCloudinary } from "../helpers/cloudinary"; // Cloudinary helper
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase"; // Ensure auth is properly initialized

const predefinedSpecialties = [
  "Towing",
  "Jump Start",
  "Battery Delivery",
  "Flat Tire",
  "Fuel",
  "Overheating",
  "Brake Problem",
  "Lockout",
  "Change Oil",
  "Vehicle Maintenance",
];

const SpecialtiesScreen = ({ navigation, route }) => {
  const { shopData } = route.params;
  const [selectedSpecialties, setSelectedSpecialties] = useState({});
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [customSpecialties, setCustomSpecialties] = useState([]);

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties((prev) => ({
      ...prev,
      [specialty]: !prev[specialty],
    }));
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      setCustomSpecialties((prev) => [...prev, customSpecialty]);
      setCustomSpecialty("");
    }
  };

  const handleRegister = async () => {
    try {
      // Create a new user with email and password
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        shopData.email,
        shopData.password
      );

      delete shopData.password;
      const user = userCredentials.user;
      await sendEmailVerification(user);
      const specialties = [
        ...Object.keys(selectedSpecialties).filter(
          (key) => selectedSpecialties[key]
        ),
        ...customSpecialties,
      ];

      // Upload images to Cloudinary
      const profilePicUrl = await uploadImageToCloudinary(
        shopData.profilePicUri
      );
      const ownerIdPicUrl = await uploadImageToCloudinary(
        shopData.ownerIdPicUri
      );
      delete shopData.profilePicUri;
      delete shopData.ownerIdPicUri;

      const finalPayload = {
        ...shopData,
        profilePicUrl,
        ownerIdPicUrl,
        specialties,
      };

      // Save the shop data to Firestore
      await setDoc(doc(db, "shops", user.uid), finalPayload);

      Alert.alert("Success", "Shop registered successfully!", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Specialties</Text>
      {predefinedSpecialties.map((specialty) => (
        <View key={specialty} style={styles.specialtyRow}>
          <Text>{specialty}</Text>
          <Switch
            value={selectedSpecialties[specialty] || false}
            onValueChange={() => toggleSpecialty(specialty)}
          />
        </View>
      ))}
      <TextInput
        style={styles.input}
        value={customSpecialty}
        onChangeText={setCustomSpecialty}
        placeholder="Add custom specialty"
      />
      <TouchableOpacity style={styles.addButton} onPress={addCustomSpecialty}>
        <Text style={styles.addButtonText}>Add Specialty</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SpecialtiesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  specialtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
  },
  registerButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
