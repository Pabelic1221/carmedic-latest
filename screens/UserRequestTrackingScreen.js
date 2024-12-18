import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSelector } from "react-redux";
import { db } from "../firebase"; // Assuming Firebase is used for data storage
import { doc, onSnapshot } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons for the back button
import axios from "axios"; // Import axios for fetching route data

const UserRequestTrackingScreen = ({ route, navigation }) => {
  const { request } = route.params; // Get the request details passed from the previous screen
  const userLocation = useSelector((state) => state.userLocation.currentLocation);
  const [shopLocation, setShopLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]); // State for route coordinates

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "shopOnRescue", request.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setShopLocation(data);
        fetchRoute(userLocation, data); // Fetch the route when shop location is available
        setIsLoading(false);
      } else {
        // Handle the case where the document does not exist
        setIsLoading(false);
        Alert.alert("Error", "Shop location not found.");
      }
    }, (error) => {
      // Handle errors in fetching data
      setIsLoading(false);
      Alert.alert("Error", "Failed to fetch shop location.");
    });
  
    return () => unsubscribe();
  }, [request.id, userLocation]);

  const fetchRoute = async (startCoords, endCoords) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson`;
    try {
      const response = await axios.get(url);
      const route = response.data.routes[0].geometry.coordinates.map(
        ([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        })
      );
      setRouteCoordinates(route);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Your Location" pinColor="purple" />
        )}
        {shopLocation && (
          <Marker
            coordinate={{
              latitude: shopLocation.latitude,
              longitude: shopLocation.longitude,
            }}
            title="Shop Location"
            pinColor="blue"
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
      <Text style={styles.requestDetails}>
       Request ID: {request.id} - <Text style={styles.boldText}>{request.state}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  requestDetails: {
    padding: 10,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    elevation: 5,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "white ",
    borderRadius: 20,
    padding: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default UserRequestTrackingScreen;