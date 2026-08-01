import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicOnlyRoute from "./components/routing/PublicOnlyRoute";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CreateCustomerPage from "./pages/customers/CreateCustomerPage";
import CreateCustomerSitePage from "./pages/customers/CreateCustomerSitePage";
import CustomerDetailsPage from "./pages/customers/CustomerDetailsPage";
import CustomersPage from "./pages/customers/CustomersPage";
import EditCustomerPage from "./pages/customers/EditCustomerPage";
import EditCustomerSitePage from "./pages/customers/EditCustomerSitePage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AssetDetailsPage from "./pages/equipment/AssetDetailsPage";
import CreateAssetPage from "./pages/equipment/CreateAssetPage";
import EditAssetPage from "./pages/equipment/EditAssetPage";
import EquipmentPage from "./pages/equipment/EquipmentPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import CreateJobPage from "./pages/jobs/CreateJobPage";
import EditJobPage from "./pages/jobs/EditJobPage";
import JobDetailsPage from "./pages/jobs/JobDetailsPage";
import JobsPage from "./pages/jobs/JobsPage";
import CreateTeamMemberPage from "./pages/teams/CreateTeamMemberPage";
import EditTeamMemberPage from "./pages/teams/EditTeamMemberPage";
import TeamMemberDetailsPage from "./pages/teams/TeamMemberDetailsPage";
import TeamsPage from "./pages/teams/TeamsPage";
import WorkspaceSettingsPage from "./pages/workspace/WorkspaceSettingsPage";
import WorkspaceSetupPage from "./pages/workspace/WorkspaceSetupPage";

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
            <Route path="/workspace/setup" element={<WorkspaceSetupPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/new" element={<CreateJobPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/jobs/:jobId/edit" element={<EditJobPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<CreateCustomerPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
            <Route path="/customers/:customerId/edit" element={<EditCustomerPage />} />
            <Route path="/customers/:customerId/sites/new" element={<CreateCustomerSitePage />} />
            <Route path="/customers/:customerId/sites/:siteId/edit" element={<EditCustomerSitePage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/new" element={<CreateTeamMemberPage />} />
            <Route path="/teams/:profileId" element={<TeamMemberDetailsPage />} />
            <Route path="/teams/:profileId/edit" element={<EditTeamMemberPage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/equipment/new" element={<CreateAssetPage />} />
            <Route path="/equipment/:assetId" element={<AssetDetailsPage />} />
            <Route path="/equipment/:assetId/edit" element={<EditAssetPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/settings" element={<WorkspaceSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
