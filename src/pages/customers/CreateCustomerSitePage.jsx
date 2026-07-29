import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import SiteForm from "../../components/customers/SiteForm";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useCustomer from "../../hooks/useCustomer";
import useWorkspace from "../../hooks/useWorkspace";
import { createCustomerSite } from "../../services/customer-service";
import { getApiErrorMessage } from "../../utils/api-errors";

export default function CreateCustomerSitePage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { activeOrganizationId, hasPermission, isLoading: workspaceLoading } = useWorkspace();
  const canRead = hasPermission("customers.read");
  const canCreate = hasPermission("customers.create");
  const { customer, loading, error } = useCustomer({ organizationId: activeOrganizationId, customerId, enabled: Boolean(activeOrganizationId && canRead) });

  if (workspaceLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo={`/customers/${customerId}/sites/new`} />;
  if (!canRead || !canCreate) return <AccessDenied description="Your workspace role does not allow customer sites to be created." />;
  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (error) return <Alert variant="error">{getApiErrorMessage(error, "Unable to load this customer.")}</Alert>;

  async function handleSubmit(payload) {
    await createCustomerSite(activeOrganizationId, customerId, payload);
    navigate(`/customers/${customerId}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link to={`/customers/${customerId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to customer
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Operational location</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Add site</h1>
        <p className="mt-3 text-sm text-slate-500">Create a work location for {customer?.name || "this customer"}.</p>
      </div>
      <SiteForm submitLabel="Create site" onSubmit={handleSubmit} onCancel={() => navigate(`/customers/${customerId}`)} />
    </div>
  );
}
