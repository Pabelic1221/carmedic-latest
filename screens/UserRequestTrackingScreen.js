import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSelector } from "react-redux";
import { db } from "../firebase"; // Assuming Firebase is used for data storage
import { doc, onSnapshot } from "firebase/firestore";

const UserRequestTrackingScreen = ({ route }) => {
  const { request } = route.params; // Get the request details passed from the previous screen
  const userLocation = useSelector((state) => state.userLocation.currentLocation);
  const [shopLocation, setShopLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "shopOnRescue", request.id), (doc) => {
      if (doc.exists()) {
        setShopLocation(doc.data());
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [request.id]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {shopLocation && (
          <Polyline
            coordinates={[
              userLocation,
              { latitude: shopLocation.latitude, longitude: shopLocation.longitude },
            ]}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
      <Text style={styles.requestDetails}>
        Request ID: {request.id} - Status: {request.state}
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
});

export default UserRequestTrackingScreen;