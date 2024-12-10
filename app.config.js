import "dotenv/config";

export default ({ config }) => ({
  ...config,
  android: {
    package: "com.capstone.carmedic", // Replace with your actual package name
  },
  extra: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    apiUrl: process.env.API_URL,
    eas: {
      projectId: "079529e4-c6bd-4877-b82d-b97d4f75461d",
    },
  },
});
