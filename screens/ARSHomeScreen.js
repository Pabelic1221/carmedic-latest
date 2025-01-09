import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { useSelector, useDispatch } from "react-redux";
import RequestTicket from "../components/modals/RequestTicket";
import ShopAppBar from "./ShopAppBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import TicketListener from "../components/map/Shops/TicketListener";
import { setRequestLocation } from "../redux/requests/requests";
import { fetchAllRequests } from "../redux/requests/requestsThunk";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { getAuth } from "firebase/auth";



const ARSHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [shopLocation, setShopLocation] = useState(null);

  const { requests, loading } = useSelector((state) => state.requests);

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const handleInitRescue = (request) => {
    dispatch(setRequestLocation(request));
    navigation.navigate("OngoingRequest", { request });
  };

const fetchShopCoordinates = async () => {
  try {
    // Get the currently logged-in user's ID
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user is logged in.");
      return;
    }

    const shopId = currentUser.uid; // Assuming the shop ID matches the logged-in user's UID

    // Fetch the shop document from Firestore
    const shopDoc = await getDoc(doc(db, "shops", shopId));
    if (shopDoc.exists()) {
      const { latitude, longitude } = shopDoc.data();
      setShopLocation({ latitude, longitude });
      console.log("Shop location:", { latitude, longitude });
    } else {
      console.error("No shop data found!");
    }
  } catch (error) {
    console.error("Error fetching shop coordinates:", error);
  } finally {
    setLoading(false); // Ensure loading state is updated
  }
};


  useEffect(() => {
    fetchShopCoordinates();
    dispatch(fetchAllRequests());
  }, [dispatch]);

  const renderMapView = () => {
    if (isLoading || !shopLocation) {
      return (
        <Text>Loading map... Please ensure location services are enabled.</Text>
      );
    }
  
    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: shopLocation.latitude,
          longitude: shopLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        loadingEnabled={true}
        showsCompass={true}
      >
        {/* Shop's location marker */}
        <Marker
          coordinate={{
            latitude: shopLocation.latitude,
            longitude: shopLocation.longitude,
          }}
          title="Your Shop Location"
          description="This is the location of your shop."
          pinColor="yellow" // Yellow pin for shop location
        />
  
        {/* Request markers */}
        {requests.map((request) => (
          <Marker
            key={request.id}
            coordinate={{
              latitude: request.latitude,
              longitude: request.longitude,
            }}
            title={request.firstName}
            description={request.selectedSpecialty}
            pinColor="purple"
            onPress={() => {
              if (request.state === "accepted") {
                handleInitRescue(request);
              } else {
                handleRequestPress(request);
              }
            }}
          />
        ))}
      </MapView>
    );
  };
  

  return (
    <TicketListener>
      <SafeAreaView style={styles.container}>
        <ShopAppBar />
        {renderMapView()}
        <Text style={styles.heading}>Pending Requests</Text>
        <FlatList
         data={requests}
         keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <View style={styles.requestInfo}>
                <Image
                  source={{
                    uri: item.profilePicUrl
                      ? item.profilePicUrl
                      : "https://via.placeholder.com/50",
                  }}
                 style={styles.requestImage}
                />
                <View style={styles.requestDetails}>
                  <Text style={styles.requestName}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={styles.problemText}>
                    Service Request: {item.selectedSpecialty}
                  </Text>
                  <Text style={styles.statusText}>{item.state}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={() => {
                  const request = item;
                  if (request.state === "accepted") {
                    handleInitRescue(request);
                 } else {
                   handleRequestPress(request);
                 }
                }}
              >
                <Ionicons name="arrow-forward" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          )}
         ListEmptyComponent={() => (
           <View style={styles.emptyContainer}>
             <Text style={styles.emptyText}>No Request so far</Text>
           </View>
         )}
          style={styles.requestList}
        />
        <Modal
          visible={isModalVisible}
          onRequestClose={handleCloseModal}
          transparent={true}
          animationType="slide"
        >
          {selectedRequest ? (
            <RequestTicket
              request={selectedRequest}
              onClose={handleCloseModal}
              onAcceptRequest={(request) => {
                const requestDoc = doc(db, "requests", request.id);
                updateDoc(requestDoc, {
                  state: "accepted",
                  timestamp: new Date().toISOString(),
                })
                  .then(() => {
                    navigation.navigate("OngoingRequest", { request });
                  })
                  .catch((error) => {
                    console.error("Error updating request state:", error);
                  });
              }}
            />
          ) : (
            <View>
              <Text>No request selected</Text>
            </View>
          )}
        </Modal>
      </SafeAreaView>
    </TicketListener>
  );
};


export default ARSHomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  map: {
    alignSelf: "center",
    width: 300,
    height: 400,
    margin: 30,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#333",
  },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  requestInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  requestName: {
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
    color: "orange", // You can change the color based on status (e.g., 'pending', 'resolved')
    marginTop: 4,
  },
  navigateButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    marginLeft: 10,
  },
  requestList: {
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background with opacity
  },
  modalContent: {
    height: "70%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    overflow: "scroll",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  
});