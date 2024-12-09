import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Alert, AppState } from "react-native";
import { useEffect } from "react";
import { , fetchCurrentUser, updateUserStatus } from "../../redux/user/userActions";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/core";
export default function SessionChecker({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!user.emailVerified) {
          signOut(auth);
          Alert.alert(
            "Email not verified",
            "Please verify your email before logging in."
          );
        } else if (user.emailVerified) {
          dispatch(fetchCurrentUser());
        }
      }
    });

    // Handle app state changes (e.g., background, active)
    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (auth.currentUser) {
          if (nextAppState === "background" || nextAppState === "inactive") {
            dispatch(updateUserStatus(auth.currentUser.uid, "offline"));
          } else if (nextAppState === "active") {
            dispatch(updateUserStatus(auth.currentUser.uid, "online"));
          }
        }
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribe(); // Properly call unsubscribe
      appStateListener.remove(); // Properly remove listener
    };
  }, [dispatch]);

  return children;
}

SessionChecker.propTypes = {
  children: PropTypes.node.isRequired,
};
