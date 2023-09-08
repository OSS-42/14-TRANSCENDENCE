import {
  useContext,
  useState,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { User } from "../models/User";
import Cookies from "js-cookie";
import { getCookies, bearerAuthorization } from "../utils";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  loading: boolean;
  user: User | null;
  isLogged: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  const login = () => {
    console.log("Logging in");
    setTimeout(() => {
      window.location.reload();
    }, 500);
    fetchUserData();
  };

  const logout = () => {
    console.log("Logging out");
    Cookies.remove("jwt_token");
    setUser(null);
    setIsLogged(false);
    window.location.href = "/welcome";
  };

  const contextData = {
    loading,
    user,
    isLogged,
    login,
    logout,
  };

  async function fetchUserData() {
    const jwtToken = getCookies("jwt_token");
    if (jwtToken && !isLogged) {
      try {
        const response = await axios.get("/api/users/me", {
          headers: {
            Authorization: bearerAuthorization(jwtToken),
          },
        });
        setUser({ ...response.data, jwtToken: jwtToken });
        setIsLogged(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else if (!jwtToken && isLogged) {
      logout();
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUserData();
  }, [user, isLogged]);

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
