import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicOnlyRoute from "./components/routing/PublicOnlyRoute";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ModulePage from "./pages/dashboard/ModulePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/jobs"
              element={
                <ModulePage
                  eyebrow="Operations"
                  title="Jobs"
                  description="Plan, assign, monitor, and close field jobs from one operational workspace."
                />
              }
            />
            <Route
              path="/customers"
              element={
                <ModulePage
                  eyebrow="Relationships"
                  title="Customers"
                  description="Keep customer contacts, job history, sites, and commercial context organised."
                />
              }
            />
            <Route
              path="/teams"
              element={
                <ModulePage
                  eyebrow="Workforce"
                  title="Teams"
                  description="Manage field crews, assignments, availability, roles, and permissions."
                />
              }
            />
            <Route
              path="/equipment"
              element={
                <ModulePage
                  eyebrow="Assets"
                  title="Equipment"
                  description="Track operational assets, availability, maintenance state, and job allocation."
                />
              }
            />
            <Route
              path="/inventory"
              element={
                <ModulePage
                  eyebrow="Materials"
                  title="Inventory"
                  description="Monitor stock, movements, reorder levels, and field consumption."
                />
              }
            />
            <Route
              path="/settings"
              element={
                <ModulePage
                  eyebrow="Workspace"
                  title="Settings"
                  description="Configure your organisation, account, security, notifications, and preferences."
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
