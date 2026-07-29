import { useEffect, useMemo, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";

const emptyValues = {
  name: "",
  site_code: "",
  site_type: "",
  contact_name: "",
  email: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  latitude: "",
  longitude: "",
  access_instructions: "",
  notes: "",
};

function toFormValues(site) {
  if (!site) return emptyValues;
  return Object.fromEntries(
    Object.keys(emptyValues).map((key) => [key, site[key] ?? emptyValues[key]]),
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

export default function SiteForm({ initialSite = null, submitLabel, onSubmit, onCancel }) {
  const initialValues = useMemo(() => toFormValues(initialSite), [initialSite]);
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

    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = "Enter the site name.";
    if (!values.address_line_1.trim()) nextErrors.address_line_1 = "Enter the site address.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
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
        <Alert variant="error">{getApiErrorMessage(error, "Unable to save this site.")}</Alert>
      ) : null}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Operational site</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Site identity and contact</h2>
          <p className="mt-2 text-sm text-slate-500">A site is the physical location where field work is performed.</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField label="Site name" required value={values.name} onChange={update("name")} error={fieldErrors.name} placeholder="Main plant, residence, or branch" maxLength={160} />
          <TextField label="Site code" value={values.site_code} onChange={update("site_code")} error={fieldErrors.site_code} placeholder="Optional internal code" maxLength={50} />
          <TextField label="Site type" value={values.site_type} onChange={update("site_type")} error={fieldErrors.site_type} placeholder="Residence, factory, farm…" maxLength={50} />
          <TextField label="Contact name" value={values.contact_name} onChange={update("contact_name")} error={fieldErrors.contact_name} placeholder="On-site contact" maxLength={160} />
          <TextField label="Email address" type="email" value={values.email} onChange={update("email")} error={fieldErrors.email} placeholder="Enter an email address" />
          <TextField label="Phone number" type="tel" value={values.phone} onChange={update("phone")} error={fieldErrors.phone} placeholder="On-site phone number" maxLength={50} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Location</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Address and coordinates</h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField className="md:col-span-2" label="Address line 1" required value={values.address_line_1} onChange={update("address_line_1")} error={fieldErrors.address_line_1} placeholder="Street address or clear location description" maxLength={255} />
          <TextField className="md:col-span-2" label="Address line 2" value={values.address_line_2} onChange={update("address_line_2")} error={fieldErrors.address_line_2} placeholder="Landmark, district, or access point" maxLength={255} />
          <TextField label="City" value={values.city} onChange={update("city")} error={fieldErrors.city} maxLength={100} />
          <TextField label="State or region" value={values.state} onChange={update("state")} error={fieldErrors.state} maxLength={100} />
          <TextField label="Postal code" value={values.postal_code} onChange={update("postal_code")} error={fieldErrors.postal_code} maxLength={30} />
          <TextField label="Country" value={values.country} onChange={update("country")} error={fieldErrors.country} maxLength={100} />
          <TextField label="Latitude" inputMode="decimal" value={values.latitude} onChange={update("latitude")} error={fieldErrors.latitude} placeholder="9.0765" />
          <TextField label="Longitude" inputMode="decimal" value={values.longitude} onChange={update("longitude")} error={fieldErrors.longitude} placeholder="7.3986" />
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6 md:grid-cols-2">
        <TextAreaField label="Access instructions" value={values.access_instructions} onChange={update("access_instructions")} error={fieldErrors.access_instructions} placeholder="Gate access, security checks, directions, permits, or restricted hours." rows={5} maxLength={5000} />
        <TextAreaField label="Site notes" value={values.notes} onChange={update("notes")} error={fieldErrors.notes} placeholder="Terrain, utilities, hazards, facilities, or other site context." rows={5} maxLength={5000} />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
