import * as Location from "expo-location";

const reverseGeocodeWithRetry = async (latitude, longitude, retries = 3) => {
  try {
    const addressArray = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    return addressArray;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying... Attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
      return reverseGeocodeWithRetry(latitude, longitude, retries - 1);
    } else {
      console.error("Error fetching address:", error);
      throw error; // Rethrow the error after retries are exhausted
    }
  }
};

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const addressArray = await reverseGeocodeWithRetry(latitude, longitude);
    if (addressArray.length > 0) {
      const addressInfo = addressArray[0];
      const address =
        `${addressInfo.name ? addressInfo.name + ", " : ""}` +
        `${addressInfo.street ? addressInfo.street + ", " : ""}` +
        `${addressInfo.city ? addressInfo.city + ", " : ""}` +
        `${addressInfo.region ? addressInfo.region + ", " : ""}` +
        `${addressInfo.postalCode ? addressInfo.postalCode + ", " : ""}` +
        `${addressInfo.country ?? ""}`;
      const formattedAddress = address.trim().replace(/,\s*$/, "");
      return formattedAddress;
    } else {
      return "Address not found";
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Error fetching address";
  }
};