import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, updateUserStatus } from "../redux/user/userActions";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // State for initial loading
  const [navigating, setNavigating] = useState(false); // State for navigation loading
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { currentUser, status } = useSelector((state) => state.user);
  // Check if a user is already logged in when the app loads

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.emailVerified) {
          dispatch(fetchCurrentUser());
          dispatch(updateUserStatus({ userId: user.uid, status: "online" }));
          console.log("User is already logged in with:", user.email);

          navigation.navigate("Main");
        } else {
          Alert.alert(
            "Email not verified",
            "Please verify your email before logging in."
          );
          signOut(auth); // Ensure sign out completes
        }
      } else {
        signOut(auth);
      }
      setLoading(false); // Stop loading once user state is checked
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    setLoading(true); // Show loading when login is in progress
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      console.log("User  logged in");
      if (user.emailVerified) {
        dispatch(fetchCurrentUser());
        dispatch(updateUserStatus({ userId: user.uid, status: "online" }));
        console.log("Logged in with:", user.email);

        // Set navigating to true before navigating
        setNavigating(true);

        if (currentUser?.email) {
          setTimeout(() => {
            navigation.navigate("Main");
          }, 1000);
        }
        // Adjust the timeout duration as needed
      } else {
        Alert.alert(
          "Email not verified",
          "Please verify your email before logging in."
        );
        await signOut(auth); // Ensure sign out completes
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false); // Hide loading after login process
    }
  };

  const handleSignUpNavigation = () => {
    navigation.navigate("Register");
  };

  if (loading || navigating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/AutoRepairTransparent.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Sign In</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSignUpNavigation}
          style={styles.signUpTextContainer}
        >
          <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F7F7F7",
  },
  image: {
    width: 250,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  inputWrapper: {
    width: "100%",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  signUpTextContainer: {
    marginTop: 20,
  },
  signUpText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});
