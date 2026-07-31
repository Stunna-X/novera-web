import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Edit3,
  ExternalLink,
  Gauge,
  MapPin,
  Power,
  RefreshCw,
  RotateCcw,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import AssetConditionBadge from "../../components/equipment/AssetConditionBadge";
import AssetStatusBadge from "../../components/equipment/AssetStatusBadge";
import ReportAssetIssueDialog from "../../components/equipment/ReportAssetIssueDialog";
import ResolveAssetIssueDialog from "../../components/equipment/ResolveAssetIssueDialog";
import AccessDenied from "../../components/feedback/AccessDenied";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useAsset from "../../hooks/useAsset";
import useTeamDashboard from "../../hooks/useTeamDashboard";
import useWorkspace from "../../hooks/useWorkspace";
import { deactivateAsset, reactivateAsset } from "../../services/asset-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import {
  getAssetIssueJobLabel,
  isAssetIssueResolved,
  splitAssetNotes,
} from "../../utils/asset-issues";
import {
  formatAssetDate,
  formatAssetDateTime,
  humanizeAssetValue,
} from "../../utils/asset-utils";

const severityClasses = {
  low: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  high: "border-orange-400/20 bg-orange-400/10 text-orange-200",
  critical: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

function DetailCard({ icon: Icon, label, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}

function RelatedJob({ issue }) {
  const label = getAssetIssueJobLabel(issue);
  if (!label) return null;

  if (issue.related_job_id) {
    return (
      <Link
        to={`/jobs/${issue.related_job_id}`}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
      >
        Related job: {label}
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    );
  }

  return <p className="mt-3 text-xs text-slate-500">Related job: {label}</p>;
}

function IssueHistory({ issues, canResolve, onResolve }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="border-b border-slate-800 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <AlertTriangle className="h-4 w-4 text-amber-300" /> Issue and
          maintenance history
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Field problems and their recorded resolutions.
        </p>
      </div>

      {issues.length ? (
        <div className="divide-y divide-slate-800">
          {issues.map((issue) => {
            const resolved = isAssetIssueResolved(issue);

            return (
              <article key={issue.id || issue.reported_at} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          severityClasses[issue.severity] || severityClasses.medium
                        }`}
                      >
                        {humanizeAssetValue(issue.severity, "Medium")}
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                        {humanizeAssetValue(
                          issue.resulting_status,
                          "Status unchanged",
                        )}
                      </span>
                      <span
                        className={
                          resolved
                            ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200"
                            : "rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200"
                        }
                      >
                        {resolved ? "Resolved" : "Open"}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {issue.description}
                    </p>
                    <RelatedJob issue={issue} />

                    {resolved ? (
                      <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                          <Wrench className="h-3.5 w-3.5" /> Resolution
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {issue.resolution_note}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                          <span>
                            Status: {humanizeAssetValue(issue.resolution_status)}
                          </span>
                          <span>
                            Condition: {humanizeAssetValue(
                              issue.resolution_condition,
                            )}
                          </span>
                          <span>
                            Completed: {formatAssetDate(
                              issue.resolution_service_date || issue.resolved_at,
                            )}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <time className="text-xs text-slate-600">
                      {formatAssetDateTime(issue.reported_at)}
                    </time>
                    {resolved ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {formatAssetDateTime(issue.resolved_at)}
                      </div>
                    ) : canResolve ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onResolve(issue)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Resolve issue
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-300">
            No equipment issues reported
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Report a problem when one is discovered during inspection or field
            work.
          </p>
        </div>
      )}
    </section>
  );
}

export default function AssetDetailsPage() {
  const { assetId } = useParams();
  const {
    activeOrganizationId,
    isLoading: workspaceLoading,
    hasPermission,
  } = useWorkspace();
  const canRead = hasPermission("assets.read");
  const canUpdate = hasPermission("assets.update");
  const canDelete = hasPermission("assets.delete");
  const canReadJobs = hasPermission("work_orders.read");
  const { asset, setAsset, loading, error, reload } = useAsset({
    organizationId: activeOrganizationId,
    assetId,
    enabled: Boolean(activeOrganizationId && canRead),
  });
  const { dashboard, reload: reloadDashboard } = useTeamDashboard({
    organizationId: activeOrganizationId,
    enabled: Boolean(activeOrganizationId && canReadJobs),
  });
  const [action, setAction] = useState("");
  const [actionError, setActionError] = useState(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueToResolve, setIssueToResolve] = useState(null);
  const [copied, setCopied] = useState(false);

  const workload = useMemo(
    () =>
      (Array.isArray(dashboard?.assets) ? dashboard.assets : []).find(
        (item) => item.asset_id === assetId,
      ) || null,
    [assetId, dashboard?.assets],
  );

  const parsedNotes = useMemo(
    () => splitAssetNotes(asset?.notes),
    [asset?.notes],
  );

  if (workspaceLoading || loading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }
  if (!activeOrganizationId) {
    return <WorkspaceEmptyState returnTo={`/equipment/${assetId}`} />;
  }
  if (!canRead) {
    return (
      <AccessDenied description="Your workspace role does not allow equipment records to be viewed." />
    );
  }
  if (error || !asset) {
    return (
      <Alert variant="error">
        {getApiErrorMessage(error, "Unable to load this equipment record.")}
      </Alert>
    );
  }

  async function handleDeactivate() {
    if (!window.confirm(`Deactivate ${asset.name}?`)) return;

    setAction("deactivate");
    setActionError(null);

    try {
      await deactivateAsset(activeOrganizationId, assetId);
      await reload();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setAction("");
    }
  }

  async function handleReactivate() {
    setAction("reactivate");
    setActionError(null);

    try {
      const updated = await reactivateAsset(activeOrganizationId, assetId);
      setAsset(updated);
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setAction("");
    }
  }

  async function handleCopyReference() {
    try {
      await navigator.clipboard.writeText(asset.asset_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function refreshAll() {
    reload();
    if (canReadJobs) reloadDashboard();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/equipment"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Equipment
        </Link>
        <button
          type="button"
          onClick={refreshAll}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Refresh equipment details"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {actionError ? (
        <Alert variant="error">
          {getApiErrorMessage(actionError, "Unable to complete this action.")}
        </Alert>
      ) : null}

      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/75 to-emerald-950/25 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:text-emerald-200"
                title="Copy equipment reference"
              >
                {asset.asset_code}
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Clipboard className="h-3.5 w-3.5" />
                )}
              </button>
              {!asset.is_active ? (
                <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-200">
                  Deactivated record
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {asset.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {humanizeAssetValue(asset.asset_type)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <AssetStatusBadge status={asset.status} />
              <AssetConditionBadge condition={asset.condition} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate && asset.is_active ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIssueDialogOpen(true)}
              >
                <AlertTriangle className="h-4 w-4" /> Report issue
              </Button>
            ) : null}
            {canUpdate && asset.is_active ? (
              <Link
                to={`/equipment/${assetId}/edit`}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-400 px-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </Link>
            ) : null}
            {canDelete && asset.is_active ? (
              <Button
                variant="danger"
                size="sm"
                loading={action === "deactivate"}
                onClick={handleDeactivate}
              >
                <Power className="h-4 w-4" /> Deactivate
              </Button>
            ) : null}
            {canUpdate && !asset.is_active ? (
              <Button
                variant="secondary"
                size="sm"
                loading={action === "reactivate"}
                onClick={handleReactivate}
              >
                <RotateCcw className="h-4 w-4" /> Reactivate
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DetailCard icon={MapPin} label="Location">
          <p className="font-semibold text-white">
            {asset.location || "No location recorded"}
          </p>
        </DetailCard>
        <DetailCard icon={CalendarDays} label="Last service">
          <p className="font-semibold text-white">
            {formatAssetDate(asset.last_service_date)}
          </p>
        </DetailCard>
        <DetailCard icon={Gauge} label="Assignment workload">
          <p className="font-semibold text-white">
            {workload
              ? `${workload.open_assignment_count} open`
              : "Not available"}
          </p>
        </DetailCard>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <IssueHistory
            issues={parsedNotes.issues}
            canResolve={canUpdate && asset.is_active}
            onResolve={setIssueToResolve}
          />

          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ClipboardList className="h-4 w-4 text-emerald-300" /> Internal
              notes
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {parsedNotes.notes || "No internal equipment notes recorded."}
            </p>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarDays className="h-4 w-4 text-emerald-300" /> Record
            history
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-slate-600">
                Created
              </dt>
              <dd className="mt-1 text-slate-300">
                {formatAssetDateTime(asset.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-slate-600">
                Last updated
              </dt>
              <dd className="mt-1 text-slate-300">
                {formatAssetDateTime(asset.updated_at)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <ReportAssetIssueDialog
        open={issueDialogOpen}
        organizationId={activeOrganizationId}
        asset={asset}
        canReadJobs={canReadJobs}
        onClose={() => setIssueDialogOpen(false)}
        onReported={setAsset}
      />

      <ResolveAssetIssueDialog
        open={Boolean(issueToResolve)}
        organizationId={activeOrganizationId}
        asset={asset}
        issue={issueToResolve}
        issues={parsedNotes.issues}
        onClose={() => setIssueToResolve(null)}
        onResolved={setAsset}
      />
    </div>
  );
}
