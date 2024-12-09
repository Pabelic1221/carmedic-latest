import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import PropTypes from "prop-types";
import AppBar from "./AppBar"; // Import AppBar component
import React, { useState } from "react";
import { Marker } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MapComponent } from "../components/map/MapComponent";

const RequestScreen = ({ entities, ModalElement, children }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const handleShopPress = (shop) => {
    setSelectedShop(shop);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedShop(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <MapComponent>
        {entities.map((shop) => {
          const { longitude, latitude } = shop;
          if (longitude && latitude) {
            return (
              <Marker
                key={shop.id}
                coordinate={{ longitude, latitude }}
                title={shop.shopName}
                description={shop.address}
                pinColor="purple"
              />
            );
          }
          return null;
        })}
      </MapComponent>
      {children}
    </SafeAreaView>
  );
};

// Add PropTypes to validate props
RequestScreen.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.shape()).isRequired, // Ensure shops is an array and is required // Expect ModalElement to be a React component
  children: PropTypes.node.isRequired,
};

export default RequestScreen;

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
    justifyContent: "space-between",
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
});
