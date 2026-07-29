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
import ModulePage from "./pages/dashboard/ModulePage";
import CreateJobPage from "./pages/jobs/CreateJobPage";
import EditJobPage from "./pages/jobs/EditJobPage";
import JobDetailsPage from "./pages/jobs/JobDetailsPage";
import JobsPage from "./pages/jobs/JobsPage";
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
            <Route path="/teams" element={<ModulePage eyebrow="Workforce" title="Teams" description="Manage field crews, assignments, availability, roles, and permissions." />} />
            <Route path="/equipment" element={<ModulePage eyebrow="Assets" title="Equipment" description="Track operational assets, availability, maintenance state, and job allocation." />} />
            <Route path="/inventory" element={<ModulePage eyebrow="Materials" title="Inventory" description="Monitor stock, movements, reorder levels, and field consumption." />} />
            <Route path="/settings" element={<WorkspaceSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
