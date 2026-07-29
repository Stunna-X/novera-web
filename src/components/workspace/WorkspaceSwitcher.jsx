import { AlertTriangle, Building2, Plus } from "lucide-react";
import { Link } from "react-router";

import useWorkspace from "../../hooks/useWorkspace";
import { getWorkspaceDisplayName } from "../../utils/workspace-name";

export default function WorkspaceSwitcher() {
  const {
    organizations,
    activeOrganizationId,
    activateOrganization,
    isLoading,
    requiresWorkspaceRename,
  } = useWorkspace();

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-slate-900" />;
  }

  if (organizations.length === 0) {
    return (
      <Link
        to="/workspace/setup"
        className="group block rounded-2xl border border-dashed border-emerald-400/25 bg-emerald-400/[0.05] p-4 transition hover:border-emerald-300/40 hover:bg-emerald-400/[0.08]"
      >
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
          <Plus className="h-3.5 w-3.5" />
          Create workspace
        </span>
        <span className="mt-2 block text-xs leading-5 text-slate-500">
          Set up an organisation before creating jobs.
        </span>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
      <label className="block">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
          <Building2 className="h-3.5 w-3.5" />
          Workspace
        </span>
        <select
          value={activeOrganizationId || ""}
          onChange={(event) =>
            activateOrganization(event.target.value).catch(() => {})
          }
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-sm font-semibold text-white outline-none transition focus:border-emerald-400"
          aria-label="Active workspace"
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {getWorkspaceDisplayName(organization.name)}
            </option>
          ))}
        </select>
      </label>

      {requiresWorkspaceRename ? (
        <Link
          to="/settings"
          state={{ workspaceNameRequired: true }}
          className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/15"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Finish workspace setup
        </Link>
      ) : (
        <p className="mt-2 truncate text-xs text-slate-500">
          {organizations.length === 1
            ? "1 operational workspace"
            : `${organizations.length} operational workspaces`}
        </p>
      )}
    </div>
  );
}
