import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  StatusBar,
  Platform,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Screens
import HomeScreen from "./screens/HomeScreen";
import RequestRescueScreen from "./screens/RequestRescueScreen";
import AutoRepairShopScreen from "./screens/AutoRepairShopScreen";
import ReviewsScreen from "./screens/ReviewsScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import DrawerContent from "./screens/DrawerContent";
import ShopDrawerContent from "./screens/ShopDrawerContent";
import UserProfile from "./screens/UserProfile";
import ARSHomeScreen from "./screens/ARSHomeScreen";
import ShopListScreen from "./screens/ShopListScreen";
import OngoingRequestScreen from "./screens/OngoingRescueScreen";
import UserRequestTrackingScreen from "./screens/UserRequestTrackingScreen";
import Chat from "./screens/ChatScreen";
import ChatList from "./components/chat/ChatList";
import UserRequestLogScreen from "./screens/UserRequestLogScreen";
import ShopProfile from "./screens/ShopProfile";

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const { currentUser, status } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status]);
  if (isLoading || !currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading... User data</Text>
        <Text>status: {status}</Text>
      </View>
    );
  }

  return (
    <Drawer.Navigator
      detachInactiveScreens={true}
      drawerContent={(props) => {
        if (!currentUser) {
          return (
            <View>
              <Text>Loading...</Text>
            </View>
          );
        }
        return currentUser.role === "Shop" ? (
          <ShopDrawerContent {...props} />
        ) : currentUser.role === "User" ? (
          <DrawerContent {...props} />
        ) : (
          <View>
            <Text>Invalid Role</Text>
          </View>
        );
      }}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        unmountOnBlur: true,

        drawerStyle: {
          height: "100%",
          width: 250,
          backgroundColor: "#fff",
        },
        overlayColor: "rgba(0,0,0,0.5)",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={
          currentUser?.role === "Shop"
            ? ARSHomeScreen
            : currentUser?.role === "User"
            ? HomeScreen
            : null // Prevent rendering while loading
        }
      />
      <Drawer.Screen name="Request" component={RequestRescueScreen} />
      <Drawer.Screen name="Auto Repair Shops" component={ShopListScreen} />
      <Drawer.Screen name="Reviews" component={ReviewsScreen} />
      <Drawer.Screen name="Auto Repair Shop" component={AutoRepairShopScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="Chat Screen" component={Chat} />
      <Drawer.Screen name="Chat List" component={ChatList} />
      <Drawer.Screen name="UserProfile" component={UserProfile} />
      <Drawer.Screen name="ShopProfile" component={ShopProfile} />
      <Drawer.Screen name="UserRequestLog" component={UserRequestLogScreen} />
      <Drawer.Screen name="OngoingRequest" component={OngoingRequestScreen} />
      <Drawer.Screen name="UserRequestTracking" component={UserRequestTrackingScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
