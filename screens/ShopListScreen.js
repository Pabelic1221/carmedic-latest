import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import AppBar from "./AppBar";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import Ionicons from "react-native-vector-icons/Ionicons";

const ShopListScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigation = useNavigation(); // Get navigation object

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const db = getFirestore();

        // Fetch shops data
        const shopQuery = query(collection(db, "shops"));
        const shopSnapshot = await getDocs(shopQuery);
        const shopData = shopSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Shops:", shopData); // Debug

        // Fetch reviews data
        const reviewQuery = query(collection(db, "reviews"));
        const reviewSnapshot = await getDocs(reviewQuery);
        const reviews = reviewSnapshot.docs.map((doc) => doc.data());

        // Calculate review count and average rating for each shop
        const shopsWithReviews = shopData.map((shop) => {
          const shopReviews = reviews.filter(
            (review) => review.shopId === shop.id
          );

          const reviewCount = shopReviews.length;
          const averageRating =
            reviewCount > 0
              ? shopReviews.reduce((sum, review) => sum + review.rating, 0) /
                reviewCount
              : 0;

          return {
            ...shop,
            reviewCount,
            averageRating: averageRating.toFixed(1), // Round to 1 decimal
          };
        });

        setShops(shopsWithReviews);
        filterShops(shopsWithReviews, searchTerm);
      } catch (error) {
        console.error("Error fetching shops or reviews:", error);
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    filterShops(shops, searchTerm);
  }, [searchTerm, shops]);

  const filterShops = (shops, term) => {
    if (term) {
      const filtered = shops.filter(
        (shop) =>
          shop.shopName &&
          shop.shopName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredShops(filtered);
    } else {
      setFilteredShops(shops);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.iconWrapper}>
        {item.profilePicUrl && item.profilePicUrl !== "" ? (
          <Image source={{ uri: item.profilePicUrl }} style={styles.icon} />
        ) : (
          <View style={styles.icon} />
        )}
      </View>
      <View style={styles.shopDetails}>
        <Text style={styles.shopName}>
          {item.shopName ? item.shopName : "Unnamed Shop"}
        </Text>
        <Text style={styles.shopInfo}>
          {item.address ? `${item.address}, ` : "N/A, "}
        </Text>
        <Text style={styles.shopInfo}>
          {item.reviewCount} {item.reviewCount !== 1 ? "reviews" : "review"},{" "}
          {item.averageRating <= 0
            ? "No ratings yet"
            : `Average Rating: ${item.averageRating}`}
        </Text>
      </View>
      <TouchableOpacity
       style={styles.moreIcon}
        onPress={() => navigation.navigate("Auto Repair Shop", { item })} // Navigate to AutoRepairShopScreen
      ><Ionicons name="chevron-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Shops"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style = {styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filteredShops}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontWeight: "bold",
  },
  shopInfo: {
    color: "#666",
  },
  moreIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default ShopListScreen;