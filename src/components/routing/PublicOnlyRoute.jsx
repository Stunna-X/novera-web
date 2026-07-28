import { Navigate, Outlet } from "react-router";

import useAuth from "../../hooks/useAuth";
import LoadingScreen from "../feedback/LoadingScreen";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading Novera" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
