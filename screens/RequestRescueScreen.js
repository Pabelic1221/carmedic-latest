import React, { useEffect, useState, useRef, useMemo } from "react";
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
  console.log("User  Location:", userLocation);

  useEffect(() => {
    setLoading(loading);
  }, [loading]);

  useEffect(() => {
    dispatch(fetchAllShops());
  }, [dispatch]);

  const fitAllMarkers = () => {
    if (filteredShops.length > 0 && mapRef.current) {
      const coordinates = filteredShops.map((shop) => ({
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
    <TouchableOpacity
      style={styles.shopItem}
      onPress={() => {
        navigation.navigate("Auto Repair Shop", { item });
      }}
    >
      <View style={styles.shopInfo}>
        {/* Shop Image */}
        <Image
          source={{
            uri: item.profilePicUrl
              ? item.profilePicUrl
              : "https://via.placeholder.com/50",
          }}
          style={styles.shopImage}
        />

        {/* Shop Details */}
        <View style={styles.shopDetails}>
          {/* Shop Name */}
          <Text style={styles.shopName}>
            {item.shopName}
          </Text>

          {/* Shop Address */}
          <Text style={styles.shopAddress} numberOfLines={2} ellipsizeMode="tail">
            {item.address}
          </Text>

          {/* Rating and Reviews */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.shopRating}>
              {item.averageRating?.toFixed(1) || "0.0"} ({item.reviewCount || 0}{" "}
              {item.reviewCount <= 1 ? "review" : "reviews"})
            </Text>
          </View>

          {/* Distance Text with Conditional Color */}
          <Text
            style={[
              styles.distanceText,
              item.distance < 10 ? styles.distanceGreen : styles.distanceRed,
            ]}
          >
            {item.distance.toFixed(2)} km away
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
        showsUser Location={true}
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
              pinColor="yellow" // Only yellow pins for shops with selected specialty
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

  const filteredShops = useMemo(() => {
    return shops
      .filter((shop) => 
        selectedSpecialty ? shop.specialties?.includes(selectedSpecialty) : true
      )
      .map((shop) => ({
        ...shop,
        distance: getDistance(userLocation, shop),
      }))
      .filter((shop) => shop.distance <= 10) // Filter shops within 10 km
      .sort((a, b) => a.distance - b.distance);
  }, [shops, userLocation, selectedSpecialty]);

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedSpecialty}
          onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
          style={styles.picker}
          itemStyle={{ fontSize: 10 }}
        >
          <Picker.Item label="Select Specialty" value="" labelStyle={{ fontSize: 12 }}/>
          <Picker.Item label="Oil Change and Filter Replacement" value="Oil Change and Filter Replacement" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Computerized Engine Diagnostics" value="Computerized Engine Diagnostics" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Brake Pad and Rotor Replacement" value="Brake Pad and Rotor Replacement" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Tire Repair and Vulcanizing" value="Tire Repair and Vulcanizing" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Timing Belt or Chain Replacement" value="Timing Belt or Chain Replacement" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Radiator Flush and Coolant Replacement" value="Radiator Flush and Coolant Replacement" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Shock Absorber and Strut Replacement" value="Shock Absorber and Strut Replacement" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Transmission Fluid Service" value="Transmission Fluid Service" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="AC Recharge and Compressor Repair" value="AC Recharge and Compressor Repair" labelStyle={{ fontSize: 10 }}/>
          <Picker.Item label="Battery Testing and Replacement" value="Battery Testing and Replacement" labelStyle={{ fontSize: 10 }}/>
        </Picker>
      </View>
      {renderMapView()}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'yellow' }]} />
          <Text style={styles.legendText}>Shops with Selected Specialty</Text>
        </View>
      </View>
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
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
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
    marginTop: 5,
    flexShrink: 1,
    numberOfLines: 2,
    ellipsizeMode: "tail",
  },
  shopDetails: {
    flex: 1,
    flexShrink: 1,
    marginRight: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopRating: {
    marginLeft: 5,
    fontSize: 14,
    color: "#777",
  },
  distanceText: {
    fontSize: 14,
  },
  distanceGreen: {
    color: "green", 
  },
  distanceRed: {
    color: "red",
  },
  shopList: {
    margin: 15,
    marginTop: 10,
  },
  map: {
    alignSelf: "center",
    width: "90%",
    height: 350,
    margin: 15,
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
    padding: 5,
    backgroundColor: "#fff",
    marginHorizontal: "5%",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "90%",
    alignSelf: "center",
    fontSize: 5,
  },
  picker: {
    height: 50, 
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 5, 
  },
  legendContainer: {
    padding: 10,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: {
    fontSize: 15,
    color: "#777",
  },
});

export default RequestRescueScreen;