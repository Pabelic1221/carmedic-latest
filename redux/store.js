import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Use AsyncStorage for React Native
import { reducer as userLocationReducer } from "./map/userLocation";
import { reducer as shopsReducer } from "./shops/shops";
import { reducer as userReducer } from "./user/user";
import { reducer as requestsReducer } from "./requests/requests";
import { combineReducers } from "redux";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist/es/constants"; // Import persist action constants

// 1. Combine your reducers
const rootReducer = combineReducers({
  userLocation: userLocationReducer,
  shops: shopsReducer,
  user: userReducer,
  requests: requestsReducer,
});

// 2. Create persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage, // Use AsyncStorage for React Native
  whitelist: ["user", "userLocation", "requests", "shops"], // State slices you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions that have non-serializable values
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
