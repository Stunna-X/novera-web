import { useEffect, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextField from "../ui/TextField";
import { createCustomerSite } from "../../services/organization-service";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";

function createInitialValues() {
  return {
    name: "",
    address_line_1: "",
    city: "",
    state: "",
  };
}

function optionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export default function QuickSiteDialog({
  open,
  organizationId,
  customerId,
  customerName,
  onClose,
  onCreated,
}) {
  const [values, setValues] = useState(createInitialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setValues(createInitialValues());
    setFieldErrors({});
    setError("");
  }, [customerId, open]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  function close() {
    if (loading) return;
    onClose();
  }

  function validate() {
    const errors = {};

    if (!values.name.trim()) {
      errors.name = "Enter a site name.";
    }

    if (!values.address_line_1.trim()) {
      errors.address_line_1 = "Enter the site address or location.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    if (!customerId) {
      setError("Choose a customer before adding a site.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const site = await createCustomerSite(
        organizationId,
        customerId,
        {
          name: values.name.trim(),
          address_line_1: values.address_line_1.trim(),
          city: optionalText(values.city),
          state: optionalText(values.state),
        },
      );

      await onCreated(site);
      onClose();
    } catch (requestError) {
      setFieldErrors(getApiFieldErrors(requestError));
      setError(
        getApiErrorMessage(requestError, "Unable to create the job site."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={customerName ? `Add site for ${customerName}` : "Add job site"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            className="sm:col-span-2"
            label="Site name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            error={fieldErrors.name}
            placeholder="Bwari drilling site"
            maxLength={160}
          />

          <TextField
            className="sm:col-span-2"
            label="Address or location"
            required
            value={values.address_line_1}
            onChange={(event) =>
              update("address_line_1", event.target.value)
            }
            error={fieldErrors.address_line_1}
            placeholder="Plot, street, landmark, or community"
            maxLength={255}
          />

          <TextField
            label="City"
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
            error={fieldErrors.city}
            maxLength={100}
          />

          <TextField
            label="State"
            value={values.state}
            onChange={(event) => update("state", event.target.value)}
            error={fieldErrors.state}
            maxLength={100}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add site
          </Button>
        </div>
      </form>
    </Modal>
  );
}