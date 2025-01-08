import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase"; // Ensure you have db imported
import { signOut } from "firebase/auth";
import { resetUser } from "../redux/user/user";
import { resetRequests } from "../redux/requests/requests";
import { actions as userLocationActions } from "../redux/map/userLocation";
import { resetShops, actions as shopsActions } from "../redux/shops/shops";

import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";

const DrawerContent = memo((props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { currentUser, status } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState();
  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status]);
  if (isLoading && !currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </View>
    );
  }
  const handleSignOut = () => {
    // Show confirmation alert
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel", // Cancel button
        },
        {
          text: "Logout",
          style: "destructive", // Destructive action (red text on iOS)
          onPress: () => {
            // Perform logout if user confirms
            signOut(auth)
              .then(() => {
                console.log("User signed out successfully.");
                dispatch(resetUser());
                dispatch(resetRequests());
                dispatch(userLocationActions.resetLocation());
                dispatch(resetShops());
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }], // Ensure this matches your login screen name
                });
              })
              .catch((error) => {
                console.error("Sign out error:", error);
                alert(error.message);
              });
          },
        },
      ],
      { cancelable: true } // Allow dismissing the alert by tapping outside
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userInfo}>
        <Image
          source={{
            uri:
              currentUser.profilePicUrl && currentUser.profilePicUrl !== ""
                ? currentUser.profilePicUrl
                : "https://via.placeholder.com/80",
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.userInfoButton} // Changed to userInfoButton style
          onPress={() => navigation.navigate("UserProfile")}
        >
          {/* Display both first name and last name in one button */}
          <Text style={styles.userName}>
            {currentUser.firstName} {currentUser.lastName}{" "}
            {/* Concatenate first and last name */}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.drawerItemsContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Request")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Auto Repair Shops")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Auto Repair Shops</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("UserRequestLog")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Request History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat List")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Feedback")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Reviews")}
          style={styles.drawerItem}
        >
          <Text style={styles.drawerItemText}>Reviews</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  userInfo: {
    marginBottom: 20,
    alignItems: "center",
  },
  profileImage: {
    marginTop: 30,
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    color: "#000000",
  },
  userInfoButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  drawerItemsContainer: {
    flex: 0,
    justifyContent: "center",
    marginHorizontal: 20
  },
  drawerItem: {
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  drawerItemText: {
    fontSize: 15,
    color: "#808080",
    textAlign: "left",
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
    margin: 100,
    alignSelf: "center",
    width: "80%",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default DrawerContent;
