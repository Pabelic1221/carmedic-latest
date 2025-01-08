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
  const currentUser  = useSelector((state) => state.user.currentUser );
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
          navigation.navigate("UserRequestTracking", { request: item });
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
    if (!currentUser ) {
      console.log("No current user found.");
      return;
    }

    const requestsRef = collection(db, "requests");
    const q = query(
      requestsRef,
      where("userId", "==", currentUser .id),
      where("state", "in", ["accepted", "ongoing", "ended", "declined"]) // Include all desired states
    );

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

      setRequests(fetchedRequests);
      console.log("Fetched requests:", fetchedRequests); // Debugging line
    }, (error) => {
      console.error("Error fetching requests:", error); // Catch any errors
    });

    return () => unsubscribe();
  }, [currentUser ]);

  // Separate requests by state
  const acceptedRequests = requests.filter(req => req.state === "accepted").sort((a, b) => b.timestamp - a.timestamp);
  const ongoingRequests = requests.filter(req => req.state === "ongoing").sort((a, b) => b.timestamp - a.timestamp);
  const endedRequests = requests.filter(req => req.state === "ended").sort((a, b) => b.timestamp - a.timestamp);
  const declinedRequests = requests.filter(req => req.state === "declined").sort((a, b) => b.timestamp - a.timestamp);

  // Combine all requests in the desired order
  // Combine all requests in the desired order
// Combine all requests in the desired order
// Combine all requests in the desired order
const sortedRequests = [
  ...requests.sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    const hourA = dateA.getHours();
    const hourB = dateB.getHours();
    const minuteA = dateA.getMinutes();
    const minuteB = dateB.getMinutes();

    if (dateA.getDate() === dateB.getDate() && dateA.getMonth() === dateB.getMonth() && dateA.getFullYear() === dateB.getFullYear()) {
      if (hourA === hourB) {
        return minuteB - minuteA;
      } else {
        return hourB - hourA;
      }
    } else {
      return dateB - dateA;
    }
  }),
];

const renderRequestItem = ({ item }) => {
  const request = item;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        if (request.state === "accepted") {
          await handleAcceptedRequest(request);
          return;
        }
    
        navigation.navigate("UserRequestTracking", { request });
      }}
    >
      <Text style={styles.cardTitle}>{request.selectedSpecialty} Request</Text>
      <Text style={styles.cardSubtitle}>Shop: {request.shopName}</Text>
      <Text style={styles.cardStatus}>Status: <Text style={styles.boldText}>{request.state}</Text></Text> {/* Added status here */}
      <Text style={styles.cardDate}>
        {new Date(request.timestamp).toLocaleDateString()}{" "}
        {new Date(request.timestamp).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <FlatList
          data={sortedRequests}
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
                  Selected Specialty: {selectedRequest.selectedSpecialty}
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
  cardStatus: {
    fontSize: 14,
    color: "#555",
    marginTop: 4, // Add some margin for spacing
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  boldText: {
    fontWeight: "bold", // This will make the text bold
  },
});


export default UserRequestLogScreen;