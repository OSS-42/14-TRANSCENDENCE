import {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactNode,
} from "react";

import { User } from "../models/User";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: User | boolean;
  loginUser: (userInfo: string) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState<User | null>(null);
  const [user, setUser] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const loginUser = (userInfo: string) => {};

  const logoutUser = () => {};

  const checkUserStatus = () => {};

  const contextData = {
    user,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
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
