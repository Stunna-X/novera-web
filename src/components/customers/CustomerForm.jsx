import { useEffect, useMemo, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";

const emptyValues = {
  name: "",
  customer_type: "business",
  contact_name: "",
  email: "",
  phone: "",
  alternate_phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  notes: "",
};

function toFormValues(customer) {
  if (!customer) return emptyValues;

  return Object.fromEntries(
    Object.keys(emptyValues).map((key) => [key, customer[key] ?? emptyValues[key]]),
  );
}

function toPayload(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const trimmed = typeof value === "string" ? value.trim() : value;
      return [key, trimmed === "" ? null : trimmed];
    }),
  );
}

export default function CustomerForm({
  initialCustomer = null,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const initialValues = useMemo(() => toFormValues(initialCustomer), [initialCustomer]);
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => setValues(initialValues), [initialValues]);

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!values.name.trim()) {
      setFieldErrors({ name: "Enter the customer name." });
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(toPayload(values));
    } catch (requestError) {
      setError(requestError);
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <Alert variant="error">
          {getApiErrorMessage(error, "Unable to save this customer.")}
        </Alert>
      ) : null}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Customer identity
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">Account and primary contact</h2>
          <p className="mt-2 text-sm text-slate-500">
            Record the customer name and the person your operations team should contact.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Customer name"
            required
            value={values.name}
            onChange={update("name")}
            error={fieldErrors.name}
            placeholder="Business or individual name"
            maxLength={160}
          />
          <SelectField
            label="Customer type"
            required
            value={values.customer_type}
            onChange={update("customer_type")}
            error={fieldErrors.customer_type}
          >
            <option value="business">Business</option>
            <option value="individual">Individual</option>
          </SelectField>
          <TextField
            label="Contact name"
            value={values.contact_name}
            onChange={update("contact_name")}
            error={fieldErrors.contact_name}
            placeholder="Primary contact person"
            maxLength={160}
          />
          <TextField
            label="Email address"
            type="email"
            value={values.email}
            onChange={update("email")}
            error={fieldErrors.email}
            placeholder="Enter an email address"
          />
          <TextField
            label="Phone number"
            type="tel"
            value={values.phone}
            onChange={update("phone")}
            error={fieldErrors.phone}
            placeholder="Primary phone number"
            maxLength={50}
          />
          <TextField
            label="Alternate phone"
            type="tel"
            value={values.alternate_phone}
            onChange={update("alternate_phone")}
            error={fieldErrors.alternate_phone}
            placeholder="Optional second number"
            maxLength={50}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Address
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">Primary customer address</h2>
          <p className="mt-2 text-sm text-slate-500">
            This is the customer account address. Individual operational sites are managed separately.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            className="md:col-span-2"
            label="Address line 1"
            value={values.address_line_1}
            onChange={update("address_line_1")}
            error={fieldErrors.address_line_1}
            placeholder="Street address"
            maxLength={255}
          />
          <TextField
            className="md:col-span-2"
            label="Address line 2"
            value={values.address_line_2}
            onChange={update("address_line_2")}
            error={fieldErrors.address_line_2}
            placeholder="Suite, unit, landmark, or district"
            maxLength={255}
          />
          <TextField label="City" value={values.city} onChange={update("city")} error={fieldErrors.city} maxLength={100} />
          <TextField label="State or region" value={values.state} onChange={update("state")} error={fieldErrors.state} maxLength={100} />
          <TextField label="Postal code" value={values.postal_code} onChange={update("postal_code")} error={fieldErrors.postal_code} maxLength={30} />
          <TextField label="Country" value={values.country} onChange={update("country")} error={fieldErrors.country} maxLength={100} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <TextAreaField
          label="Internal notes"
          value={values.notes}
          onChange={update("notes")}
          error={fieldErrors.notes}
          placeholder="Commercial context, preferences, billing notes, or important relationship details."
          rows={5}
          maxLength={5000}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
