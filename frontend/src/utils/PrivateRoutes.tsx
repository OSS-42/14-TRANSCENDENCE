import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoutes = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/welcome" />;
};

export default PrivateRoutes;
