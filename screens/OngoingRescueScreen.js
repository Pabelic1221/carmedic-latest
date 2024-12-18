import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  SafeAreaView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
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
import { doc, setDoc, updateDoc } from "firebase/firestore";
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
  const { currentUser  } = useSelector((state) => state.user);

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

  // Load all necessary data asynchronously
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Request permissions and get initial user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permissions not granted");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;
        dispatch(actions.setCurrentLocation({ latitude, longitude }));

        // Fetch route if not already available
        if (destination) {
          await fetchAndDispatchRoute(
            { latitude, longitude },
            destination,
            dispatch
          );
        }

        // Set Firestore data for shops
        if (currentUser ?.role === "Shop") {
          const rescueDoc = doc(db, "shopOnRescue", request.id);
          await setDoc(
            rescueDoc,
            {
              userId: request.userId,
              storeId: auth.currentUser .uid,
              state: "ongoing",
              longitude,
              latitude,
              timestamp: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false); // Ensure loading ends
      }
    };

    initializeData();
  }, [
    dispatch,
    destination,
    rescueRoute.length,
    currentUser ?.role,
    request.id,
  ]);

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

  const handleCloseModal = () => {
    setModalVisible(false);
    navigation.goBack();
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fab}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ongoing Request</Text>
      </View>
      <MapView
         style={styles.map}
         initialRegion={{
           latitude: parseFloat(userLocation.latitude), // Ensure this is a number
           longitude: parseFloat(userLocation.longitude), // Ensure this is a number
           latitudeDelta: 0.05,
           longitudeDelta: 0.05,
         }}
        >
         {userLocation && (
        <Marker
             coordinate={{
               latitude: parseFloat(userLocation.latitude), // Convert to number
               longitude: parseFloat(userLocation.longitude), // Convert to number
             }}
             title="Your Location"
             pinColor="purple"
           />
         )}
         {destination && (
          <Marker
             coordinate={{
                latitude: parseFloat(destination.latitude), // Convert to number
                longitude: parseFloat(destination.longitude), // Convert to number
             }}
              title={"Destination"}
              pinColor="blue"
            />
         )}
         {rescueRoute.length > 0 && (       
           <Polyline
             coordinates={rescueRoute.map(coord => ({
               latitude: parseFloat(coord.latitude), // Ensure this is a number
               longitude: parseFloat(coord.longitude), // Ensure this is a number
             }))}
             strokeWidth={4}
             strokeColor="blue"
            />
          )}
        </MapView>
      <TouchableOpacity style={styles.fab} onPress={handleEndRequest}>
        <Ionicons name="checkmark" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <EndTicket request={request} onClose={handleCloseModal} />
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
    padding: 10,
    backgroundColor: '#6200ee',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    alignItems: 'center' 
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
});

export default OngoingRequestScreen;