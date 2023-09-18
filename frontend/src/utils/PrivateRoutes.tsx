import { Navigate, Outlet } from "react-router-dom";
import { User } from "../models/User";

const PrivateRoutes = ({ user }: { user: User | null }) => {
  if (user === null) return null;

  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PrivateRoutes;
