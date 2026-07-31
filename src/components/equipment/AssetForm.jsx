import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import { combineAssetNotes, splitAssetNotes } from "../../utils/asset-issues";
import {
  assetConditionOptions,
  assetStatusOptions,
  assetTypeOptions,
  optionalAssetText,
} from "../../utils/asset-utils";

function generateAssetCode() {
  const randomPart =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 10)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  return `EQ-${randomPart.toUpperCase()}`;
}

function createInitialValues(asset, mode) {
  const parsedNotes = splitAssetNotes(asset?.notes);

  return {
    asset_code:
      asset?.asset_code || (mode === "create" ? generateAssetCode() : ""),
    name: asset?.name || "",
    asset_type: asset?.asset_type || "equipment",
    status: asset?.status || "available",
    condition: asset?.condition || "good",
    location: asset?.location || "",
    last_service_date: asset?.last_service_date || "",
    notes: parsedNotes.notes,
    issue_reports: parsedNotes.issues,

    // Preserve backend fields that are no longer part of the daily registration flow.
    category: asset?.category || "",
    manufacturer: asset?.manufacturer || "",
    model_number: asset?.model_number || "",
    serial_number: asset?.serial_number || "",
    registration_number: asset?.registration_number || "",
    year_of_manufacture: asset?.year_of_manufacture ?? null,
    purchase_date: asset?.purchase_date || null,
    purchase_cost: asset?.purchase_cost ?? null,
    next_service_date: asset?.next_service_date || null,
  };
}

export default function AssetForm({
  mode = "create",
  initialAsset = null,
  onSubmit,
}) {
  const [values, setValues] = useState(() =>
    createInitialValues(initialAsset, mode),
  );
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setValues(createInitialValues(initialAsset, mode));
  }, [initialAsset, mode]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function validate() {
    const errors = {};

    if (!values.asset_code.trim()) {
      errors.asset_code = "Unable to generate the equipment reference.";
    } else if (values.asset_code.trim().length > 50) {
      errors.asset_code = "Use 50 characters or fewer.";
    }

    if (!values.name.trim()) {
      errors.name = "Enter the equipment name.";
    } else if (values.name.trim().length > 160) {
      errors.name = "Use 160 characters or fewer.";
    }

    const combinedNotes = combineAssetNotes(values.notes, values.issue_reports);
    if ((combinedNotes?.length || 0) > 5000) {
      errors.notes = "Internal notes are too long.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildPayload() {
    return {
      asset_code: values.asset_code.trim(),
      name: values.name.trim(),
      asset_type: values.asset_type,
      category: optionalAssetText(values.category),
      manufacturer: optionalAssetText(values.manufacturer),
      model_number: optionalAssetText(values.model_number),
      serial_number: optionalAssetText(values.serial_number),
      registration_number: optionalAssetText(values.registration_number),
      year_of_manufacture: values.year_of_manufacture,
      purchase_date: values.purchase_date,
      purchase_cost: values.purchase_cost,
      status: values.status,
      condition: values.condition,
      location: optionalAssetText(values.location),
      last_service_date: values.last_service_date || null,
      next_service_date: values.next_service_date,
      notes: combineAssetNotes(values.notes, values.issue_reports),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError("");

    try {
      await onSubmit(buildPayload());
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      setFormError(
        getApiErrorMessage(error, "Unable to save this equipment record."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Equipment identity
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Register the equipment
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add only the information teams need to identify, locate, and assign
            the equipment. Novera creates the internal reference automatically.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField
            label="Equipment name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            error={fieldErrors.name}
            maxLength={160}
          />
          <SelectField
            label="Equipment type"
            required
            value={values.asset_type}
            onChange={(event) => update("asset_type", event.target.value)}
            error={fieldErrors.asset_type}
          >
            {assetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          {mode === "edit" ? (
            <TextField
              label="Equipment reference"
              className="md:col-span-2"
              value={values.asset_code}
              readOnly
              hint="Generated by Novera when the equipment was registered."
              inputClassName="cursor-not-allowed text-slate-400"
            />
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Operational state
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Location, availability, and condition
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField
            label="Current location"
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            error={fieldErrors.location}
            maxLength={255}
          />
          <TextField
            label="Last service date"
            type="date"
            value={values.last_service_date}
            onChange={(event) => update("last_service_date", event.target.value)}
            error={fieldErrors.last_service_date}
            hint="Leave blank when the service history is unknown."
          />
          <SelectField
            label="Status"
            required
            value={values.status}
            onChange={(event) => update("status", event.target.value)}
            error={fieldErrors.status}
          >
            {assetStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Condition"
            required
            value={values.condition}
            onChange={(event) => update("condition", event.target.value)}
            error={fieldErrors.condition}
          >
            {assetConditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Internal context
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Notes for the operations team
          </h2>
        </div>

        <div className="mt-5">
          <TextAreaField
            label="Internal notes"
            rows={5}
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            error={fieldErrors.notes}
            maxLength={5000}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to={initialAsset?.id ? `/equipment/${initialAsset.id}` : "/equipment"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Link>
        <Button type="submit" loading={submitting}>
          <Save className="h-4 w-4" />
          {mode === "edit" ? "Save equipment" : "Register equipment"}
        </Button>
      </div>
    </form>
  );
}
