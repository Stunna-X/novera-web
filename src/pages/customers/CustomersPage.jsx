import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import CustomerFilters from "../../components/customers/CustomerFilters";
import CustomersEmptyState from "../../components/customers/CustomersEmptyState";
import CustomersTable from "../../components/customers/CustomersTable";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useCustomers from "../../hooks/useCustomers";
import useWorkspace from "../../hooks/useWorkspace";
import { getApiErrorMessage } from "../../utils/api-errors";

const defaultFilters = { search: "", includeInactive: false };

export default function CustomersPage() {
  const { activeOrganizationId, activeOrganizationDisplayName, isLoading: workspaceLoading, hasPermission } = useWorkspace();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(filters.search);
  const pageSize = 20;
  const canRead = hasPermission("customers.read");
  const canCreate = hasPermission("customers.create");

  useEffect(() => setPage(1), [deferredSearch, filters.includeInactive]);

  const { items, total, loading, error, reload } = useCustomers({
    organizationId: activeOrganizationId,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    search: deferredSearch,
    includeInactive: filters.includeInactive,
    enabled: Boolean(activeOrganizationId && canRead),
  });

  if (workspaceLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo="/customers" />;
  if (!canRead) return <AccessDenied description="Your workspace role does not allow customer records to be viewed." />;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(filters.search || filters.includeInactive);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/55 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Relationships</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Customers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Manage customer accounts, contacts, sites, and job history for {activeOrganizationDisplayName}.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reload} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Refresh customers">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {canCreate ? (
            <Link to="/customers/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              <Plus className="h-4 w-4" /> New customer
            </Link>
          ) : null}
        </div>
      </section>

      <CustomerFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
      {error ? <Alert variant="error">{getApiErrorMessage(error, "Unable to load customers.")}</Alert> : null}

      {loading && items.length === 0 ? (
        <div className="h-80 animate-pulse rounded-2xl bg-slate-900/60" />
      ) : items.length === 0 ? (
        <CustomersEmptyState canCreate={canCreate} filtered={filtered} />
      ) : (
        <CustomersTable customers={items} />
      )}

      {total > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} customers</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-700 px-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="px-2">Page {page} of {pageCount}</span>
            <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-700 px-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
