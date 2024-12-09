import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Import Expo Image Picker
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Assume Firebase is properly initialized
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { uploadImageToCloudinary } from "../helpers/cloudinary";

const UserRegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const handleProfileImageUpload = async () => {
    try {
      // Request permission to access the gallery
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "You need to grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;

        const profilePicUrl = await uploadImageToCloudinary(localUri);
        setProfilePicUrl(profilePicUrl || "");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "An error occurred while uploading the image.");
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        address,
        role: "User",
        profilePicUrl, // Save the uploaded image URL
      });
      Alert.alert(
        "Registration Successful",
        "Verification email sent! Please verify your account before logging in.",
        [{ text: "OK", onPress: () => navigation.replace("Login") }]
      );
    } catch (error) {
      console.error("Error during sign-up: ", error);
      Alert.alert("Error", error.message);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Register User</Text>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleProfileImageUpload}>
            {profilePicUrl ? (
              <Image
                source={{ uri: profilePicUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="person-circle-outline" size={100} color="#ccc" />
            )}
          </TouchableOpacity>
          <Text style={styles.avatarText}>Tap to upload profile image</Text>
        </View>

        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleSignUp}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.signInText}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#f8f8f8",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  registerButton: {
    height: 50,
    backgroundColor: "#000",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  signInText: {
    color: "#777",
    textAlign: "center",
  },
});
