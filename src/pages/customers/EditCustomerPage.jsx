import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import CustomerForm from "../../components/customers/CustomerForm";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useCustomer from "../../hooks/useCustomer";
import useWorkspace from "../../hooks/useWorkspace";
import { updateCustomer } from "../../services/customer-service";
import { getApiErrorMessage } from "../../utils/api-errors";

export default function EditCustomerPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { activeOrganizationId, hasPermission, isLoading: workspaceLoading } = useWorkspace();
  const canRead = hasPermission("customers.read");
  const canUpdate = hasPermission("customers.update");
  const { customer, loading, error } = useCustomer({ organizationId: activeOrganizationId, customerId, enabled: Boolean(activeOrganizationId && canRead) });

  if (workspaceLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo={`/customers/${customerId}/edit`} />;
  if (!canRead || !canUpdate) return <AccessDenied description="Your workspace role does not allow this customer to be edited." />;
  if (loading) return <div className="h-[560px] animate-pulse rounded-3xl bg-slate-900/60" />;
  if (error) return <Alert variant="error">{getApiErrorMessage(error, "Unable to load this customer.")}</Alert>;
  if (!customer) return null;

  async function handleSubmit(payload) {
    await updateCustomer(activeOrganizationId, customerId, payload);
    navigate(`/customers/${customerId}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link to={`/customers/${customerId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to customer
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Relationships</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Edit customer</h1>
        <p className="mt-3 text-sm text-slate-500">Update account, contact, and address information.</p>
      </div>
      <CustomerForm initialCustomer={customer} submitLabel="Save customer" onSubmit={handleSubmit} onCancel={() => navigate(`/customers/${customerId}`)} />
    </div>
  );
}
