import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

import AssetForm from "../../components/equipment/AssetForm";
import AccessDenied from "../../components/feedback/AccessDenied";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useWorkspace from "../../hooks/useWorkspace";
import { createAsset } from "../../services/asset-service";

export default function CreateAssetPage() {
  const navigate = useNavigate();
  const {
    activeOrganizationId,
    isLoading,
    hasPermission,
  } = useWorkspace();

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }
  if (!activeOrganizationId) {
    return <WorkspaceEmptyState returnTo="/equipment/new" />;
  }
  if (!hasPermission("assets.create")) {
    return (
      <AccessDenied description="Your workspace role does not allow equipment records to be created." />
    );
  }

  async function handleSubmit(payload) {
    const asset = await createAsset(activeOrganizationId, payload);
    navigate(`/equipment/${asset.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/equipment"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Back to equipment"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Asset register
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Register equipment
          </h1>
        </div>
      </div>

      <AssetForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
