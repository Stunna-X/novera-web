import { ArrowLeft, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import QuickCustomerDialog from "./QuickCustomerDialog";
import QuickSiteDialog from "./QuickSiteDialog";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import CurrencyInput from "../ui/CurrencyInput";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import useWorkspace from "../../hooks/useWorkspace";
import {
  listCustomers,
  listCustomerSites,
} from "../../services/organization-service";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import { resolveWorkspaceCurrency } from "../../utils/currency";
import {
  jobPriorityOptions,
  toApiDateTime,
  toDateTimeLocalValue,
} from "../../utils/job-utils";

function createInitialValues(job) {
  return {
    customer_id: job?.customer_id || "",
    customer_site_id: job?.customer_site_id || "",
    work_order_number: job?.work_order_number || "",
    title: job?.title || "",
    description: job?.description || "",
    job_type: job?.job_type || "",
    customer_reference: job?.customer_reference || "",
    priority: job?.priority || "normal",
    scheduled_start: toDateTimeLocalValue(job?.scheduled_start),
    scheduled_end: toDateTimeLocalValue(job?.scheduled_end),
    estimated_cost: job?.estimated_cost || "",
    actual_cost: job?.actual_cost || "",
    instructions: job?.instructions || "",
    completion_notes: job?.completion_notes || "",
  };
}

function optionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export default function JobForm({
  organizationId,
  mode = "create",
  initialJob = null,
  onSubmit,
  canCreateCustomers = false,
}) {
  const [values, setValues] = useState(() => createInitialValues(initialJob));
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const { activeOrganization } = useWorkspace();
  const currencyCode = resolveWorkspaceCurrency(activeOrganization);
  const isCreateMode = mode === "create";

  useEffect(() => {
    setValues(createInitialValues(initialJob));
  }, [initialJob]);

  useEffect(() => {
    let active = true;
    setLoadingReferences(true);

    listCustomers(organizationId, { limit: 200 })
      .then((payload) => {
        if (active) {
          setCustomers(Array.isArray(payload?.items) ? payload.items : []);
        }
      })
      .catch((error) => {
        if (active) {
          setFormError(getApiErrorMessage(error, "Unable to load customers."));
        }
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
      setLoadingSites(false);
      return undefined;
    }

    let active = true;
    setLoadingSites(true);

    listCustomerSites(organizationId, values.customer_id, { limit: 200 })
      .then((payload) => {
        if (active) {
          setSites(Array.isArray(payload?.items) ? payload.items : []);
        }
      })
      .catch((error) => {
        if (active) {
          setFormError(
            getApiErrorMessage(error, "Unable to load customer sites."),
          );
        }
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
    setFieldErrors((current) => ({
      ...current,
      customer_id: undefined,
      customer_site_id: undefined,
    }));
    setFormError("");
  }

  async function handleSiteCreated(site) {
    setSites((current) => [
      ...current.filter((item) => item.id !== site.id),
      site,
    ]);
    setValues((current) => ({
      ...current,
      customer_site_id: site.id,
    }));
    setFieldErrors((current) => ({
      ...current,
      customer_site_id: undefined,
    }));
    setFormError("");
  }

  function handleCustomerChange(customerId) {
    setValues((current) => ({
      ...current,
      customer_id: customerId,
      customer_site_id: "",
    }));
    setSites([]);
    setFieldErrors((current) => ({
      ...current,
      customer_id: undefined,
      customer_site_id: undefined,
    }));
    setFormError("");
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function validate() {
    const errors = {};

    if (!values.customer_id) {
      errors.customer_id = "Choose a customer.";
    }

    if (!values.title.trim()) {
      errors.title = "Enter a job title.";
    } else if (values.title.trim().length > 200) {
      errors.title = "Use 200 characters or fewer.";
    }

    if (!isCreateMode && !values.work_order_number.trim()) {
      errors.work_order_number = "Job number cannot be blank.";
    }

    if (
      values.scheduled_start &&
      values.scheduled_end &&
      new Date(values.scheduled_end).getTime() <=
        new Date(values.scheduled_start).getTime()
    ) {
      errors.scheduled_end = "Scheduled end must be after the start.";
    }

    if (values.estimated_cost !== "" && Number(values.estimated_cost) < 0) {
      errors.estimated_cost = "Estimated cost cannot be negative.";
    }

    if (
      !isCreateMode &&
      values.actual_cost !== "" &&
      Number(values.actual_cost) < 0
    ) {
      errors.actual_cost = "Actual cost cannot be negative.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildPayload() {
    if (isCreateMode) {
      return {
        customer_id: values.customer_id,
        customer_site_id: values.customer_site_id || null,
        title: values.title.trim(),
        description: optionalText(values.description),
        job_type: optionalText(values.job_type),
        priority: values.priority,
        status: "draft",
        scheduled_start: toApiDateTime(values.scheduled_start),
      };
    }

    return {
      customer_id: values.customer_id,
      customer_site_id: values.customer_site_id || null,
      work_order_number: values.work_order_number.trim(),
      title: values.title.trim(),
      description: optionalText(values.description),
      job_type: optionalText(values.job_type),
      customer_reference: optionalText(values.customer_reference),
      priority: values.priority,
      scheduled_start: toApiDateTime(values.scheduled_start),
      scheduled_end: toApiDateTime(values.scheduled_end),
      estimated_cost:
        values.estimated_cost === "" ? null : values.estimated_cost,
      actual_cost: values.actual_cost === "" ? null : values.actual_cost,
      instructions: optionalText(values.instructions),
      completion_notes: optionalText(values.completion_notes),
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
      setFormError(getApiErrorMessage(error, "Unable to save this job."));
    } finally {
      setSubmitting(false);
    }
  }

  const customerFields = (
    <>
      <SelectField
        label="Customer"
        required
        value={values.customer_id}
        onChange={(event) => handleCustomerChange(event.target.value)}
        error={!values.customer_id ? fieldErrors.customer_id : undefined}
        disabled={loadingReferences}
      >
        <option value="">
          {loadingReferences ? "Loading customers..." : "Choose customer"}
        </option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </SelectField>

      <div className="relative">
        <SelectField
          label="Job site"
          value={values.customer_site_id}
          onChange={(event) =>
            update("customer_site_id", event.target.value)
          }
          error={fieldErrors.customer_site_id}
          disabled={!values.customer_id || loadingSites}
        >
          <option value="">
            {loadingSites ? "Loading sites..." : "No specific site"}
          </option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </SelectField>

        {canCreateCustomers && values.customer_id && (
          <button
            type="button"
            onClick={() => setSiteDialogOpen(true)}
            className="absolute right-0 top-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add site
          </button>
        )}
      </div>
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <Alert variant="error">{formError}</Alert>}

      {isCreateMode ? (
        <>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-white">
                Customer
              </h2>

              {canCreateCustomers && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCustomerDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add customer
                </Button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {customerFields}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
            <h2 className="mb-5 text-base font-semibold text-white">
              Job details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                className="md:col-span-2"
                label="Job title"
                required
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                error={fieldErrors.title}
                placeholder="Borehole drilling and pump installation"
                maxLength={200}
              />

              <TextField
                label="Job type"
                value={values.job_type}
                onChange={(event) => update("job_type", event.target.value)}
                error={fieldErrors.job_type}
                placeholder="Borehole drilling"
                maxLength={100}
              />

              <SelectField
                label="Priority"
                value={values.priority}
                onChange={(event) => update("priority", event.target.value)}
                error={fieldErrors.priority}
              >
                {jobPriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>

              <TextField
                label="Planned start"
                type="datetime-local"
                value={values.scheduled_start}
                onChange={(event) =>
                  update("scheduled_start", event.target.value)
                }
                error={fieldErrors.scheduled_start}
              />

              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                error={fieldErrors.description}
                placeholder="Optional job scope or field note"
                rows={3}
                maxLength={10000}
              />
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-white">
                Customer and job
              </h2>

              {canCreateCustomers && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCustomerDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add customer
                </Button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {customerFields}

              <TextField
                label="Job title"
                required
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                error={fieldErrors.title}
                maxLength={200}
              />

              <TextField
                label="Job number"
                required
                value={values.work_order_number}
                onChange={(event) =>
                  update("work_order_number", event.target.value)
                }
                error={fieldErrors.work_order_number}
                maxLength={50}
              />

              <TextField
                label="Job type"
                value={values.job_type}
                onChange={(event) => update("job_type", event.target.value)}
                error={fieldErrors.job_type}
                maxLength={100}
              />

              <TextField
                label="Customer reference"
                value={values.customer_reference}
                onChange={(event) =>
                  update("customer_reference", event.target.value)
                }
                error={fieldErrors.customer_reference}
                maxLength={100}
              />

              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                error={fieldErrors.description}
                rows={4}
                maxLength={10000}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
            <h2 className="mb-5 text-base font-semibold text-white">
              Planning and completion
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Priority"
                value={values.priority}
                onChange={(event) => update("priority", event.target.value)}
                error={fieldErrors.priority}
              >
                {jobPriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>

              <TextField
                label="Scheduled start"
                type="datetime-local"
                value={values.scheduled_start}
                onChange={(event) =>
                  update("scheduled_start", event.target.value)
                }
                error={fieldErrors.scheduled_start}
              />

              <TextField
                label="Scheduled end"
                type="datetime-local"
                value={values.scheduled_end}
                onChange={(event) =>
                  update("scheduled_end", event.target.value)
                }
                error={fieldErrors.scheduled_end}
              />

              <CurrencyInput
                label="Estimated cost"
                currencyCode={currencyCode}
                value={values.estimated_cost}
                onChange={(value) => update("estimated_cost", value)}
                error={fieldErrors.estimated_cost}
              />

              <CurrencyInput
                label="Actual cost"
                currencyCode={currencyCode}
                value={values.actual_cost}
                onChange={(value) => update("actual_cost", value)}
                error={fieldErrors.actual_cost}
              />

              <TextAreaField
                className="md:col-span-2"
                label="Field instructions"
                value={values.instructions}
                onChange={(event) => update("instructions", event.target.value)}
                error={fieldErrors.instructions}
                rows={4}
                maxLength={10000}
              />

              <TextAreaField
                className="md:col-span-2"
                label="Completion notes"
                value={values.completion_notes}
                onChange={(event) =>
                  update("completion_notes", event.target.value)
                }
                error={fieldErrors.completion_notes}
                rows={4}
                maxLength={10000}
              />
            </div>
          </section>
        </>
      )}

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
          {isCreateMode ? "Create job" : "Save changes"}
        </Button>
      </div>

      <QuickCustomerDialog
        open={customerDialogOpen}
        organizationId={organizationId}
        onClose={() => setCustomerDialogOpen(false)}
        onCreated={handleCustomerCreated}
      />

      <QuickSiteDialog
        open={siteDialogOpen}
        organizationId={organizationId}
        customerId={values.customer_id}
        customerName={selectedCustomer?.name || ""}
        onClose={() => setSiteDialogOpen(false)}
        onCreated={handleSiteCreated}
      />
    </form>
  );
}