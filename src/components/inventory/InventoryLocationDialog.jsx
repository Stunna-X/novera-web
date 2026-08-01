import { useEffect, useMemo, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import { LOCATION_TYPES, makeInventoryReference } from "../../utils/inventory-utils";

export default function InventoryLocationDialog({ open, location, onClose, onSubmit }) {
  const isEditing = Boolean(location?.id);
  const initialValues = useMemo(
    () => ({
      name: location?.name || "",
      location_type: location?.location_type || "warehouse",
      address: location?.address || "",
      notes: location?.notes || "",
    }),
    [location],
  );
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setError(null);
    setFieldErrors({});
  }, [initialValues, open]);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name: values.name.trim(),
      location_type: values.location_type,
      address: values.address.trim() || null,
      notes: values.notes.trim() || null,
    };

    if (!isEditing) payload.code = makeInventoryReference("LOC");

    try {
      await onSubmit(payload);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "The stock location could not be saved."));
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit stock location" : "Add stock location"}
      onClose={submitting ? () => {} : onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        <TextField
          label="Location name"
          required
          value={values.name}
          error={fieldErrors.name}
          onChange={(event) => setField("name", event.target.value)}
        />

        <SelectField
          label="Location type"
          required
          value={values.location_type}
          error={fieldErrors.location_type}
          onChange={(event) => setField("location_type", event.target.value)}
        >
          {LOCATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </SelectField>

        <TextAreaField
          label="Address"
          rows={3}
          value={values.address}
          error={fieldErrors.address}
          onChange={(event) => setField("address", event.target.value)}
        />

        <TextAreaField
          label="Internal notes"
          rows={3}
          value={values.notes}
          error={fieldErrors.notes}
          onChange={(event) => setField("notes", event.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? "Save location" : "Add location"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
