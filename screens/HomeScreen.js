import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppBar from "./AppBar"; // Import AppBar component
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { getAllShops } from "../redux/shops/shopsActions";
import { fetchAllShops } from "../redux/shops/shopsThunk";
const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch(); // Initialize navigation
  useEffect(() => {
    dispatch(fetchAllShops());
  }, [dispatch]);
  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/AutoRepairTransparent.png")}
            style={styles.image}
          />
        </View>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate("Request")} // Navigate to RequestScreen
          >
            <Text style={styles.gridTitle}>Request</Text>
            <Text style={styles.gridSubtitle}>Request a Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate("Auto Repair Shops")} // Navigate to AutoRepairShopScreen
          >
            <Text style={styles.gridTitle}>Auto Repair Shops</Text>
            <Text style={styles.gridSubtitle}>
              Browse and compare repair shops
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate("Reviews")} // Navigate to ReviewsScreen
          >
            <Text style={styles.gridTitle}>Reviews</Text>
            <Text style={styles.gridSubtitle}>Read and Write reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate("Feedback")} // Navigate to FeedbackScreen
          >
            <Text style={styles.gridTitle}>Feedback</Text>
            <Text style={styles.gridSubtitle}>
              Submit feedback about the app
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 320, // Increased the size of the container
    height: 200, // Increased the size of the container
    borderRadius: 15, // Rounded corners for the box-like container
    overflow: "hidden", // Ensures the image stays within the container's border radius
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Optional: background color for the container
    marginBottom: 20, // Spacing below the image container
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 5, // Blur radius for the shadow
    elevation: 5, // Elevation for Android shadow
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Keeps the aspect ratio of the image
  },
  grid: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  gridItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "45%",
    marginVertical: 10,
    elevation: 2,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  gridSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});

export default HomeScreen;
