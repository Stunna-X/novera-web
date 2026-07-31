import { Save } from "lucide-react";
import { Link } from "react-router";

import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import { EMPLOYMENT_TYPES, WORKFORCE_STATUSES } from "../../utils/team-utils";

export default function WorkforceProfileForm({
  values,
  onChange,
  onSubmit,
  fieldErrors = {},
  submitting = false,
  submitLabel = "Save team member",
  cancelTo = "/teams",
  sourceSection = null,
}) {
  function change(field) {
    return (event) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onChange({ ...values, [field]: value });
    };
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {sourceSection}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Workforce profile
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Employment and field details
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Record the information used for field assignments, availability, and operational contact.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Employee code"
            value={values.employeeCode}
            onChange={change("employeeCode")}
            maxLength={50}
            placeholder="EMP-001"
            error={fieldErrors.employee_code}
          />
          <TextField
            label="Job title"
            value={values.jobTitle}
            onChange={change("jobTitle")}
            maxLength={120}
            placeholder="Drilling supervisor, technician…"
            error={fieldErrors.job_title}
          />
          <SelectField
            label="Employment type"
            value={values.employmentType}
            onChange={change("employmentType")}
            error={fieldErrors.employment_type}
          >
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option.value || "blank"} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Work phone"
            value={values.phone}
            onChange={change("phone")}
            maxLength={50}
            placeholder="+234…"
            error={fieldErrors.phone}
          />
          <TextField
            label="Joined on"
            type="date"
            value={values.joinedOn}
            onChange={change("joinedOn")}
            error={fieldErrors.joined_on}
          />
          <SelectField
            label="Workforce status"
            value={values.status}
            onChange={change("status")}
            error={fieldErrors.status}
          >
            {WORKFORCE_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/35 px-4 py-3">
          <input
            type="checkbox"
            checked={values.isAvailable}
            onChange={change("isAvailable")}
            className="mt-1 h-4 w-4 accent-emerald-400"
          />
          <span>
            <span className="block text-sm font-medium text-slate-200">
              Available for field assignment
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Turn this off when the person should not appear as available for new jobs.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Capability and safety
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Skills and emergency contact
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Emergency contact name"
            value={values.emergencyContactName}
            onChange={change("emergencyContactName")}
            maxLength={160}
            placeholder="Full name"
            error={fieldErrors.emergency_contact_name}
          />
          <TextField
            label="Emergency contact phone"
            value={values.emergencyContactPhone}
            onChange={change("emergencyContactPhone")}
            maxLength={50}
            placeholder="+234…"
            error={fieldErrors.emergency_contact_phone}
          />
          <TextField
            className="md:col-span-2"
            label="Skills"
            value={values.skillsText}
            onChange={change("skillsText")}
            placeholder="Borehole drilling, pump installation, welding"
            hint="Separate skills with commas. Duplicate entries are removed automatically."
            error={fieldErrors.skills}
          />
          <TextAreaField
            className="md:col-span-2"
            label="Internal workforce notes"
            value={values.notes}
            onChange={change("notes")}
            maxLength={5000}
            rows={5}
            placeholder="Certifications, field restrictions, availability notes, or operational context."
            error={fieldErrors.notes}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Cancel
        </Link>
        <Button type="submit" loading={submitting}>
          <Save className="h-4 w-4" /> {submitLabel}
        </Button>
      </div>
    </form>
  );
}
