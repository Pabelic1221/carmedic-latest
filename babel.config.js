module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin", // Keep this as is
      [
        "module:react-native-dotenv", // Add dotenv plugin here
        {
          moduleName: "@env", // Define the module name used to import env variables
          path: ".env", // Path to your .env file
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
