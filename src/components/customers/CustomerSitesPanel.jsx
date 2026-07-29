import { Edit3, MapPin, Plus, Power, RotateCcw } from "lucide-react";
import { Link } from "react-router";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import CustomerStatusBadge from "./CustomerStatusBadge";
import { getApiErrorMessage } from "../../utils/api-errors";

function siteAddress(site) {
  return [site.address_line_1, site.city, site.state, site.country]
    .filter(Boolean)
    .join(", ");
}

export default function CustomerSitesPanel({
  customerId,
  sites,
  loading,
  error,
  canCreate,
  canUpdate,
  canDelete,
  actionId,
  onDeactivate,
  onReactivate,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">Operational sites</h2>
          <p className="mt-1 text-xs text-slate-500">Locations where jobs can be scheduled and delivered.</p>
        </div>
        {canCreate ? (
          <Link
            to={`/customers/${customerId}/sites/new`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/15"
          >
            <Plus className="h-4 w-4" /> Add site
          </Link>
        ) : null}
      </div>

      <div className="p-5">
        {error ? <Alert variant="error">{getApiErrorMessage(error, "Unable to load customer sites.")}</Alert> : null}
        {loading && sites.length === 0 ? <div className="h-32 animate-pulse rounded-xl bg-slate-800/60" /> : null}
        {!loading && sites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 px-5 py-10 text-center">
            <MapPin className="mx-auto h-6 w-6 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-300">No sites recorded</p>
            <p className="mt-1 text-xs text-slate-600">Jobs can still be created without selecting a site.</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {sites.map((site) => (
            <article key={site.id} className="rounded-xl border border-slate-800 bg-slate-950/35 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{site.name}</h3>
                    <CustomerStatusBadge active={site.is_active} />
                    {site.site_code ? <span className="text-xs text-slate-600">{site.site_code}</span> : null}
                  </div>
                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-400">
                    <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-600" />
                    {siteAddress(site)}
                  </p>
                  {site.contact_name || site.phone ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {[site.contact_name, site.phone].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {canUpdate ? (
                    <Link
                      to={`/customers/${customerId}/sites/${site.id}/edit`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Link>
                  ) : null}
                  {site.is_active && canDelete ? (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={actionId === site.id}
                      onClick={() => onDeactivate(site)}
                    >
                      <Power className="h-3.5 w-3.5" /> Deactivate
                    </Button>
                  ) : null}
                  {!site.is_active && canUpdate ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={actionId === site.id}
                      onClick={() => onReactivate(site)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
