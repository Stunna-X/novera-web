import {
  ArrowLeft,
  BriefcaseBusiness,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import CustomerSitesPanel from "../../components/customers/CustomerSitesPanel";
import CustomerStatusBadge from "../../components/customers/CustomerStatusBadge";
import CustomerTypeBadge from "../../components/customers/CustomerTypeBadge";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useCustomer from "../../hooks/useCustomer";
import useCustomerSites from "../../hooks/useCustomerSites";
import useWorkspace from "../../hooks/useWorkspace";
import {
  deactivateCustomer,
  deactivateCustomerSite,
  reactivateCustomer,
  reactivateCustomerSite,
} from "../../services/customer-service";
import { listJobs } from "../../services/job-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { formatDateTime } from "../../utils/job-utils";

function addressLines(customer) {
  const first = [customer.address_line_1, customer.address_line_2].filter(Boolean).join(", ");
  const second = [customer.city, customer.state, customer.postal_code].filter(Boolean).join(", ");
  return [first, second, customer.country].filter(Boolean);
}

export default function CustomerDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { activeOrganizationId, hasPermission, isLoading: workspaceLoading } = useWorkspace();
  const canRead = hasPermission("customers.read");
  const canCreate = hasPermission("customers.create");
  const canUpdate = hasPermission("customers.update");
  const canDelete = hasPermission("customers.delete");
  const canReadJobs = hasPermission("work_orders.read");
  const canCreateJobs = hasPermission("work_orders.create");

  const { customer, loading, error, reload } = useCustomer({ organizationId: activeOrganizationId, customerId, enabled: Boolean(activeOrganizationId && canRead) });
  const { items: sites, loading: sitesLoading, error: sitesError, reload: reloadSites } = useCustomerSites({ organizationId: activeOrganizationId, customerId, includeInactive: true, enabled: Boolean(activeOrganizationId && canRead) });
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [recordAction, setRecordAction] = useState(false);
  const [siteActionId, setSiteActionId] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!activeOrganizationId || !customerId || !canReadJobs) {
      setJobs([]);
      setJobsError(null);
      return undefined;
    }

    const controller = new AbortController();
    setJobsLoading(true);
    setJobsError(null);

    listJobs(
      activeOrganizationId,
      { customer_id: customerId, limit: 8, include_inactive: true },
      { signal: controller.signal },
    )
      .then((payload) => setJobs(Array.isArray(payload?.items) ? payload.items : []))
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setJobsError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setJobsLoading(false);
      });

    return () => controller.abort();
  }, [activeOrganizationId, canReadJobs, customerId]);

  if (workspaceLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo={`/customers/${customerId}`} />;
  if (!canRead) return <AccessDenied description="Your workspace role does not allow customer records to be viewed." />;
  if (loading) return <div className="h-[620px] animate-pulse rounded-3xl bg-slate-900/60" />;
  if (error) return <Alert variant="error">{getApiErrorMessage(error, "Unable to load this customer.")}</Alert>;
  if (!customer) return null;

  async function handleDeactivateCustomer() {
    if (!window.confirm(`Deactivate ${customer.name}? Existing operational history will remain available.`)) return;
    setRecordAction(true);
    setActionError(null);
    try {
      await deactivateCustomer(activeOrganizationId, customerId);
      reload();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setRecordAction(false);
    }
  }

  async function handleReactivateCustomer() {
    setRecordAction(true);
    setActionError(null);
    try {
      await reactivateCustomer(activeOrganizationId, customerId);
      reload();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setRecordAction(false);
    }
  }

  async function handleDeactivateSite(site) {
    if (!window.confirm(`Deactivate ${site.name}?`)) return;
    setSiteActionId(site.id);
    setActionError(null);
    try {
      await deactivateCustomerSite(activeOrganizationId, customerId, site.id);
      reloadSites();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setSiteActionId(null);
    }
  }

  async function handleReactivateSite(site) {
    setSiteActionId(site.id);
    setActionError(null);
    try {
      await reactivateCustomerSite(activeOrganizationId, customerId, site.id);
      reloadSites();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setSiteActionId(null);
    }
  }

  const lines = addressLines(customer);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-emerald-950/25 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <button type="button" onClick={() => navigate("/customers")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Customers
            </button>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <CustomerTypeBadge type={customer.customer_type} />
              <CustomerStatusBadge active={customer.is_active} />
            </div>
            <h1 className="mt-4 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">{customer.name}</h1>
            <p className="mt-3 text-sm text-slate-500">Customer since {formatDateTime(customer.created_at)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { reload(); reloadSites(); }} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Refresh customer">
              <RefreshCw className="h-4 w-4" />
            </button>
            {canCreateJobs && customer.is_active ? (
              <Link to="/jobs/new" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
                <Plus className="h-4 w-4" /> New job
              </Link>
            ) : null}
            {canUpdate ? (
              <Link to={`/customers/${customerId}/edit`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                <Edit3 className="h-4 w-4" /> Edit
              </Link>
            ) : null}
            {customer.is_active && canDelete ? (
              <Button variant="danger" loading={recordAction} onClick={handleDeactivateCustomer}>
                <Power className="h-4 w-4" /> Deactivate
              </Button>
            ) : null}
            {!customer.is_active && canUpdate ? (
              <Button variant="secondary" loading={recordAction} onClick={handleReactivateCustomer}>
                <RotateCcw className="h-4 w-4" /> Reactivate
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {actionError ? <Alert variant="error">{getApiErrorMessage(actionError, "Unable to complete that action.")}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            <h2 className="font-semibold text-white">Contact details</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-4 w-4 text-emerald-300" />
                <div><p className="text-xs uppercase tracking-[0.14em] text-slate-600">Primary contact</p><p className="mt-1 text-slate-300">{customer.contact_name || "Not recorded"}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-emerald-300" />
                <div><p className="text-xs uppercase tracking-[0.14em] text-slate-600">Email</p><p className="mt-1 break-all text-slate-300">{customer.email || "Not recorded"}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-emerald-300" />
                <div><p className="text-xs uppercase tracking-[0.14em] text-slate-600">Phone</p><p className="mt-1 text-slate-300">{[customer.phone, customer.alternate_phone].filter(Boolean).join(" · ") || "Not recorded"}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-300" />
                <div><p className="text-xs uppercase tracking-[0.14em] text-slate-600">Address</p>{lines.length ? lines.map((line) => <p key={line} className="mt-1 text-slate-300">{line}</p>) : <p className="mt-1 text-slate-300">Not recorded</p>}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            <h2 className="font-semibold text-white">Internal notes</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">{customer.notes || "No customer notes recorded."}</p>
          </section>
        </div>

        <CustomerSitesPanel
          customerId={customerId}
          sites={sites}
          loading={sitesLoading}
          error={sitesError}
          canCreate={canCreate && customer.is_active}
          canUpdate={canUpdate}
          canDelete={canDelete}
          actionId={siteActionId}
          onDeactivate={handleDeactivateSite}
          onReactivate={handleReactivateSite}
        />
      </div>

      {canReadJobs ? (
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
            <div>
              <h2 className="font-semibold text-white">Recent jobs</h2>
              <p className="mt-1 text-xs text-slate-500">Operational work linked to this customer.</p>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">View all</Link>
          </div>
          <div className="p-5">
            {jobsError ? <Alert variant="error">{getApiErrorMessage(jobsError, "Unable to load customer jobs.")}</Alert> : null}
            {jobsLoading ? <div className="h-24 animate-pulse rounded-xl bg-slate-800/60" /> : null}
            {!jobsLoading && jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 px-5 py-9 text-center">
                <BriefcaseBusiness className="mx-auto h-6 w-6 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">No jobs recorded for this customer.</p>
              </div>
            ) : null}
            <div className="divide-y divide-slate-800">
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="flex flex-col gap-2 py-4 transition hover:bg-slate-800/25 sm:flex-row sm:items-center sm:justify-between sm:px-2">
                  <div><p className="font-medium text-white">{job.title}</p><p className="mt-1 text-xs text-slate-500">{job.work_order_number || "Job"} · {job.job_type || "General field work"}</p></div>
                  <div className="text-left sm:text-right"><p className="text-xs font-semibold capitalize text-slate-300">{String(job.status || "draft").replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-600">{job.scheduled_start ? formatDateTime(job.scheduled_start) : "Not scheduled"}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
