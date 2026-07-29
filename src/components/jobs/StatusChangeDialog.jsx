import { useEffect, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import { getApiErrorMessage } from "../../utils/api-errors";
import {
  allowedJobStatusTransitions,
  jobStatusOptions,
} from "../../utils/job-utils";

export default function StatusChangeDialog({ open, job, onClose, onSubmit }) {
  const [status, setStatus] = useState(job?.status || "draft");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const nextStatuses = allowedJobStatusTransitions[job?.status] || [];
      setStatus(nextStatuses[0] || job?.status || "draft");
      setNote("");
      setError("");
    }
  }, [job?.status, open]);

  const allowedStatuses = allowedJobStatusTransitions[job?.status] || [];
  const availableOptions = jobStatusOptions.filter((option) =>
    allowedStatuses.includes(option.value),
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit({ status, note: note.trim() || null });
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to change job status."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change job status"
      description="Every successful transition is written to the operational activity timeline."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}
        {availableOptions.length > 0 ? (
          <SelectField label="New status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {availableOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectField>
        ) : (
          <Alert>This job has no permitted next status from its current state.</Alert>
        )}
        <TextAreaField
          label="Transition note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add context for the team and audit trail."
          rows={3}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={availableOptions.length === 0 || status === job?.status}>Update status</Button>
        </div>
      </form>
    </Modal>
  );
}
