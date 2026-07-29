import { Plus, Trash2, Users, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import {
  assignAsset,
  assignWorkforceMember,
  removeAsset,
  removeWorkforceMember,
} from "../../services/job-service";
import { listAssets, listWorkforce } from "../../services/organization-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { truncateId } from "../../utils/job-utils";

function AssignmentList({ items, ids, type, onRemove, busy, editable }) {
  const itemById = new Map(items.map((item) => [item.id, item]));

  if (!ids?.length) {
    return <p className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-center text-xs text-slate-600">No {type} assigned.</p>;
  }

  return (
    <div className="space-y-2">
      {ids.map((id) => {
        const item = itemById.get(id);
        const label = type === "workforce"
          ? item ? `${item.first_name} ${item.last_name}` : truncateId(id)
          : item?.name || truncateId(id);
        const note = type === "workforce"
          ? item?.job_title || item?.role_name || "Team member"
          : item ? `${item.asset_code} · ${item.asset_type}` : "Asset";

        return (
          <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/35 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-200">{label}</p>
              <p className="mt-1 truncate text-xs text-slate-600">{note}</p>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => onRemove(id)}
                disabled={busy === id}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"
                aria-label={`Remove ${label}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function JobAssignments({
  organizationId,
  job,
  canAssign,
  canReadWorkforce,
  canReadAssets,
  onChanged,
}) {
  const [workforce, setWorkforce] = useState([]);
  const [assets, setAssets] = useState([]);
  const [workforceId, setWorkforceId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const requests = [];

    if (canReadWorkforce || canAssign) {
      requests.push(
        listWorkforce(organizationId, { limit: 200, include_inactive: false })
          .then((payload) => {
            if (active) setWorkforce(Array.isArray(payload?.items) ? payload.items : []);
          }),
      );
    }

    if (canReadAssets || canAssign) {
      requests.push(
        listAssets(organizationId, { limit: 200, include_inactive: false })
          .then((payload) => {
            if (active) setAssets(Array.isArray(payload?.items) ? payload.items : []);
          }),
      );
    }

    Promise.allSettled(requests).then((results) => {
      const rejected = results.find((result) => result.status === "rejected");
      if (active && rejected) {
        setError(getApiErrorMessage(rejected.reason, "Unable to load some assignment resources."));
      }
    });

    return () => {
      active = false;
    };
  }, [canAssign, canReadAssets, canReadWorkforce, organizationId]);

  const availableWorkforce = useMemo(
    () => workforce.filter((item) => !job.workforce_profile_ids?.includes(item.id)),
    [job.workforce_profile_ids, workforce],
  );
  const availableAssets = useMemo(
    () => assets.filter((item) => !job.asset_ids?.includes(item.id)),
    [assets, job.asset_ids],
  );

  async function run(key, operation) {
    setBusy(key);
    setError("");
    try {
      await operation();
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update assignments."));
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/55">
      <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-white">Field assignments</h2>
        <p className="mt-1 text-xs text-slate-500">Workforce and operational assets allocated to this job.</p>
      </div>
      <div className="space-y-6 p-5 sm:p-6">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Users className="h-4 w-4 text-emerald-300" /> Workforce
          </div>
          {canAssign && (
            <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <SelectField label="Assign team member" value={workforceId} onChange={(event) => setWorkforceId(event.target.value)}>
                <option value="">Choose available member</option>
                {availableWorkforce.map((member) => (
                  <option key={member.id} value={member.id}>{member.first_name} {member.last_name} · {member.job_title || member.role_name}</option>
                ))}
              </SelectField>
              <Button
                className="self-end"
                disabled={!workforceId}
                loading={busy === `workforce-add-${workforceId}`}
                onClick={() => run(`workforce-add-${workforceId}`, async () => {
                  await assignWorkforceMember(organizationId, job.id, workforceId);
                  setWorkforceId("");
                })}
              >
                <Plus className="h-4 w-4" /> Assign
              </Button>
            </div>
          )}
          <AssignmentList
            items={workforce}
            ids={job.workforce_profile_ids || []}
            type="workforce"
            busy={busy.replace("workforce-remove-", "")}
            editable={canAssign}
            onRemove={(id) => run(`workforce-remove-${id}`, () => removeWorkforceMember(organizationId, job.id, id))}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Wrench className="h-4 w-4 text-emerald-300" /> Equipment and assets
          </div>
          {canAssign && (
            <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <SelectField label="Assign asset" value={assetId} onChange={(event) => setAssetId(event.target.value)}>
                <option value="">Choose available asset</option>
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.name} · {asset.asset_code} · {asset.status}</option>
                ))}
              </SelectField>
              <Button
                className="self-end"
                disabled={!assetId}
                loading={busy === `asset-add-${assetId}`}
                onClick={() => run(`asset-add-${assetId}`, async () => {
                  await assignAsset(organizationId, job.id, assetId);
                  setAssetId("");
                })}
              >
                <Plus className="h-4 w-4" /> Assign
              </Button>
            </div>
          )}
          <AssignmentList
            items={assets}
            ids={job.asset_ids || []}
            type="asset"
            busy={busy.replace("asset-remove-", "")}
            editable={canAssign}
            onRemove={(id) => run(`asset-remove-${id}`, () => removeAsset(organizationId, job.id, id))}
          />
        </div>
      </div>
    </section>
  );
}
