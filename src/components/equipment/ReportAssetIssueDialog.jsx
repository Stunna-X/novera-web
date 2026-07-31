import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { listJobs } from "../../services/job-service";
import { updateAsset } from "../../services/asset-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { appendAssetIssue } from "../../utils/asset-issues";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const statusOptions = [
  { value: "maintenance", label: "Maintenance" },
  { value: "unavailable", label: "Unavailable" },
];

function createInitialValues() {
  return {
    description: "",
    severity: "medium",
    related_job_id: "",
    related_job_text: "",
    resulting_status: "maintenance",
  };
}

function jobLabel(job) {
  return [job?.title, job?.work_order_number].filter(Boolean).join(" · ");
}

export default function ReportAssetIssueDialog({
  open,
  organizationId,
  asset,
  canReadJobs = false,
  onClose,
  onReported,
}) {
  const [values, setValues] = useState(createInitialValues);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    setValues(createInitialValues());
    setError("");
    setJobsError("");

    if (!canReadJobs || !organizationId) {
      setJobs([]);
      return undefined;
    }

    const controller = new AbortController();
    setJobsLoading(true);

    listJobs(
      organizationId,
      { skip: 0, limit: 200, include_inactive: true },
      { signal: controller.signal },
    )
      .then((payload) => {
        setJobs(Array.isArray(payload?.items) ? payload.items : []);
      })
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        setJobsError(
          getApiErrorMessage(
            requestError,
            "Unable to load jobs for this issue report.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setJobsLoading(false);
      });

    return () => controller.abort();
  }, [canReadJobs, open, organizationId]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const description = values.description.trim();
    if (!description) {
      setError("Describe the equipment problem.");
      return;
    }

    const selectedJob = jobs.find((job) => job.id === values.related_job_id);
    const fallbackJob = values.related_job_text.trim() || null;

    const issue = {
      id:
        typeof globalThis.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      reported_at: new Date().toISOString(),
      severity: values.severity,
      resulting_status: values.resulting_status,
      related_job_id: selectedJob?.id || null,
      related_job_title: selectedJob?.title || null,
      related_job_number: selectedJob?.work_order_number || null,
      related_job: selectedJob ? jobLabel(selectedJob) : fallbackJob,
      description,
    };

    const notes = appendAssetIssue(asset?.notes, issue);

    if ((notes?.length || 0) > 5000) {
      setError(
        "This equipment record has reached its issue-history limit. Remove old internal notes before adding another report.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updatedAsset = await updateAsset(organizationId, asset.id, {
        status: values.resulting_status,
        notes,
      });

      onReported(updatedAsset);
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to report this equipment issue."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Report equipment issue"
      description={`Record a field problem for ${asset?.name || "this equipment"} and remove it from normal availability.`}
      onClose={submitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {jobsError ? <Alert variant="error">{jobsError}</Alert> : null}

        <TextAreaField
          label="What happened?"
          required
          rows={5}
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          maxLength={1200}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Severity"
            required
            value={values.severity}
            onChange={(event) => update("severity", event.target.value)}
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

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
        </div>

        {canReadJobs ? (
          <SelectField
            label="Related job"
            value={values.related_job_id}
            disabled={jobsLoading}
            onChange={(event) => update("related_job_id", event.target.value)}
            hint={
              jobsLoading
                ? "Loading jobs…"
                : "Optional. Select the job where the problem was discovered."
            }
          >
            <option value="">No related job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {jobLabel(job)}
              </option>
            ))}
          </SelectField>
        ) : (
          <TextField
            label="Related job or work order"
            value={values.related_job_text}
            onChange={(event) => update("related_job_text", event.target.value)}
            maxLength={160}
            hint="Optional. Enter the job number when you do not have permission to browse jobs."
          />
        )}

        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100/80">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p>
              Reporting the issue changes the equipment status immediately so it
              cannot be treated as normally available.
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
            <AlertTriangle className="h-4 w-4" /> Report issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
