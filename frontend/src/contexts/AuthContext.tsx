import {
  useContext,
  useState,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { User } from "../models/User";
import { bearerAuthorization } from "../utils";

interface AuthProviderProps {
  children: ReactNode;
  token: string;
}

interface AuthContextType {
  user: User | null;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
  token,
}: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User>({} as User);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get("http://localhost:3001/users/me", {
          headers: {
            Authorization: bearerAuthorization(token),
          },
        });
        setUser({ ...response.data, jwtToken: token });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  const logoutUser = () => {};

  const contextData = {
    user,
    logoutUser,
  };
  console.log(user);
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
