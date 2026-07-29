import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import CustomerForm from "../../components/customers/CustomerForm";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useWorkspace from "../../hooks/useWorkspace";
import { createCustomer } from "../../services/customer-service";

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const { activeOrganizationId, hasPermission, isLoading } = useWorkspace();
  const canCreate = hasPermission("customers.create");

  if (isLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo="/customers/new" />;
  if (!canCreate) return <AccessDenied description="Your workspace role does not allow new customers to be created." />;

  async function handleSubmit(payload) {
    const customer = await createCustomer(activeOrganizationId, payload);
    navigate(`/customers/${customer.id}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link to="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Relationships</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Create customer</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Create a customer account first, then add operational sites and jobs.</p>
      </div>
      <CustomerForm submitLabel="Create customer" onSubmit={handleSubmit} onCancel={() => navigate("/customers")} />
    </div>
  );
}
