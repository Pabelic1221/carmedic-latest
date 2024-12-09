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
      projectId: "db9cfc11-301f-4f40-b895-62c634e15c51",
    },
  },
});
