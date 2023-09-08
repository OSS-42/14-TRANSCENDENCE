import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoutes = () => {
  const { user } = useAuth();

  if (user === null) return null;
  return user ? <Outlet /> : <Navigate to="/welcome" />;
};

export default PrivateRoutes;
