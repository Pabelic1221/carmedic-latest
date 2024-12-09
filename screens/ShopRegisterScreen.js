import React, { useState } from "react";
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
} from "react-native";
import { MapComponent } from "../components/map/MapComponent";
import Icon from "react-native-vector-icons/Ionicons";
import { Marker } from "react-native-maps";
import { getAddressFromCoordinates } from "../helpers/maps/getAddress";
import * as ImagePicker from "expo-image-picker";
import { Entypo } from 'react-native-vector-icons';

const ShopRegisterScreen = ({ navigation }) => {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [markerLocation, setMarkerLocation] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [ownerIdPic, setOwnerIdPic] = useState(null);

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setMarkerLocation(coordinate);

    const addr = await getAddressFromCoordinates(
      coordinate.latitude,
      coordinate.longitude
    );
    setAddress(addr);
  };

  const pickImage = async (setImage) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (
      !shopName ||
      !email ||
      !password ||
      !confirmPassword ||
      !profilePic ||
      !ownerIdPic
    ) {
      Alert.alert(
        "Error",
        "Please fill all the fields and upload the required images."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const payload = {
      shopName,
      email,
      address,
      password,
      latitude: markerLocation?.latitude || null,
      longitude: markerLocation?.longitude || null,
      profilePicUri: profilePic,
      ownerIdPicUri: ownerIdPic,
      role: "Shop",
    };

    navigation.navigate("Specialties", { shopData: payload });
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Register Auto Repair Shop</Text>
        </View>

        <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Shop Name"
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
          <MapComponent onPress={handleMapPress}>
            {markerLocation && (
              <Marker
                coordinate={markerLocation}
                title="Selected Auto Repair Shop Location"
                pinColor="red"
              />
            )}
          </MapComponent>

          <TouchableOpacity
            style={styles.imagePicker}
            onPress={() => pickImage(setProfilePic)}
          >
            <Text>Select Profile Picture</Text>
            {profilePic && (
              <Image source={{ uri: profilePic }} style={styles.image} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imagePicker}
            onPress={() => pickImage(setOwnerIdPic)}
          >
            <Text>Select Owner ID Picture</Text>
            {ownerIdPic && (
              <Image source={{ uri: ownerIdPic }} style={styles.image} />
            )}
          </TouchableOpacity>

          <View style={styles.passwordContainer}>
               <TextInput placeholder="Password" value={password}
                 onChangeText={(text) => setPassword(text)}
                 style={styles.input}
                 secureTextEntry={!showPassword} // Toggle secureTextEntry based on state
               />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
                  <Entypo name={showPassword ? "eye-with-line" : "eye"} size={24} color="black"/>
               </TouchableOpacity>
             </View>
             <View style={styles.passwordContainer}>
               <TextInput placeholder=" Confirm Password" value={confirmPassword}
                 onChangeText={(text) => setConfirmPassword(text)}
                 style={styles.input}
                 secureTextEntry={!showConfirmPassword} // Toggle secureTextEntry based on state
               />
                <TouchableOpacity onPress={() => setshowConfirmPassword(!showConfirmPassword)} style={styles.iconContainer}>
                  <Entypo name={showConfirmPassword ? "eye-with-line" : "eye"} size={24} color="black"/>
               </TouchableOpacity>
             </View>
        </View>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleNext}>
          <Text style={styles.registerButtonText}>Next</Text>
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

export default ShopRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  inputWrapper: {
    width: "100%",
  },
  inputContainer: {
    marginTop: 20,
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
    marginBottom: 10,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: 'absolute',
    top: 16,
    right: 12,
    opacity: .35,
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
  imagePicker: {
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#eee",
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});
