import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Drill,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import EquipmentEmptyState from "../../components/equipment/EquipmentEmptyState";
import EquipmentFilters from "../../components/equipment/EquipmentFilters";
import EquipmentTable from "../../components/equipment/EquipmentTable";
import AccessDenied from "../../components/feedback/AccessDenied";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useAssets from "../../hooks/useAssets";
import useTeamDashboard from "../../hooks/useTeamDashboard";
import useWorkspace from "../../hooks/useWorkspace";
import { getApiErrorMessage } from "../../utils/api-errors";

const defaultFilters = {
  search: "",
  status: "",
  assetType: "",
  availableOnly: false,
  includeInactive: false,
};

function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-600">{note}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const {
    activeOrganizationId,
    activeOrganizationDisplayName,
    isLoading: workspaceLoading,
    hasPermission,
  } = useWorkspace();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(filters.search);
  const pageSize = 20;
  const canRead = hasPermission("assets.read");
  const canCreate = hasPermission("assets.create");
  const canReadDashboard = hasPermission("work_orders.read");

  useEffect(() => setPage(1), [
    deferredSearch,
    filters.assetType,
    filters.availableOnly,
    filters.includeInactive,
    filters.status,
  ]);

  const { items, total, loading, error, reload } = useAssets({
    organizationId: activeOrganizationId,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    search: deferredSearch,
    status: filters.status,
    assetType: filters.assetType,
    availableOnly: filters.availableOnly,
    includeInactive: filters.includeInactive,
    enabled: Boolean(activeOrganizationId && canRead),
  });

  const { dashboard, loading: dashboardLoading, reload: reloadDashboard } =
    useTeamDashboard({
      organizationId: activeOrganizationId,
      enabled: Boolean(activeOrganizationId && canReadDashboard),
    });

  const workloadByAssetId = useMemo(
    () =>
      new Map(
        (Array.isArray(dashboard?.assets) ? dashboard.assets : []).map((asset) => [
          asset.asset_id,
          asset,
        ]),
      ),
    [dashboard?.assets],
  );

  function refreshAll() {
    reload();
    if (canReadDashboard) reloadDashboard();
  }

  if (workspaceLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }
  if (!activeOrganizationId) {
    return <WorkspaceEmptyState returnTo="/equipment" />;
  }
  if (!canRead) {
    return (
      <AccessDenied description="Your workspace role does not allow equipment records to be viewed." />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(
    filters.search ||
      filters.status ||
      filters.assetType ||
      filters.availableOnly ||
      filters.includeInactive,
  );
  const visibleMaintenanceCount = items.filter(
    (asset) => asset.status === "maintenance",
  ).length;
  const visibleInUseCount = items.filter((asset) => asset.status === "in_use").length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/55 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Asset operations
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Equipment
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Register rigs, pumps, vehicles, generators, machines, and tools used by {activeOrganizationDisplayName}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refreshAll}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Refresh equipment"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {canCreate ? (
            <Link
              to="/equipment/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              <Plus className="h-4 w-4" /> Register equipment
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Drill}
          label="Active assets"
          value={dashboardLoading ? "—" : dashboard?.active_asset_count ?? total}
          note="Active equipment records"
        />
        <MetricCard
          icon={CircleCheckBig}
          label="Available"
          value={dashboardLoading ? "—" : dashboard?.available_asset_count ?? "—"}
          note="Ready for job assignment"
        />
        <MetricCard
          icon={Wrench}
          label="In maintenance"
          value={visibleMaintenanceCount}
          note="On the current result page"
        />
        <MetricCard
          icon={ShieldCheck}
          label="In use"
          value={visibleInUseCount}
          note="On the current result page"
        />
      </section>

      <EquipmentFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {error ? (
        <Alert variant="error">
          {getApiErrorMessage(error, "Unable to load equipment records.")}
        </Alert>
      ) : null}

      {loading && items.length === 0 ? (
        <div className="h-72 animate-pulse rounded-2xl bg-slate-900/60" />
      ) : items.length > 0 ? (
        <EquipmentTable assets={items} workloadByAssetId={workloadByAssetId} />
      ) : (
        <EquipmentEmptyState filtered={filtered} canCreate={canCreate} />
      )}

      {items.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} assets
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-800 px-3 font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span>Page {page} of {pageCount}</span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-800 px-3 font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
