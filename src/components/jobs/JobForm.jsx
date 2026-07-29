import { ArrowLeft, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import QuickCustomerDialog from "./QuickCustomerDialog";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import CurrencyInput from "../ui/CurrencyInput";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import {
  listCustomers,
  listCustomerSites,
} from "../../services/organization-service";
import useWorkspace from "../../hooks/useWorkspace";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import { resolveWorkspaceCurrency } from "../../utils/currency";
import {
  jobPriorityOptions,
  jobStatusOptions,
  toApiDateTime,
  toDateTimeLocalValue,
} from "../../utils/job-utils";

function createInitialValues(job, mode) {
  return {
    customer_id: job?.customer_id || "",
    customer_site_id: job?.customer_site_id || "",
    work_order_number: job?.work_order_number || "",
    title: job?.title || "",
    description: job?.description || "",
    job_type: job?.job_type || "",
    customer_reference: job?.customer_reference || "",
    priority: job?.priority || "normal",
    status: mode === "create" ? job?.status || "draft" : job?.status || "draft",
    scheduled_start: toDateTimeLocalValue(job?.scheduled_start),
    scheduled_end: toDateTimeLocalValue(job?.scheduled_end),
    estimated_cost: job?.estimated_cost || "",
    actual_cost: job?.actual_cost || "",
    instructions: job?.instructions || "",
    completion_notes: job?.completion_notes || "",
  };
}

function optionalText(value) {
  const normalized = value.trim();
  return normalized || null;
}

export default function JobForm({
  organizationId,
  mode = "create",
  initialJob = null,
  onSubmit,
  canCreateCustomers = false,
}) {
  const [values, setValues] = useState(() => createInitialValues(initialJob, mode));
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const { activeOrganization } = useWorkspace();
  const currencyCode = resolveWorkspaceCurrency(activeOrganization);

  useEffect(() => {
    setValues(createInitialValues(initialJob, mode));
  }, [initialJob, mode]);

  useEffect(() => {
    let active = true;
    setLoadingReferences(true);

    listCustomers(organizationId, { limit: 200 })
      .then((payload) => {
        if (active) setCustomers(Array.isArray(payload?.items) ? payload.items : []);
      })
      .catch((error) => {
        if (active) setFormError(getApiErrorMessage(error, "Unable to load customers."));
      })
      .finally(() => {
        if (active) setLoadingReferences(false);
      });

    return () => {
      active = false;
    };
  }, [organizationId]);

  useEffect(() => {
    if (!values.customer_id) {
      setSites([]);
      return;
    }

    let active = true;
    setLoadingSites(true);

    listCustomerSites(organizationId, values.customer_id, { limit: 200 })
      .then((payload) => {
        if (active) setSites(Array.isArray(payload?.items) ? payload.items : []);
      })
      .catch((error) => {
        if (active) setFormError(getApiErrorMessage(error, "Unable to load customer sites."));
      })
      .finally(() => {
        if (active) setLoadingSites(false);
      });

    return () => {
      active = false;
    };
  }, [organizationId, values.customer_id]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === values.customer_id),
    [customers, values.customer_id],
  );

  async function handleCustomerCreated(customer) {
    setCustomers((current) => [
      ...current.filter((item) => item.id !== customer.id),
      customer,
    ]);
    setValues((current) => ({
      ...current,
      customer_id: customer.id,
      customer_site_id: "",
    }));
    setSites([]);
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function validate() {
    const errors = {};
    if (!values.customer_id) errors.customer_id = "Choose a customer.";
    if (!values.title.trim()) errors.title = "Enter a job title.";
    if (values.title.trim().length > 200) errors.title = "Use 200 characters or fewer.";

    if (values.scheduled_start && values.scheduled_end) {
      const start = new Date(values.scheduled_start).getTime();
      const end = new Date(values.scheduled_end).getTime();
      if (end <= start) errors.scheduled_end = "Scheduled end must be after the start.";
    }

    if (mode === "create" && values.status === "scheduled" && !values.scheduled_start) {
      errors.scheduled_start = "Scheduled start is required for a scheduled job.";
    }

    if (mode === "edit" && !values.work_order_number.trim()) {
      errors.work_order_number = "Job number cannot be blank once the job exists.";
    }

    if (values.estimated_cost !== "" && Number(values.estimated_cost) < 0) {
      errors.estimated_cost = "Estimated cost cannot be negative.";
    }

    if (mode === "edit" && values.actual_cost !== "" && Number(values.actual_cost) < 0) {
      errors.actual_cost = "Actual cost cannot be negative.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildPayload() {
    const payload = {
      customer_id: values.customer_id,
      customer_site_id: values.customer_site_id || null,
      work_order_number: optionalText(values.work_order_number),
      title: values.title.trim(),
      description: optionalText(values.description),
      job_type: optionalText(values.job_type),
      customer_reference: optionalText(values.customer_reference),
      priority: values.priority,
      scheduled_start: toApiDateTime(values.scheduled_start),
      scheduled_end: toApiDateTime(values.scheduled_end),
      estimated_cost: values.estimated_cost === "" ? null : values.estimated_cost,
      instructions: optionalText(values.instructions),
    };

    if (mode === "create") {
      payload.status = values.status;
    } else {
      payload.actual_cost = values.actual_cost === "" ? null : values.actual_cost;
      payload.completion_notes = optionalText(values.completion_notes);
    }

    return payload;
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
      setFormError(getApiErrorMessage(error, "Unable to save this job."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <Alert variant="error">{formError}</Alert>}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Job identity</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Customer and work details</h2>
        </div>

        {canCreateCustomers && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/35 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">Need a new customer?</p>
              <p className="mt-1 text-xs text-slate-600">Create a customer and optional first site without leaving the job form.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCustomerDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Create customer
            </Button>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Customer"
            required
            value={values.customer_id}
            onChange={(event) => {
              update("customer_id", event.target.value);
              update("customer_site_id", "");
            }}
            error={fieldErrors.customer_id}
            disabled={loadingReferences}
          >
            <option value="">{loadingReferences ? "Loading customers…" : "Choose customer"}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </SelectField>

          <SelectField
            label="Customer site"
            value={values.customer_site_id}
            onChange={(event) => update("customer_site_id", event.target.value)}
            error={fieldErrors.customer_site_id}
            disabled={!values.customer_id || loadingSites}
            hint={
              values.customer_id && sites.length === 0 && !loadingSites
                ? `No active sites found for ${selectedCustomer?.name || "this customer"}.`
                : undefined
            }
          >
            <option value="">{loadingSites ? "Loading sites…" : "No specific site"}</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </SelectField>

          <TextField
            label="Job title"
            required
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            error={fieldErrors.title}
            placeholder="Borehole drilling and pump installation"
            maxLength={200}
          />

          <TextField
            label="Job number"
            value={values.work_order_number}
            onChange={(event) => update("work_order_number", event.target.value)}
            error={fieldErrors.work_order_number}
            placeholder="Leave blank for automatic numbering"
          />

          <TextField
            label="Job type"
            value={values.job_type}
            onChange={(event) => update("job_type", event.target.value)}
            error={fieldErrors.job_type}
            placeholder="Drilling, inspection, maintenance…"
          />

          <TextField
            label="Customer reference"
            value={values.customer_reference}
            onChange={(event) => update("customer_reference", event.target.value)}
            error={fieldErrors.customer_reference}
            placeholder="Customer PO or request reference"
          />

          <TextAreaField
            className="md:col-span-2"
            label="Description"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            error={fieldErrors.description}
            placeholder="Describe the scope, expected outcome, and field context."
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Planning</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Priority, status, schedule, and cost</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Priority"
            value={values.priority}
            onChange={(event) => update("priority", event.target.value)}
            error={fieldErrors.priority}
          >
            {jobPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectField>

          {mode === "create" && (
            <SelectField
              label="Initial status"
              value={values.status}
              onChange={(event) => update("status", event.target.value)}
              error={fieldErrors.status}
              hint="Future status changes are recorded in the activity timeline."
            >
              {jobStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </SelectField>
          )}

          <TextField
            label="Scheduled start"
            type="datetime-local"
            value={values.scheduled_start}
            onChange={(event) => update("scheduled_start", event.target.value)}
            error={fieldErrors.scheduled_start}
          />

          <TextField
            label="Scheduled end"
            type="datetime-local"
            value={values.scheduled_end}
            onChange={(event) => update("scheduled_end", event.target.value)}
            error={fieldErrors.scheduled_end}
          />

          <CurrencyInput
            label="Estimated cost"
            currencyCode={currencyCode}
            value={values.estimated_cost}
            onChange={(value) => update("estimated_cost", value)}
            error={fieldErrors.estimated_cost}
          />

          {mode === "edit" && (
            <CurrencyInput
              label="Actual cost"
              currencyCode={currencyCode}
              value={values.actual_cost}
              onChange={(value) => update("actual_cost", value)}
              error={fieldErrors.actual_cost}
            />
          )}

          <TextAreaField
            className="md:col-span-2"
            label="Field instructions"
            value={values.instructions}
            onChange={(event) => update("instructions", event.target.value)}
            error={fieldErrors.instructions}
            placeholder="Safety notes, access requirements, tools, materials, and execution instructions."
          />

          {mode === "edit" && (
            <TextAreaField
              className="md:col-span-2"
              label="Completion notes"
              value={values.completion_notes}
              onChange={(event) => update("completion_notes", event.target.value)}
              error={fieldErrors.completion_notes}
              placeholder="Record the completed work and final operational notes."
            />
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to={initialJob ? `/jobs/${initialJob.id}` : "/jobs"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>
        <Button type="submit" loading={submitting}>
          <Save className="h-4 w-4" />
          {mode === "create" ? "Create job" : "Save changes"}
        </Button>
      </div>

      <QuickCustomerDialog
        open={customerDialogOpen}
        organizationId={organizationId}
        onClose={() => setCustomerDialogOpen(false)}
        onCreated={handleCustomerCreated}
      />
    </form>
  );
}
