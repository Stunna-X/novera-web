import { Navigate, Outlet, useLocation } from "react-router";

import useAuth from "../../hooks/useAuth";
import LoadingScreen from "../feedback/LoadingScreen";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Restoring your Novera workspace" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
