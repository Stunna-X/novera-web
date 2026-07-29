import { useNavigate, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import JobForm from "../../components/jobs/JobForm";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useJob from "../../hooks/useJob";
import useWorkspace from "../../hooks/useWorkspace";
import { updateJob } from "../../services/job-service";
import { getApiErrorMessage } from "../../utils/api-errors";

export default function EditJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { activeOrganizationId, hasPermission, isLoading: workspaceLoading } = useWorkspace();
  const { job, loading, error } = useJob({
    organizationId: activeOrganizationId,
    jobId,
    enabled: Boolean(activeOrganizationId),
  });

  if (workspaceLoading || loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo={`/jobs/${jobId}/edit`} />;
  if (!hasPermission("work_orders.update")) {
    return <AccessDenied description="Your current workspace role does not include work_orders.update." />;
  }
  if (error) return <Alert variant="error">{getApiErrorMessage(error, "Unable to load this job.")}</Alert>;
  if (!job) return null;

  async function handleUpdate(payload) {
    await updateJob(activeOrganizationId, jobId, payload);
    navigate(`/jobs/${jobId}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">{job.work_order_number}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Edit job</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Update job details without bypassing the dedicated status workflow.</p>
      </header>
      <JobForm
        organizationId={activeOrganizationId}
        mode="edit"
        initialJob={job}
        canCreateCustomers={hasPermission("customers.create")}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
