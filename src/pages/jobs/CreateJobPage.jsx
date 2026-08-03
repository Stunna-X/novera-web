import { useNavigate } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import JobForm from "../../components/jobs/JobForm";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useWorkspace from "../../hooks/useWorkspace";
import { createJob } from "../../services/job-service";

export default function CreateJobPage() {
  const { activeOrganizationId, hasPermission, isLoading } = useWorkspace();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />
    );
  }

  if (!activeOrganizationId) {
    return <WorkspaceEmptyState returnTo="/jobs/new" />;
  }

  if (!hasPermission("work_orders.create")) {
    return (
      <AccessDenied description="Your current workspace role cannot create jobs." />
    );
  }

  async function handleCreate(payload) {
    const job = await createJob(activeOrganizationId, payload);
    navigate(`/jobs/${job.id}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Operations
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Create job
        </h1>
      </header>

      <JobForm
        organizationId={activeOrganizationId}
        mode="create"
        canCreateCustomers={hasPermission("customers.create")}
        onSubmit={handleCreate}
      />
    </div>
  );
}