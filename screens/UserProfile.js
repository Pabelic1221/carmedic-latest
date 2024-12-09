import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase";
import { useDispatch, useSelector } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import AppBar from "./AppBar"; // Import your AppBar component
import { uploadImageToCloudinary } from "../helpers/cloudinary";
import * as ImagePicker from "expo-image-picker";
import { fetchCurrentUser } from "../redux/user/userActions";
import { ActivityIndicator } from "react-native-paper";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isEdited, setIsEdited] = useState(false); // State to track if fields are edited
  const { currentUser, status } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    // Load current user data if available
    if (currentUser) {
      setProfileImage(currentUser.profilePicUrl || null);
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setContact(currentUser.contact || "");
      setAddress(currentUser.address || "");
    }
  }, [currentUser]);

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.didCancel && !result.error) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      setIsEdited(true); // Mark as edited
    }
  };

  const handleUpdateProfile = async () => {
    console.log("running");
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    try {
      let profilePicUrl;
      if (profileImage) {
        profilePicUrl = await uploadImageToCloudinary(profileImage);
      }

      await updateDoc(userDocRef, {
        firstName,
        lastName,
        contact,
        address,
        profilePicUrl: profilePicUrl || "",
      });
      Alert.alert("Success", "Profile updated successfully.");

      setIsEdited(false); // Reset edited state after saving
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      dispatch(fetchCurrentUser());
    }
  };

  // Function to handle input changes and set edited state
  const handleInputChange = (setter) => (value) => {
    setter(value);
    setIsEdited(true); // Mark as edited
  };
  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Include the AppBar at the top */}
      <AppBar />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleImageUpload}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.placeholderText}>
            Profile Picture: Tap to change
          </Text>
        </View>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={handleInputChange(setFirstName)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={handleInputChange(setLastName)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact"
          value={contact}
          onChangeText={handleInputChange(setContact)}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={handleInputChange(setAddress)}
        />
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={handleInputChange(setCurrentPassword)}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={handleInputChange(setNewPassword)}
        />

        {/* Conditionally render the Save Button */}
        {isEdited && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateProfile}
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
        )}

        {/* Navigate to User Request Log Button */}
        <TouchableOpacity
          style={styles.requestLogButton}
          onPress={() => navigation.navigate("UserRequestLog")}
        >
          <Text style={styles.buttonText}>View Request Log</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: "#888",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  requestLogButton: {
    backgroundColor: "#28A745",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserProfile;
