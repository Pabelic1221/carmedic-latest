import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux"; // Assuming you're using Redux for user location
import RequestForm from "../components/modals/RequestForm";
import AppBar from "./AppBar";
import ReviewModal from "../components/modals/ReviewModal";

// Haversine formula to calculate distance in kilometers between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const AutoRepairShopsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const shop = route.params.item;
  // Getting user's current location from Redux
  const { latitude, longitude } = useSelector(
    (state) => state.userLocation.currentLocation
  );
  const handleOpenRequestModal = () => {
    const distance = haversineDistance(
      latitude,
      longitude,
      shop.latitude,
      shop.longitude
    );
    if (distance > 10) {
      // Trigger alert if the distance is more than 10 km
      Alert.alert(
        "Shop may be too far",
        `The shop is ${distance.toFixed(
          2
        )} km away. They may likely decline your request.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: handleCloseRequestModal,
          },
          {
            text: "Proceed",
            onPress: () => setModalVisible(true), // Show modal if user proceeds
          },
        ]
      );
    } else {
      setModalVisible(true); // Directly open modal if within 10 km
    }
  };

  const handleCloseRequestModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    console.log(route.params);
  });

  const handleChatPress = () => {
    navigation.navigate("Chat Screen", { recieverId: shop.id });
  };
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);

  const handleOpenReviewModal = () => {
    setReviewModalVisible(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalVisible(false);
  };
  return (
    <View style={styles.container}>
      <AppBar />
      <View style={styles.contentContainer}>
        <View style={styles.shopInfo}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: shop.profilePicUrl
                  ? shop.profilePicUrl
                  : "https://via.placeholder.com/80",
              }}
              style={styles.shopImage}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.shopName}>{shop.shopName}</Text>
            <Text style={styles.shopAddress}>
              <Ionicons name="location-outline" size={16} color="gray" />
              {shop.address}
            </Text>
            {/* Shop Ratings Section */}
            <View style={styles.ratingsContainer}>
              <Text style={styles.shopRatings}>
               Ratings: {shop.averageRating ? shop.averageRating : "0 ratings"}
              </Text>
            </View>
          </View>
        </View>
        {/* Services Heading Section */}
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesHeading}>Services</Text>
        </View>
  
        {/* Shop Specialties Section */}
        <View style={styles.specialtiesContainer}>
          {shop.specialties && shop.specialties.length > 0 ? (
            <Text style={styles.shopSpecialties}>
              {shop.specialties.join("  ,   ")}
            </Text>
          ) : (
            <Text style={styles.noServicesText}>No current Services available</Text>
          )}
        </View>

        {/* Contact Heading Section */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactHeading}>Contact</Text>
          <Text style={styles.contactNumber}>
            Phone: {shop.contactNumber ? shop.contactNumber : "(no phone number)"}
          </Text>
          <Text style={styles.contactEmail}>
            Email: {shop.email ? shop.email : "(no email provided)"}
          </Text>
        </View>

        {/* Hours Heading Section */}
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursHeading}>Hours</Text>
          <Text style={styles.hoursText}>8 AM - 6 PM</Text>
        </View>


        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleOpenRequestModal}
          >
            <Text style={styles.requestButtonText}>Request</Text>
          </TouchableOpacity>
  
          <Modal
            visible={isModalVisible}
            onBackdropPress={handleCloseRequestModal}
            transparent={true}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <RequestForm shop={shop} onClose={handleCloseRequestModal} />
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={handleOpenReviewModal}
        >
          <Text style={styles.reviewButtonText}>Leave a Review</Text>
        </TouchableOpacity>
  
        {/* Review Modal */}
        <ReviewModal
          visible={isReviewModalVisible}
          onClose={handleCloseReviewModal}
          shopId={shop.id} // Pass shop ID for the review
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#000", // Dark header background
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  contentContainer: {
    marginTop: 5,
    marginHorizontal: 10,
    flex: 1,
    padding: 16,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    marginRight: 15,
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
  },
  infoContainer: {
    flex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  shopAddress: {
    color: "gray",
    marginTop: 5,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  servicesContainer: {
    flex: 1,
  },
  contactContainer: {
    flex: 1,
  },
  reviewsContainer: {
    flex: 1,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  serviceItem: {
    color: "gray",
    marginBottom: 5,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
  },
  reviewCount: {
    color: "gray",
  },
  contactContainer: {
    marginBottom: 10,
  },
  hoursContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatButton: {
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  chatButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  requestButton: {
    backgroundColor: "black",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flex: 1,
  },
  requestButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background with opacity
  },
  modalContent: {
    height: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    overflow: "scroll",
  },
  shopRatings: {
    fontSize: 14,
    color: "#333",
    marginVertical: 5,
  },
  servicesHeading: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 5
  },
  contactHeading: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 5
  },
  servicesContainer: {
    marginBottom: 2,
  },
  shopSpecialties: {
    color: "gray",
    marginTop: 0,
    fontSize: 15,
    marginBottom: 10
  },
  noServicesText: {
    color: "red",
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: 10,
  },
  reviewButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // New styles for the additional sections
  ratingsContainer: {
    marginVertical: 2,
  },
  specialtiesContainer: {
    marginVertical: 10,
  },
  contactNumber: {
    color: "gray",
    marginVertical: 2
  },
  contactEmail: {
    color: "gray",
    marginVertical: 2
  },
  hoursContainer: {
    marginBottom: 20,
  },
  hoursHeading: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 5,
  },
  hoursText: {
    fontSize: 16,
    color: "gray",
    marginVertical: 2,
  },
});
export default AutoRepairShopsScreen;
