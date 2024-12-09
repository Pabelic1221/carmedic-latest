import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import AppBar from "./AppBar";
import { useNavigation } from "@react-navigation/native";
import { setShopLocation } from "../redux/requests/requests";

const UserRequestLogScreen = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleAcceptedRequest = async (item) => {
    try {
      const docRef = doc(db, "shopOnRescue", item.id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const shopData = docSnapshot.data();
        if (shopData.state === "ongoing") {
          dispatch(setShopLocation(shopData));
          navigation.navigate("OngoingRequest", { request: item });
        } else {
          console.log("The shop rescue is not ongoing.");
        }
      } else {
        console.log("No shop rescue found for this request ID.");
      }
    } catch (error) {
      console.error("Error fetching shop location:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("userId", "==", currentUser.id));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedRequests = [];

      for (const docSnap of querySnapshot.docs) {
        const requestData = docSnap.data();

        const shopDocRef = doc(db, "shops", requestData.storeId);
        const shopDocSnap = await getDoc(shopDocRef);
        const shopName = shopDocSnap.exists()
          ? shopDocSnap.data().shopName
          : "Unknown Shop";

        fetchedRequests.push({
          id: docSnap.id,
          ...requestData,
          shopName,
        });
      }

      fetchedRequests.sort((a, b) => b.timestamp - a.timestamp);

      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        if (item.state === "accepted") {
          await handleAcceptedRequest(item);
          return;
        }

        setSelectedRequest(item);
      }}
    >
      <Text style={styles.cardTitle}>{item.specificProblem} Request</Text>
      <Text style={styles.cardSubtitle}>Shop: {item.shopName}</Text>
      <Text style={styles.cardDate}>
        {new Date(item.timestamp).toLocaleDateString()}{" "}
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No previous requests found.</Text>
        }
      />
      <Modal
        visible={selectedRequest !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedRequest && (
              <>
                <Text style={styles.modalHeader}>Request Details</Text>
                <Text style={styles.modalText}>
                  Car Brand: {selectedRequest.carBrand}
                </Text>
                <Text style={styles.modalText}>
                  Car Model: {selectedRequest.carModel}
                </Text>
                <Text style={styles.modalText}>
                  Description: {selectedRequest.description}
                </Text>
                <Text style={styles.modalText}>
                  Specific Problem: {selectedRequest.specificProblem}
                </Text>
                <Text style={styles.modalText}>
                  Shop: {selectedRequest.shopName}
                </Text>
                <Text style={styles.modalText}>
                  Status: {selectedRequest.state}
                </Text>
                <Text style={styles.modalText}>
                  Date:{" "}
                  {new Date(selectedRequest.timestamp).toLocaleDateString()}{" "}
                  {new Date(selectedRequest.timestamp).toLocaleTimeString()}
                </Text>
              </>
            )}
            <TouchableOpacity
              onPress={() => setSelectedRequest(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  cardDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 10,
  },
  closeButtonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default UserRequestLogScreen;
