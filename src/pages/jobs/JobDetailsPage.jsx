import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Power,
  RefreshCw,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import JobActivityTimeline from "../../components/jobs/JobActivityTimeline";
import JobAssignments from "../../components/jobs/JobAssignments";
import JobMaterialsReadiness from "../../components/jobs/JobMaterialsReadiness";
import JobPriorityBadge from "../../components/jobs/JobPriorityBadge";
import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import StatusChangeDialog from "../../components/jobs/StatusChangeDialog";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useJob from "../../hooks/useJob";
import useWorkspace from "../../hooks/useWorkspace";
import {
  changeJobStatus,
  deactivateJob,
  listJobActivities,
  reactivateJob,
} from "../../services/job-service";
import { getCustomer, getCustomerSite } from "../../services/organization-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { formatCurrency, resolveWorkspaceCurrency } from "../../utils/currency";
import {
  formatDateTime,
  humanize,
} from "../../utils/job-utils";

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-3 text-sm font-medium text-slate-200">{children}</div>
    </div>
  );
}

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const {
    activeOrganization,
    activeOrganizationId,
    hasPermission,
    isLoading: workspaceLoading,
  } = useWorkspace();
  const { job, loading, error, reload } = useJob({
    organizationId: activeOrganizationId,
    jobId,
    enabled: Boolean(activeOrganizationId && hasPermission("work_orders.read")),
  });
  const [customer, setCustomer] = useState(null);
  const [site, setSite] = useState(null);
  const [customerLoadError, setCustomerLoadError] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadActivities = useCallback(async () => {
    if (!activeOrganizationId || !jobId) return;
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const payload = await listJobActivities(activeOrganizationId, jobId, {
        limit: 100,
        include_inactive_work_order: true,
      });
      setActivities(Array.isArray(payload?.items) ? payload.items : []);
    } catch (requestError) {
      setActivitiesError(requestError);
    } finally {
      setActivitiesLoading(false);
    }
  }, [activeOrganizationId, jobId]);

  useEffect(() => {
    if (!job || !activeOrganizationId) return undefined;

    let active = true;

    setCustomer(null);
    setSite(null);
    setCustomerLoadError(false);

    Promise.all([
      getCustomer(
        activeOrganizationId,
        job.customer_id,
        { includeInactive: true },
      ),
      job.customer_site_id
        ? getCustomerSite(
            activeOrganizationId,
            job.customer_id,
            job.customer_site_id,
            { includeInactive: true },
          ).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([customerPayload, sitePayload]) => {
        if (!active) return;

        setCustomer(customerPayload);
        setSite(sitePayload);
      })
      .catch(() => {
        if (!active) return;

        setCustomer(null);
        setSite(null);
        setCustomerLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [activeOrganizationId, job]);
  useEffect(() => {
    if (job) loadActivities();
  }, [job, loadActivities]);

  if (workspaceLoading || loading) return <div className="h-[520px] animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo={`/jobs/${jobId}`} />;
  if (!hasPermission("work_orders.read")) {
    return <AccessDenied description="Your current workspace role does not include work_orders.read." />;
  }
  if (error) return <Alert variant="error">{getApiErrorMessage(error, "Unable to load this job.")}</Alert>;
  if (!job) return null;

  const canUpdate = hasPermission("work_orders.update");
  const canChangeStatus = hasPermission("work_orders.status");
  const canAssign = hasPermission("work_orders.assign");
  const canDelete = hasPermission("work_orders.delete");
  const canReadCustomer = hasPermission("customers.read");
  const currencyCode = resolveWorkspaceCurrency(activeOrganization);

  async function handleStatus(payload) {
    await changeJobStatus(activeOrganizationId, job.id, payload);
    await Promise.all([reload(), loadActivities()]);
  }

  async function handleDeactivate() {
    setActionLoading(true);
    setActionError("");
    try {
      await deactivateJob(activeOrganizationId, job.id);
      setDeactivateOpen(false);
      reload();
      loadActivities();
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Unable to deactivate this job."));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate() {
    setActionLoading(true);
    setActionError("");
    try {
      await reactivateJob(activeOrganizationId, job.id);
      reload();
      loadActivities();
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Unable to reactivate this job."));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      {actionError && <Alert variant="error">{actionError}</Alert>}
      {!job.is_active && <Alert variant="error">This job is inactive. Reactivate it before making operational changes.</Alert>}

      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{job.work_order_number}</span>
              <JobStatusBadge status={job.status} />
              <JobPriorityBadge priority={job.priority} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{job.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{job.description || "No job description has been recorded."}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { reload(); loadActivities(); }}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Refresh job"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {canChangeStatus && job.is_active && (
              <Button variant="secondary" onClick={() => setStatusOpen(true)}>
                <CheckCircle2 className="h-4 w-4" /> Change status
              </Button>
            )}
            {canUpdate && job.is_active && (
              <Link to={`/jobs/${job.id}/edit`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                <Edit3 className="h-4 w-4" /> Edit
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Detail icon={MapPin} label="Customer and site">
          <div className="space-y-3">
            <div>
              {customer ? (
                canReadCustomer ? (
                  <Link
                    to={`/customers/${job.customer_id}`}
                    className="group inline-flex max-w-full items-center gap-1.5 font-semibold text-white transition hover:text-emerald-200"
                  >
                    <span className="truncate">
                      {customer.name}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ) : (
                  <p className="font-semibold text-white">
                    {customer.name}
                  </p>
                )
              ) : (
                <p className="font-semibold text-slate-400">
                  {customerLoadError
                    ? "Customer unavailable"
                    : "Loading customer..."}
                </p>
              )}

              <p className="mt-1 text-xs font-normal text-slate-500">
                {site?.name ||
                  (job.customer_site_id
                    ? "Site unavailable"
                    : "No specific site")}
              </p>

              {customer?.is_active === false && (
                <span className="mt-2 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                  Inactive customer
                </span>
              )}
            </div>

            {customer &&
              (customer.contact_name ||
                customer.phone ||
                customer.email) && (
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  {customer.contact_name && (
                    <p className="flex items-center gap-2 text-xs font-normal text-slate-400">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                      <span className="truncate">
                        {customer.contact_name}
                      </span>
                    </p>
                  )}

                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 text-xs font-normal text-slate-400 transition hover:text-emerald-200"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                      <span className="truncate">
                        {customer.phone}
                      </span>
                    </a>
                  )}

                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 text-xs font-normal text-slate-400 transition hover:text-emerald-200"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                      <span className="truncate">
                        {customer.email}
                      </span>
                    </a>
                  )}
                </div>
              )}
          </div>
        </Detail>
        <Detail icon={CalendarClock} label="Schedule">
          <p>{formatDateTime(job.scheduled_start)}</p>
          <p className="mt-1 text-xs font-normal text-slate-500">Ends {formatDateTime(job.scheduled_end)}</p>
        </Detail>
        <Detail icon={Tag} label="Job context">
          <p>{job.job_type || "General field work"}</p>
          <p className="mt-1 text-xs font-normal text-slate-500">{job.customer_reference || "No customer reference"}</p>
        </Detail>
        <Detail icon={CircleDollarSign} label={`Cost (${currencyCode})`}>
          <p>Estimated {formatCurrency(job.estimated_cost, currencyCode)}</p>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Actual {formatCurrency(job.actual_cost, currencyCode)}
          </p>
        </Detail>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]">
        <div className="space-y-6">
          {hasPermission("inventory.read") && (
            <JobMaterialsReadiness
              organizationId={activeOrganizationId}
              job={job}
              canManage={
                canUpdate &&
                hasPermission("inventory.read")
              }
              canRequestPurchase={hasPermission(
                "purchase_requisitions.create",
              )}
              currency={currencyCode}
              onChanged={loadActivities}
            />
          )}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><FileText className="h-4 w-4 text-emerald-300" /> Operational notes</div>
            <dl className="mt-5 space-y-5">
              <div><dt className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Instructions</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-400">{job.instructions || "No field instructions recorded."}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Completion notes</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-400">{job.completion_notes || "No completion notes recorded."}</dd></div>
              {job.cancellation_reason && <div><dt className="text-xs font-semibold uppercase tracking-[0.15em] text-rose-400">Cancellation reason</dt><dd className="mt-2 text-sm leading-7 text-slate-400">{job.cancellation_reason}</dd></div>}
            </dl>
          </section>

          <JobActivityTimeline activities={activities} loading={activitiesLoading} error={activitiesError} />
        </div>

        <div className="space-y-6">
          <JobAssignments
            organizationId={activeOrganizationId}
            job={job}
            canAssign={canAssign && job.is_active}
            canReadWorkforce={hasPermission("workforce.read")}
            canReadAssets={hasPermission("assets.read")}
            onChanged={async () => { reload(); loadActivities(); }}
          />

          {(canDelete || (!job.is_active && canUpdate)) && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-white">Record state</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Novera uses soft deletion so operational history remains auditable.</p>
              {job.is_active && canDelete ? (
                <Button variant="danger" className="mt-5 w-full" onClick={() => setDeactivateOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Deactivate job
                </Button>
              ) : !job.is_active && canUpdate ? (
                <Button className="mt-5 w-full" loading={actionLoading} onClick={handleReactivate}>
                  <Power className="h-4 w-4" /> Reactivate job
                </Button>
              ) : null}
            </section>
          )}
        </div>
      </section>

      <StatusChangeDialog open={statusOpen} job={job} onClose={() => setStatusOpen(false)} onSubmit={handleStatus} />

      <Modal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Deactivate job"
        description={`Deactivate ${job.work_order_number}? The record and activity history will remain available when inactive records are included.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
          <Button variant="danger" loading={actionLoading} onClick={handleDeactivate}>Deactivate</Button>
        </div>
      </Modal>
    </div>
  );
}
