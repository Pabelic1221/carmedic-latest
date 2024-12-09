import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { useEffect } from "react";
import PropTypes from "prop-types";

const UserChecker = ({ children }) => {
  const navigation = useNavigation();
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "User" || currentUser.role === "Shop") {
        navigation.navigate("Main");
      }
    } else {
      navigation.replace("Login");
    }
  }, [currentUser, navigation]); // Add dependencies

  return children;
};

UserChecker.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserChecker;
