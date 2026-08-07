import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CirclePlus,
  Pencil,
  RefreshCw,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  createJobMaterial,
  listJobMaterials,
  removeJobMaterial,
  requestMissingJobMaterials,
  updateJobMaterial,
} from "../../services/job-material-service";
import { listInventoryItems } from "../../services/inventory-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { formatCurrency } from "../../utils/currency";
import {
  formatQuantity,
  getListItems,
} from "../../utils/inventory-utils";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import JobMaterialDialog from "./JobMaterialDialog";

const STATUS_STYLES = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    badge:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    bar: "bg-emerald-400",
  },
  partial: {
    label: "Partial",
    icon: AlertTriangle,
    badge:
      "border-amber-400/20 bg-amber-400/10 text-amber-200",
    bar: "bg-amber-400",
  },
  missing: {
    label: "Missing",
    icon: XCircle,
    badge:
      "border-rose-400/20 bg-rose-400/10 text-rose-200",
    bar: "bg-rose-400",
  },
};

function SummaryCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function QuantityCell({ label, value, unit, emphasis = false }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-semibold ${
          emphasis ? "text-white" : "text-slate-300"
        }`}
      >
        {formatQuantity(value, unit)}
      </dd>
    </div>
  );
}

export default function JobMaterialsReadiness({
  organizationId,
  job,
  canManage,
  canRequestPurchase,
  currency,
  onChanged,
}) {
  const [payload, setPayload] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState({
    open: false,
    material: null,
  });
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [requestingPurchase, setRequestingPurchase] =
    useState(false);
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [actionError, setActionError] = useState("");

  const mutable =
    job.is_active &&
    !["completed", "cancelled"].includes(job.status);

  const load = useCallback(async () => {
    if (!organizationId || !job.id) return;

    setLoading(true);
    setLoadError(null);

    try {
      const [materialsPayload, itemsPayload] =
        await Promise.all([
          listJobMaterials(
            organizationId,
            job.id,
            {
              skip: 0,
              limit: 200,
              include_inactive_work_order: true,
            },
          ),
          listInventoryItems(
            organizationId,
            {
              skip: 0,
              limit: 200,
              include_inactive: false,
            },
          ),
        ]);

      const catalogueItems = getListItems(itemsPayload);
      const linkedItems = (materialsPayload?.items || [])
        .map((material) => material.item)
        .filter(Boolean);
      const itemsById = new Map(
        [...catalogueItems, ...linkedItems].map(
          (item) => [item.id, item],
        ),
      );

      setPayload(materialsPayload);
      setInventoryItems([...itemsById.values()]);
    } catch (requestError) {
      setLoadError(requestError);
    } finally {
      setLoading(false);
    }
  }, [job.id, organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPurchaseRequest(null);
  }, [job.id]);

  const materials = payload?.items || [];

  const existingItemIds = useMemo(
    () =>
      new Set(
        materials.map(
          (material) => material.inventory_item_id,
        ),
      ),
    [materials],
  );

  const shortageLines =
    Number(payload?.partial_lines || 0) +
    Number(payload?.missing_lines || 0);

  const zeroCostLines = materials.filter(
    (material) =>
      Number(material.estimated_unit_cost || 0) <= 0,
  ).length;

  const purchaseRequestIsDraft =
    purchaseRequest?.requisition?.status === "draft";

  async function finishMutation(message) {
    setNotice(message);
    setActionError("");
    await load();
    await onChanged?.();
  }

  async function handleSave(formPayload) {
    if (dialog.material) {
      await updateJobMaterial(
        organizationId,
        job.id,
        dialog.material.id,
        formPayload,
      );
      await finishMutation("Material requirement updated.");
      return;
    }

    await createJobMaterial(
      organizationId,
      job.id,
      formPayload,
    );
    await finishMutation("Material requirement added.");
  }

  async function handleRequestMissing() {
    setRequestingPurchase(true);
    setActionError("");
    setNotice("");

    try {
      const response = await requestMissingJobMaterials(
        organizationId,
        job.id,
      );

      setPurchaseRequest(response);

      const requisitionNumber =
        response?.requisition?.requisition_number ||
        "the purchase request";

      setNotice(
        response?.created
          ? `${requisitionNumber} was created as a draft purchase request.`
          : response?.requisition?.status === "draft"
            ? `${requisitionNumber} was refreshed with current shortages and catalogue costs.`
            : `${requisitionNumber} is already open and was reused.`,
      );

      await load();
      await onChanged?.();
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(
          requestError,
          "The missing materials could not be requested.",
        ),
      );
    } finally {
      setRequestingPurchase(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;

    setRemoving(true);
    setActionError("");

    try {
      await removeJobMaterial(
        organizationId,
        job.id,
        removeTarget.id,
      );
      setRemoveTarget(null);
      await finishMutation("Material requirement removed.");
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(
          requestError,
          "The material requirement could not be removed.",
        ),
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold text-white">
            <Boxes className="h-5 w-5 text-emerald-300" />
            Materials readiness
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Required job materials are compared with live stock and
            stock already reserved for this job.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh material readiness"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>

          {canManage && mutable && (
            <Button
              onClick={() =>
                setDialog({
                  open: true,
                  material: null,
                })
              }
            >
              <CirclePlus className="h-4 w-4" />
              Add material
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <div className="mt-5">
          <Alert>{notice}</Alert>
        </div>
      )}

      {actionError && (
        <div className="mt-5">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      {purchaseRequest && (
        <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-100">
                {purchaseRequest.created
                  ? "Draft purchase request created"
                  : purchaseRequestIsDraft
                    ? "Draft purchase request refreshed"
                    : "Existing purchase request found"}
              </p>
              <p className="mt-1 text-xs leading-5 text-sky-200/75">
                {purchaseRequest.requisition?.requisition_number ||
                  "Purchase request"}{" "}
                contains {purchaseRequest.shortage_line_count} shortage
                {purchaseRequest.shortage_line_count === 1 ? "" : "s"}.
                It must still be submitted, approved and converted to a
                purchase order before a supplier is instructed.
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300/70">
                {purchaseRequest.requisition?.status || "draft"}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {formatCurrency(
                  purchaseRequest.requisition?.total_estimated_amount,
                  purchaseRequest.requisition?.currency || currency,
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {loadError && (
        <div className="mt-5">
          <Alert variant="error">
            {getApiErrorMessage(
              loadError,
              "Unable to load material readiness.",
            )}
          </Alert>
        </div>
      )}

      {!mutable && (
        <div className="mt-5">
          <Alert variant="error">
            Material requirements cannot be changed on an inactive,
            completed or cancelled job.
          </Alert>
        </div>
      )}

      {loading && !payload ? (
        <div className="mt-6 h-44 animate-pulse rounded-2xl bg-slate-950/45" />
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Required lines"
              value={payload?.total || 0}
              detail="Materials planned for this job"
            />
            <SummaryCard
              label="Ready"
              value={payload?.available_lines || 0}
              detail="Fully covered by stock"
            />
            <SummaryCard
              label="Short"
              value={shortageLines}
              detail="Partial or completely missing"
            />
            <SummaryCard
              label={`Estimated (${currency})`}
              value={formatCurrency(
                payload?.total_estimated_cost,
                currency,
              )}
              detail={
                zeroCostLines > 0
                  ? `${zeroCostLines} item ${
                      zeroCostLines === 1 ? "cost is" : "costs are"
                    } not set`
                  : "Based on catalogue unit costs"
              }
            />
          </div>

          {zeroCostLines > 0 && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-100">
                  {zeroCostLines} material{" "}
                  {zeroCostLines === 1 ? "needs" : "need"} a unit cost
                </p>
                <p className="mt-1 text-xs leading-5 text-sky-200/70">
                  Set catalogue unit costs so job estimates and draft
                  purchase requests carry a useful value.
                </p>
              </div>

              <Link
                to="/inventory?view=items"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/15"
              >
                Set unit costs
              </Link>
            </div>
          )}

          {shortageLines > 0 && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <p className="text-sm font-semibold text-amber-100">
                    {shortageLines} material{" "}
                    {shortageLines === 1 ? "line is" : "lines are"} short
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-200/70">
                    {purchaseRequestIsDraft
                      ? "Refresh the draft with current shortages and catalogue costs. This does not send an order to a supplier yet."
                      : "Create one draft purchase request for the exact missing quantities. This does not send an order to a supplier yet."}
                  </p>
                  {!canRequestPurchase && (
                    <p className="mt-2 text-xs font-medium text-amber-200">
                      Purchase requisition permission is required.
                    </p>
                  )}
                </div>
              </div>

              {canRequestPurchase && mutable && (
                <Button
                  onClick={handleRequestMissing}
                  loading={requestingPurchase}
                  disabled={loading}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {purchaseRequestIsDraft
                    ? "Refresh draft request"
                    : "Request missing materials"}
                </Button>
              )}
            </div>
          )}

          {materials.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/25 px-6 py-10 text-center">
              <Boxes className="mx-auto h-8 w-8 text-slate-700" />
              <h3 className="mt-4 text-sm font-semibold text-white">
                No required materials yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add the items and quantities needed to complete this
                job. Novera will calculate the stock shortage
                automatically.
              </p>

              {inventoryItems.length === 0 && canManage && mutable && (
                <Link
                  to="/inventory?view=items"
                  className="mt-5 inline-flex text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
                >
                  Add inventory items first
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {payload?.all_materials_ready && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-100">
                      All required materials are ready
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-200/70">
                      Current unreserved stock and this job’s
                      reservations cover every requirement.
                    </p>
                  </div>
                </div>
              )}

              {materials.map((material) => {
                const status =
                  STATUS_STYLES[material.readiness_status] ||
                  STATUS_STYLES.missing;
                const StatusIcon = status.icon;
                const unit = material.item?.unit_of_measure || "";
                const coverage = Math.max(
                  0,
                  Math.min(
                    100,
                    Number(material.coverage_percentage) || 0,
                  ),
                );

                return (
                  <article
                    key={material.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {material.item?.name || "Inventory item"}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.badge}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {material.item?.sku || "No SKU"}
                          {material.item?.category
                            ? ` · ${material.item.category}`
                            : ""}
                        </p>
                      </div>

                      {canManage && mutable && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDialog({
                                open: true,
                                material,
                              })
                            }
                            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            aria-label={`Edit ${material.item?.name || "material"}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRemoveTarget(material)
                            }
                            className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/20 text-rose-300 transition hover:bg-rose-400/10"
                            aria-label={`Remove ${material.item?.name || "material"}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                        <span className="font-medium text-slate-500">
                          {formatQuantity(
                            material.covered_quantity,
                            unit,
                          )}{" "}
                          covered
                        </span>
                        <span className="font-semibold text-white">
                          {coverage.toFixed(0)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${status.bar}`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <QuantityCell
                        label="Required"
                        value={material.required_quantity}
                        unit={unit}
                        emphasis
                      />
                      <QuantityCell
                        label="Available now"
                        value={material.available_quantity}
                        unit={unit}
                      />
                      <QuantityCell
                        label="Reserved for job"
                        value={material.reserved_for_work_order}
                        unit={unit}
                      />
                      <QuantityCell
                        label="Missing"
                        value={material.missing_quantity}
                        unit={unit}
                        emphasis={Number(material.missing_quantity) > 0}
                      />
                    </dl>

                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Stock across {material.active_location_count}{" "}
                        active location
                        {material.active_location_count === 1 ? "" : "s"}
                      </span>
                      <span>
                        Estimated{" "}
                        {formatCurrency(
                          material.estimated_line_cost,
                          material.currency || currency,
                        )}
                      </span>
                    </div>

                    {material.notes && (
                      <p className="mt-4 rounded-xl bg-slate-900/70 px-3 py-2 text-xs leading-5 text-slate-400">
                        {material.notes}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <JobMaterialDialog
        open={dialog.open}
        material={dialog.material}
        inventoryItems={inventoryItems}
        existingItemIds={existingItemIds}
        onClose={() =>
          setDialog({
            open: false,
            material: null,
          })
        }
        onSubmit={handleSave}
      />

      <Modal
        open={Boolean(removeTarget)}
        title="Remove required material"
        onClose={removing ? () => {} : () => setRemoveTarget(null)}
      >
        <p className="text-sm leading-7 text-slate-400">
          Remove{" "}
          <span className="font-semibold text-white">
            {removeTarget?.item?.name || "this material"}
          </span>{" "}
          from the job requirements? Inventory stock will not be
          changed.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setRemoveTarget(null)}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={removing}
            onClick={handleRemove}
          >
            Remove material
          </Button>
        </div>
      </Modal>
    </section>
  );
}
