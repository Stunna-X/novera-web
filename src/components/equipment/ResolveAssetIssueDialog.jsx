import { CheckCircle2, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { updateAsset } from "../../services/asset-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import {
  isAssetIssueResolved,
  resolveAssetIssue,
} from "../../utils/asset-issues";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "maintenance", label: "Maintenance" },
];

const conditionOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "damaged", label: "Damaged" },
];

function todayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function createInitialValues(asset) {
  return {
    resolution_note: "",
    completion_date: todayInputValue(),
    resulting_status: "available",
    resulting_condition: asset?.condition || "good",
  };
}

export default function ResolveAssetIssueDialog({
  open,
  organizationId,
  asset,
  issue,
  issues = [],
  onClose,
  onResolved,
}) {
  const [values, setValues] = useState(() => createInitialValues(asset));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const otherOpenIssues = useMemo(
    () =>
      issues.filter(
        (candidate) =>
          candidate?.id !== issue?.id && !isAssetIssueResolved(candidate),
      ),
    [issue?.id, issues],
  );

  useEffect(() => {
    if (!open) return;
    setValues(createInitialValues(asset));
    setError("");
  }, [asset, open]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const resolutionNote = values.resolution_note.trim();
    if (!resolutionNote) {
      setError("Record what was inspected, repaired, or decided.");
      return;
    }

    if (!values.completion_date) {
      setError("Enter the completion date.");
      return;
    }

    if (
      values.resulting_status === "available" &&
      otherOpenIssues.length > 0
    ) {
      setError(
        "Resolve the remaining open equipment issues before returning this asset to Available.",
      );
      return;
    }

    const resolvedAt = new Date(
      `${values.completion_date}T12:00:00`,
    ).toISOString();

    let notes;
    try {
      notes = resolveAssetIssue(asset?.notes, issue?.id, {
        resolved_at: resolvedAt,
        resolution_note: resolutionNote,
        resolution_status: values.resulting_status,
        resolution_condition: values.resulting_condition,
        resolution_service_date: values.completion_date,
      });
    } catch (resolutionError) {
      setError(resolutionError.message);
      return;
    }

    if ((notes?.length || 0) > 5000) {
      setError(
        "This equipment record has reached its issue-history limit. Shorten the resolution note and try again.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updatedAsset = await updateAsset(organizationId, asset.id, {
        notes,
        status: values.resulting_status,
        condition: values.resulting_condition,
        last_service_date: values.completion_date,
      });

      onResolved(updatedAsset);
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to resolve this equipment issue."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Resolve equipment issue"
      description={`Record the outcome for ${asset?.name || "this equipment"} and update its operational state.`}
      onClose={submitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
          <div className="flex items-start gap-3">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {issue?.description || "Equipment issue"}
            </p>
          </div>
        </div>

        <TextAreaField
          label="Repair or resolution performed"
          required
          rows={5}
          value={values.resolution_note}
          onChange={(event) => update("resolution_note", event.target.value)}
          maxLength={1200}
        />

        <TextField
          type="date"
          label="Completion date"
          required
          value={values.completion_date}
          onChange={(event) => update("completion_date", event.target.value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Equipment status"
            required
            value={values.resulting_status}
            onChange={(event) =>
              update("resulting_status", event.target.value)
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Condition after resolution"
            required
            value={values.resulting_condition}
            onChange={(event) =>
              update("resulting_condition", event.target.value)
            }
          >
            {conditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-100/80">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p>
              Resolving this issue records the completion date as the latest
              service date and updates the equipment status and condition.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            <CheckCircle2 className="h-4 w-4" /> Resolve issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
