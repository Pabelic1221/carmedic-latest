import PropTypes from "prop-types";
import { View, StyleSheet, Text } from "react-native";
import MapView from "react-native-maps";
import { useSelector } from "react-redux";

export const MapComponent = ({ children, ...props }) => {
  const { latitude, longitude } = useSelector(
    (state) => state.userLocation.currentLocation
  );

  // Fallback location for Cagayan de Oro City
  const fallbackLocation = {
    latitude: 8.4542,
    longitude: 124.6319,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const region =
    latitude && longitude
      ? { latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
      : fallbackLocation;

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={region}
        {...props}
      >
        {children}
      </MapView>
    </View>
  );
};

MapComponent.propTypes = {
  children: PropTypes.node,
};

const styles = StyleSheet.create({
  mapContainer: {
    alignSelf: "center",
    width: 300,
    height: 400,
    margin: 30,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
