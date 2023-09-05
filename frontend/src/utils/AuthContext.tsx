import Cookies from "js-cookie";
import socketIO from "socket.io-client";
import {
  useContext,
  useState,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";

import { User } from "../models/User";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: User | null;
  loginUser: () => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User>({} as User);

  const loginUser = () => {
    window.location.href = "http://localhost:3001/auth/42";
  };

  let jwt_token = Cookies.get("jwt_token") || "";

  async function fetchUserData() {
    try {
      const response = await axios.get("http://localhost:3001/users/me", {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      });
      console.log(response.data);
      setUser({ ...response.data, jwtToken: jwt_token });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  useEffect(() => {
    fetchUserData();
  }, []);

  const logoutUser = () => {};

  const contextData = {
    user,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
