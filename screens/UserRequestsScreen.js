import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { db } from "../firebase"; // Assume Firebase is properly initialized
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "../firebase"; // For getting the current user

const UserRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUserId = auth.currentUser.uid; // Get the current logged-in user ID

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const requestsRef = collection(db, "requests");
        const requestsQuery = query(
          requestsRef,
          where("userId", "==", currentUserId)
        );
        const querySnapshot = await getDocs(requestsQuery);

        const requestsWithShops = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const requestData = docSnapshot.data();
            const shopDoc = await getDoc(doc(db, "shops", requestData.shopId));
            const shopData = shopDoc.exists() ? shopDoc.data() : {};
            return {
              id: docSnapshot.id,
              ...requestData,
              shopName: shopData.shopName || "Unknown Shop",
              shopProfilePic:
                shopData.profilePicUrl || "https://via.placeholder.com/50",
            };
          })
        );

        setRequests(requestsWithShops);
      } catch (error) {
        console.error("Error fetching requests:", error);
        Alert.alert("Error", "Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUserId]);

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Image
          source={{ uri: item.shopProfilePic }}
          style={styles.requestImage}
        />
        <View style={styles.requestDetails}>
          <Text style={styles.shopName}>{item.shopName}</Text>
          <Text style={styles.problemText}>
            Concern: {item.specificProblem}
          </Text>
          <Text style={styles.statusText}>
            Status: {item.state.charAt(0).toUpperCase() + item.state.slice(1)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => Alert.alert("Request Details", `Request ID: ${item.id}`)}
      >
        <Ionicons name="arrow-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Requests</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading requests...</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default UserRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
  listContainer: {
    paddingBottom: 20,
  },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  requestImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  requestDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  problemText: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    color: "orange",
    marginTop: 4,
  },
  navigateButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    marginLeft: 10,
  },
});
