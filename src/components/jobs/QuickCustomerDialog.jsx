import { useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextField from "../ui/TextField";
import { createCustomer } from "../../services/organization-service";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";

const initialValues = {
  name: "",
  customer_type: "business",
  contact_name: "",
  email: "",
  phone: "",
};

function optional(value) {
  return value.trim() || null;
}

export default function QuickCustomerDialog({
  open,
  organizationId,
  onClose,
  onCreated,
}) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  function close() {
    if (loading) return;
    setValues(initialValues);
    setError("");
    setFieldErrors({});
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!values.name.trim()) {
      setFieldErrors({ name: "Enter a customer name." });
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const customer = await createCustomer(organizationId, {
        name: values.name.trim(),
        customer_type: values.customer_type,
        contact_name: optional(values.contact_name),
        email: optional(values.email),
        phone: optional(values.phone),
      });

      await onCreated(customer);
      setValues(initialValues);
      onClose();
    } catch (requestError) {
      setFieldErrors(getApiFieldErrors(requestError));
      setError(getApiErrorMessage(requestError, "Unable to create the customer."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create customer"
      description="Add the customer record required by a Novera job without leaving this form. Sites can be added from the customer module later."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            className="sm:col-span-2"
            label="Customer name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            error={fieldErrors.name}
            maxLength={160}
            placeholder="Customer or company name"
          />
          <SelectField
            label="Customer type"
            value={values.customer_type}
            onChange={(event) => update("customer_type", event.target.value)}
            error={fieldErrors.customer_type}
          >
            <option value="business">Business</option>
            <option value="individual">Individual</option>
          </SelectField>
          <TextField
            label="Contact name"
            value={values.contact_name}
            onChange={(event) => update("contact_name", event.target.value)}
            error={fieldErrors.contact_name}
          />
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            error={fieldErrors.email}
            placeholder="Enter email"
          />
          <TextField
            label="Phone"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            error={fieldErrors.phone}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" loading={loading}>Create customer</Button>
        </div>
      </form>
    </Modal>
  );
}
