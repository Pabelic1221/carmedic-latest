import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import AppBar from "./AppBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { fetchAllShops } from "../redux/shops/shopsThunk";

const RequestRescueScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const dispatch = useDispatch();

  const { shops, loading, error } = useSelector((state) => state.shops);
  const userLocation = useSelector(
    (state) => state.userLocation.currentLocation
  );
  console.log("User Location:", userLocation);

  useEffect(() => {
    setLoading(loading);
  }, [loading]);

  useEffect(() => {
    dispatch(fetchAllShops());
  }, [dispatch]);

  const fitAllMarkers = () => {
    if (shops.length > 0 && mapRef.current) {
      const coordinates = shops.map((shop) => ({
        latitude: shop.latitude,
        longitude: shop.longitude,
      }));
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleMarkerPress = (shop) => {
    const index = filteredShops.findIndex((s) => s.id === shop.id);
    if (flatListRef.current && index !== -1) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: shop.latitude,
          longitude: shop.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.shopItem}>
      <View style={styles.shopInfo}>
        <Image
          source={{
            uri: item.profilePicUrl
              ? item.profilePicUrl
              : "https://via.placeholder.com/50",
          }}
          style={styles.shopImage}
        />
        <View style={styles.shopDetails}>
          <Text style={styles.shopName}>{item.shopName}</Text>
          <Text style={styles.shopAddress}>{item.address}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.shopRating}>
              {item.averageRating?.toFixed(1) || "0.0"} ({item.reviewCount || 0}{" "}
              {item.reviewCount <= 1 ? "review" : "reviews"})
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => {
          navigation.navigate("Auto Repair Shop", { item });
        }}
      >
        <Ionicons name="arrow-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderMapView = () => {
    if (
      !userLocation ||
      !userLocation.latitude ||
      !userLocation.longitude ||
      isLoading
    ) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading map... Please ensure location services are enabled.
          </Text>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        loadingEnabled={true}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {filteredShops.map((shop) => {
          const { longitude, latitude } = shop;

          return (
            <Marker
              key={shop.id}
              coordinate={{ longitude, latitude }}
              title={shop.shopName}
              description={shop.address}
              pinColor={shop.hasSelectedSpecialty ? "yellow" : "purple"}
              onPress={() => handleMarkerPress(shop)}
            />
          );
        })}
      </MapView>
    );
  };

  const getDistance = (location1, location2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (location2.latitude - location1.latitude) * (Math.PI / 180);
    const dLon = (location2.longitude - location1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(location1.latitude * (Math.PI / 180)) * Math.cos(location2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const filteredShops = shops
    .map(shop => ({
      ...shop,
      distance: getDistance(userLocation, shop),
      hasSelectedSpecialty: selectedSpecialty ? shop.specialties.includes(selectedSpecialty) : true, // Include all shops for "All Specialties"
    }))
    .sort((a, b) => {
      if (a.hasSelectedSpecialty && !b.hasSelectedSpecialty) return -1;
      if (!a.hasSelectedSpecialty && b.hasSelectedSpecialty) return 1;
      return a.distance - b.distance;
    })
    .slice(0, 5); // Get top 5 shops

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedSpecialty}
          onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Specialties" value="" />
          <Picker.Item label="Oil Change and Filter Replacement" value="Oil Change and Filter Replacement" />
          <Picker.Item label="Computerized Engine Diagnostics" value="Computerized Engine Diagnostics" />
          <Picker.Item label="Brake Pad and Rotor Replacement" value="Brake Pad and Rotor Replacement" />
          <Picker.Item label="Tire Repair and Vulcanizing" value="Tire Repair and Vulcanizing" />
          <Picker.Item label="Timing Belt or Chain Replacement" value="Timing Belt or Chain Replacement" />
          <Picker.Item label="Radiator Flush and Coolant Replacement" value="Radiator Flush and Coolant Replacement" />
          <Picker.Item label="Shock Absorber and Strut Replacement" value="Shock Absorber and Strut Replacement" />
          <Picker.Item label="Transmission Fluid Service" value="Transmission Fluid Service" />
          <Picker.Item label="AC Recharge and Compressor Repair" value="AC Recharge and Compressor Repair" />
          <Picker.Item label="Battery Testing and Replacement" value="Battery Testing and Replacement" />
        </Picker>
      </View>
      {renderMapView()}
      <FlatList
        ref={flatListRef}
        style={styles.shopList}
        data={filteredShops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  shopItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  shopImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  shopAddress: {
    fontSize: 14,
    color: "#777",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  shopRating: {
    marginLeft: 5,
    fontSize: 14,
    color: "#777",
  },
  navigateButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    marginLeft: 40,
  },
  shopList: {
    margin: 15,
  },
  map: {
    alignSelf: "center",
    width: 300,
    height: 400,
    margin: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#777",
  },
  filterContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 10,
  },
});

export default RequestRescueScreen;