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
import AppBar from "./AppBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { fetchAllShops } from "../redux/shops/shopsThunk";
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker'; // Updated import for Picker

const RequestRescueScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(true);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [locationMethod, setLocationMethod] = useState("currentLocation"); // New state for location method
  const [selectedLocation, setSelectedLocation] = useState(null); // New state for selected location
  const [currentUserLocation, setCurrentUserLocation] = useState(null); // New state for current user location
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

  const renderItem = ({ item }) => {
    const isTopShop = topShops.some((shop) => shop.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.shopItem, isTopShop && styles.topShopItem]}
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

        {/* Top Shop Badge */}
        {isTopShop && (
          <View style={styles.topShopBadge}>
            <Text style={styles.topShopBadgeText}>Top Shop</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMapView = () => {
    const currentLocation = locationMethod === "manualPinning" && selectedLocation ? selectedLocation : userLocation;

    if (
      !currentLocation ||
      !currentLocation.latitude ||
      !currentLocation.longitude ||
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
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        loadingEnabled={true}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={(e) => {
          if (locationMethod === "manualPinning") {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setSelectedLocation({ latitude, longitude });
            console.log("Red Pin Location - Latitude:", latitude, "Longitude:", longitude); // Log the red pin's location
            // Set the selected location as the current user location
            setCurrentUserLocation({ latitude, longitude });
          }
        }}
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

        {/* Render selected location marker if in manual pinning mode */}
        {locationMethod === "manualPinning" && selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            pinColor="red" // Color for the manually pinned location
          />
        )}
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

  const specialtyList = [
    'Oil Change and Filter Replacement',
    'Computerized Engine Diagnostics',
    'Brake Pad and Rotor Replacement',
    'Tire Repair and Vulcanizing',
    'Timing Belt or Chain Replacement',
    'Radiator Flush and Coolant Replacement',
    'Shock Absorber and Strut Replacement',
    'Transmission Fluid Service',
    'AC Recharge and Compressor Repair',
    'Battery Testing and Replacement',
  ];

  const handleSpecialtyPress = (specialty) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const filteredShops = useMemo(() => {
    const referenceLocation = locationMethod === "manualPinning" && selectedLocation ? selectedLocation : userLocation;

    return shops
      .filter((shop) => 
        selectedSpecialties.length > 0 
          ? selectedSpecialties.some(specialty => shop.specialties?.includes(specialty)) 
          : true
      )
      .map((shop) => ({
        ...shop,
        distance: getDistance(referenceLocation, shop),
      }))
      .filter((shop) => shop.distance <= 10) // Filter shops within 10 km
      .sort((a, b) => a.distance - b.distance);
  }, [shops, userLocation, selectedSpecialties, selectedLocation, locationMethod]);

  const topShops = useMemo(() => {
    return filteredShops
      .sort((a, b) => b.averageRating - a.averageRating) // Sort by highest rating
      .slice(0, 5); // Take the top 5
  }, [filteredShops]);

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={locationMethod}
          onValueChange={(itemValue) => setLocationMethod(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Current Location" value="currentLocation" />
          <Picker.Item label="Manual Map Pinning" value="manualPinning" />
        </Picker>
      </View>
      <TouchableOpacity
        style={styles.filterContainer}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.filterText}>
          {selectedSpecialties.length === 0
            ? "Select Specialties"
            : "${selectedSpecialties.length} Specialties selected"} 
        </Text>
      </TouchableOpacity>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {specialtyList.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                backgroundColor: selectedSpecialties.includes(specialty) ? '#4CAF50' : '#fff',
              }}
              onPress={() => handleSpecialtyPress(specialty)}
            >
              <Text style={{ fontSize: 16, color: selectedSpecialties.includes(specialty) ? '#fff' : '#333' }}>
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
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
  topShopItem: {
    borderColor: '#FFD700',
    borderWidth: 2,
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
    padding: 10,
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
  },
  filterText: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 15,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
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
    marginHorizontal: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginHorizontal: 5,
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
  topShopBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFD700',
    padding: 5,
    borderRadius: 5,
  },
  topShopBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: "#fff",
    marginHorizontal: "5%",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  pickerOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pickerText: {
    fontSize: 16,
  },
});

export default RequestRescueScreen;