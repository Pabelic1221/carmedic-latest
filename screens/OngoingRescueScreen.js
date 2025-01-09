import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  SafeAreaView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../redux/map/userLocation";
import {
  actions as requestActions,
  setRescueRoute,
} from "../redux/requests/requests";
import EndTicket from "../components/modals/endTicketModal";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";

const getDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371000; // Earth's radius in meters
  const lat1 = toRad(coord1.latitude);
  const lon1 = toRad(coord1.longitude);
  const lat2 = toRad(coord2.latitude);
  const lon2 = toRad(coord2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const constructRouteUrl = (startCoords, endCoords) => {
  const start = `${startCoords.longitude},${startCoords.latitude}`;
  const end = `${endCoords.longitude},${endCoords.latitude}`;

  return `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
};

const fetchAndDispatchRoute = async (startCoords, endCoords, dispatch) => {
  const url = constructRouteUrl(startCoords, endCoords);
  try {
    const response = await axios.get(url);
    const route = response.data.routes[0].geometry.coordinates.map(
      ([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      })
    );
    dispatch(setRescueRoute(route));
  } catch (error) {
    console.error("Error fetching route:", error);
  }
};

const OngoingRequestScreen = ({ route }) => {
  const { request } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  const userLocation = useSelector(
    (state) => state.userLocation.currentLocation
  );
  const rescue = useSelector((state) => state.requests.rescueRoute);
  const rescueRoute = useMemo(() => rescue, [rescue]);
  const requestLocation = useSelector(
    (state) => state.requests.requestLocation
  );
  const shopLocation = useSelector((state) => state.requests.shopLocation);
  const { currentUser } = useSelector((state) => state.user);

  const destination = useMemo(
    () =>
      Object.keys(requestLocation).length
        ? requestLocation
        : Object.keys(shopLocation).length
        ? shopLocation
        : null,
    [requestLocation, shopLocation]
  );

  const lastLocation = useRef(userLocation);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permissions not granted");
          return;
        }

        let latitude, longitude;

        // Fetch shop's location from Firestore if it's a shop
        if (currentUser?.role === "Shop") {
          const shopRef = doc(db, "shops", auth.currentUser.uid);
          const shopSnapshot = await getDoc(shopRef);
          if (shopSnapshot.exists()) {
            const shopData = shopSnapshot.data();
            latitude = shopData?.latitude ?? 0; // Default to 0 if not present
            longitude = shopData?.longitude ?? 0; // Default to 0 if not present
            dispatch(actions.setShopLocation({ latitude, longitude }));
          } else {
            console.error("Shop not found in Firestore");
          }
        } else {
          // Get user's current location if not a shop
          const currentLocation = await Location.getCurrentPositionAsync({});
          latitude = currentLocation.coords.latitude;
          longitude = currentLocation.coords.longitude;
          dispatch(actions.setCurrentLocation({ latitude, longitude }));
        }

        // Fetch route if destination is set
        if (destination) {
          await fetchAndDispatchRoute(
            { latitude, longitude },
            destination,
            dispatch
          );
        }

        // Set Firestore data for shops if needed
        if (currentUser ?.role === "Shop") {
          const rescueDoc = doc(db, "shopOnRescue", request.id);
          await setDoc(
            rescueDoc,
            {
              userId: request.userId,
              storeId: auth.currentUser .uid,
              shopName: currentUser ?.shopName,
              state: "ongoing",
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [dispatch, destination, rescueRoute.length, currentUser ?.role, request.id]);

  // Location tracking and Firestore updates
  useEffect(() => {
    let locationSubscription;

    const trackLocation = async () => {
      try {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          async (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { latitude, longitude };
            const distance = getDistance(lastLocation.current, newLocation);

            if (distance > 100) {
              dispatch(actions.setCurrentLocation(newLocation));

              if (currentUser ?.role === "Shop") {
                await updateDoc(doc(db, "shopOnRescue", request.id), {
                  latitude,
                  longitude,
                  timestamp: new Date().toISOString(),
                });
              }

              lastLocation.current = newLocation;
            }
          }
        );
      } catch (error) {
        console.error("Error tracking location:", error);
      }
    };

    trackLocation();
    return () => locationSubscription?.remove();
  }, [dispatch, destination, request.id, currentUser ?.role]);

  const handleEndRequest = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleConfirmEndRequest = async () => {
    try {
      const requestDoc = doc(db, "requests", request.id);
      await updateDoc(requestDoc, {
        state: "ended",
        timestamp: new Date().toISOString(),
      });

      if (currentUser ?.role === "Shop") {
        const rescueDoc = doc(db, "shopOnRescue", request.id);
        await updateDoc(rescueDoc, {
          state: "ended",
          timestamp: new Date().toISOString(),
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error updating request state:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ongoing Request</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 0, // Add fallback if undefined
          longitude: userLocation?.longitude || 0, // Add fallback if undefined
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="yellow"
          />
        )}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            pinColor="purple"
          />
        )}
        {rescueRoute.length > 0 && (
          <Polyline
            coordinates={rescueRoute.map((coord) => ({
              latitude: coord.latitude,
              longitude: coord.longitude,
            }))}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
      <TouchableOpacity style={styles.fab} onPress={handleEndRequest }>
        <Ionicons name="checkmark" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal
       visible={isModalVisible}
       transparent
       animationType="slide"
       onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
         <View style={styles.modalBackground}>
           {isModalVisible && (
              <View style={[styles.modalContent, { zIndex: 1 }]}>
               <EndTicket
                 visible={isModalVisible}
                 request={request}
                 onClose={() => setModalVisible(false)}
                 onConfirm={handleConfirmEndRequest}
                 navigation={navigation}
               />
             </View>
           )}
         </View>
       </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6200ee',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    position: 'absolute',
    top: 70,
    left: 10,
    zIndex: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6200ee',
    borderRadius: 30,
    padding: 15,
    elevation: 5,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '60%',
    zIndex: 1,
    elevation: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default OngoingRequestScreen;