import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

import AssetForm from "../../components/equipment/AssetForm";
import AccessDenied from "../../components/feedback/AccessDenied";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useAsset from "../../hooks/useAsset";
import useWorkspace from "../../hooks/useWorkspace";
import { updateAsset } from "../../services/asset-service";
import { getApiErrorMessage } from "../../utils/api-errors";

export default function EditAssetPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const {
    activeOrganizationId,
    isLoading: workspaceLoading,
    hasPermission,
  } = useWorkspace();
  const canRead = hasPermission("assets.read");
  const canUpdate = hasPermission("assets.update");
  const { asset, loading, error } = useAsset({
    organizationId: activeOrganizationId,
    assetId,
    enabled: Boolean(activeOrganizationId && canRead),
  });

  if (workspaceLoading || loading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }
  if (!activeOrganizationId) {
    return <WorkspaceEmptyState returnTo={`/equipment/${assetId}/edit`} />;
  }
  if (!canRead || !canUpdate) {
    return (
      <AccessDenied description="Your workspace role does not allow this equipment record to be edited." />
    );
  }
  if (error || !asset) {
    return (
      <Alert variant="error">
        {getApiErrorMessage(error, "Unable to load this equipment record.")}
      </Alert>
    );
  }
  if (!asset.is_active) {
    return (
      <Alert variant="error">
        Reactivate this equipment record before editing it.
      </Alert>
    );
  }

  async function handleSubmit(payload) {
    const updated = await updateAsset(activeOrganizationId, assetId, payload);
    navigate(`/equipment/${updated.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/equipment/${assetId}`}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Back to equipment details"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Asset register
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Edit equipment
          </h1>
        </div>
      </div>

      <AssetForm mode="edit" initialAsset={asset} onSubmit={handleSubmit} />
    </div>
  );
}
