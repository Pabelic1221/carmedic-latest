import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicatorBase,
} from "react-native";
import AppBar from "./AppBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { fetchAllShops } from "../redux/shops/shopsThunk";

const RequestRescueScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(true);
  const mapRef = useRef(null); // New useRef for MapView
  const flatListRef = useRef(null);
  const dispatch = useDispatch();

  const { shops, loading, error } = useSelector((state) => state.shops);
  const userLocation = useSelector(
    (state) => state.userLocation.currentLocation
  );
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
    const index = shops.findIndex((s) => s.id === shop.id);
    if (flatListRef.current && index !== -1) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }

    // Center map on the selected marker
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
        ref={mapRef} // Attach mapRef here
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
        {shops.map((shop) => {
          const { longitude, latitude } = shop;

          return (
            <Marker
              key={shop.id}
              coordinate={{ longitude, latitude }}
              title={shop.shopName}
              description={shop.address}
              pinColor="purple"
              onPress={() => handleMarkerPress(shop)}
            />
          );
        })}
      </MapView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      {renderMapView()}
      <FlatList
        ref={flatListRef}
        style={styles.shopList}
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

export default RequestRescueScreen;

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
});
