import {
  useContext,
  useState,
  createContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { getCookies, bearerAuthorization } from "../utils";
import { User } from "../models/User";
import { useRoutes } from "./RoutesContext";
// import { twoFactorValidationStatus } from "../api/requests";

// Define constants
const JWT_TOKEN_COOKIE = "jwt_token";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  loading: boolean;
  user: User | null;
  tkn: string | null;
  isLogged: boolean;
  login: () => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [tkn, setTkn] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [is2FA, setIs2FA] = useState(false);
  const [is2FAValidated, setIs2FAValidated] = useState(false);
  const { navigateTo } = useRoutes();

  const login = async () => {
    console.log("Logging in. Hello!");

    try {
      await fetchUserData();

      redirectToHome();
    } catch (error) {
      redirectToWelcome();
    }
  };

  const logout = () => {
    console.log("Logging out. Bye!");
    Cookies.remove(JWT_TOKEN_COOKIE);
    localStorage.clear();
    setUser(null);
    setIsLogged(false);
    setLoading(false);
    redirectToWelcome();
    // twoFactorValidationStatus(false);
  };

  const fetchUserData = async () => {
    const jwtToken = getCookies("jwt_token");

    if (jwtToken && !isLogged) {
      try {
        const response = await axios.get("/api/users/me", {
          headers: {
            Authorization: bearerAuthorization(jwtToken),
          },
        });

        setUser({ ...response.data, jwtToken: jwtToken });
      	setTkn(jwtToken);

        // if (response.data.is2FA && response.data.is2FAValidated === false) {
        //   setIs2FA(true);
        //   navigateTo("TwoFactor");
        // }
        
        setIsLogged(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else if ((!jwtToken || tkn !== jwtToken) && isLogged) {
      logout();
    }
    setLoading(false);
  };

  const redirectToHome = () => {
    navigateTo("/");
  };

  const redirectToWelcome = () => {
    navigateTo("/welcome");
  };

  useEffect(() => {
    fetchUserData();
  }, [user, isLogged]);

  const contextData = useMemo(() => {
    return {
      loading,
      user,
      isLogged,
      tkn,
      login,
      logout,
      fetchUserData,
      setUser,
      is2FA,
      is2FAValidated,
      setIs2FAValidated,
    };
  }, [
    loading,
    user,
    isLogged,
    tkn,
    login,
    setUser,
    logout,
    fetchUserData,
    is2FA,
    is2FAValidated,
    setIs2FAValidated,
  ]);

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
