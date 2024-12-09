import React, { useState, useEffect, useCallback } from "react";
import { View, Text, AppState, StyleSheet } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { FontAwesome } from "@expo/vector-icons";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppBar from "./AppBar";
import ShopAppBar from "./ShopAppBar";
import { useSelector } from "react-redux";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [shopName, setRecieverName] = useState("");
  const [shopStatus, setRecieverStatus] = useState("offline");
  const route = useRoute();
  const { receiverId } = route.params;
  const { currentUser } = useSelector((state) => state.user);
  const senderId = auth.currentUser.uid;

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  // Fetch receiver's name and status
  useEffect(() => {
    console.log(receiverId);
    if (!receiverId) return;

    const recieverRef =
      currentUser?.role === "Shop"
        ? doc(db, "users", receiverId)
        : doc(db, "shops", receiverId);

    const unsubscribe = onSnapshot(recieverRef, (docSnap) => {
      if (docSnap.exists()) {
        const recieverData = docSnap.data();
        const name =
          currentUser?.role === "Shop"
            ? `${recieverData.firstName} ${recieverData.lastName}`
            : recieverData.shopName;
        setRecieverName(name);
        setRecieverStatus(recieverData.status);
      } else {
        console.log("No such shop found!");
      }
    });

    return () => unsubscribe();
  }, [receiverId, currentUser?.role]);

  // Fetch initial messages and set up real-time updates
  useEffect(() => {
    if (!receiverId) return;

    const fetchInitialMessages = async () => {
      const senderMessagesRef = collection(db, "chats", senderId, "messages");
      const receiverMessagesRef = collection(
        db,
        "chats",
        receiverId,
        "messages"
      );

      // Query sender's messages to the receiver
      const qSender = query(
        senderMessagesRef,
        where("user._id", "==", receiverId), // Filter where the sender is the current user
        orderBy("createdAt", "desc")
      );

      // Query receiver's messages to the sender
      const qReceiver = query(
        receiverMessagesRef,
        where("user._id", "==", senderId), // Filter where the sender is the receiver
        orderBy("createdAt", "desc")
      );

      // Fetch initial messages from both sender and receiver
      const [senderSnapshot, receiverSnapshot] = await Promise.all([
        getDocs(qSender),
        getDocs(qReceiver),
      ]);

      const senderMessagesData = senderSnapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));

      const receiverMessagesData = receiverSnapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));

      const allMessages = [...senderMessagesData, ...receiverMessagesData];
      const uniqueMessages = Array.from(
        new Map(allMessages.map((msg) => [msg._id, msg])).values()
      );

      uniqueMessages.sort((a, b) => b.createdAt - a.createdAt);
      setMessages(uniqueMessages);
    };

    // Call the function to fetch initial messages
    fetchInitialMessages();

    // Set up real-time listeners for new messages
    const senderMessagesRef = collection(db, "chats", senderId, "messages");
    const receiverMessagesRef = collection(db, "chats", receiverId, "messages");

    const unsubscribeSender = onSnapshot(
      query(
        senderMessagesRef,
        where("user._id", "==", receiverId),
        orderBy("createdAt", "desc")
      ),
      (querySnapshot) => {
        const newMessages = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
        setMessages((prevMessages) => {
          const allMessages = [...prevMessages, ...newMessages];
          const uniqueMessages = Array.from(
            new Map(allMessages.map((msg) => [msg._id, msg])).values()
          );

          uniqueMessages.sort((a, b) => b.createdAt - a.createdAt);
          return uniqueMessages;
        });
      }
    );

    const unsubscribeReceiver = onSnapshot(
      query(
        receiverMessagesRef,
        where("user._id", "==", senderId),
        orderBy("createdAt", "desc")
      ),
      (querySnapshot) => {
        const newMessages = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
        setMessages((prevMessages) => {
          const allMessages = [...prevMessages, ...newMessages];
          const uniqueMessages = Array.from(
            new Map(allMessages.map((msg) => [msg._id, msg])).values()
          );

          uniqueMessages.sort((a, b) => b.createdAt - a.createdAt);
          return uniqueMessages;
        });
      }
    );

    return () => {
      unsubscribeSender();
      unsubscribeReceiver();
    };
  }, [receiverId]);

  const onSend = useCallback(
    (messages = []) => {
      if (!receiverId) return;

      messages.forEach((msg) => {
        const { _id, createdAt, text, user } = msg;
        const messageData = {
          _id,
          createdAt,
          text,
          user,
        };
        addDoc(collection(db, "chats", receiverId, "messages"), messageData);
      });
    },
    [receiverId, senderId]
  );

  const getStatusIcon = () => {
    const color =
      shopStatus === "online"
        ? "green"
        : shopStatus === "busy"
        ? "red"
        : "gray";
    return <FontAwesome name="circle" size={12} color={color} />;
  };

  const handleAppStateChange = async (nextAppState) => {
    const currentUserId = auth?.currentUser?.uid;
    if (!currentUserId) return;

    const userRole = currentUser?.role;
    const userDocRef =
      userRole === "Shop"
        ? doc(db, "shops", currentUserId)
        : doc(db, "users", currentUserId);

    await updateDoc(userDocRef, {
      status: nextAppState === "active" ? "online" : "offline",
    });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={{ zIndex: 999, backgroundColor: "#000" }}>
        {currentUser.role === "Shop" ? <ShopAppBar /> : <AppBar />}
      </SafeAreaView>
      <View style={{ flex: 1, paddingTop: 60 }}>
        {" "}
        {/* Adjust paddingTop based on your AppBar height */}
        <View style={styles.header}>
          <Text style={styles.shopName}>{shopName}</Text>
          <View style={styles.statusIcon}>{getStatusIcon()}</View>
        </View>
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => onSend(newMessages)}
          user={{
            _id: senderId,
          }}
          scrollToBottom
          scrollToBottomComponent={() => (
            <FontAwesome name="arrow-down" size={24} color="gray" />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f2f2f2",
  },
  shopName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  statusIcon: {
    marginLeft: 10,
  },
});
