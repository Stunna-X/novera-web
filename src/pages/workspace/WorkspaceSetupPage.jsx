import { Building2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import useWorkspace from "../../hooks/useWorkspace";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import { validateWorkspaceName } from "../../utils/workspace-name";

export default function WorkspaceSetupPage() {
  const { createWorkspace, organizations } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const returnTo = location.state?.from || "/jobs";

  async function handleSubmit(event) {
    event.preventDefault();
    const nameError = validateWorkspaceName(name);
    if (nameError) {
      setFieldErrors({ name: nameError });
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await createWorkspace({
        name: name.trim().replace(/\s+/g, " "),
        timezone,
        ...(country.trim() ? { country: country.trim() } : {}),
      });
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      setFieldErrors(getApiFieldErrors(requestError));
      setError(getApiErrorMessage(requestError, "Unable to create your workspace."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Organisation setup</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Create your Novera workspace</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">This organisation will own its customers, sites, workforce, equipment, jobs, inventory, permissions, and operational history.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {error && <Alert variant="error">{error}</Alert>}
          {organizations.length > 0 && (
            <Alert>
              You already have {organizations.length} workspace{organizations.length === 1 ? "" : "s"}. Creating another one will add a separate operational organisation.
            </Alert>
          )}

          <TextField
            label="Workspace name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (fieldErrors.name) {
                setFieldErrors((current) => ({ ...current, name: "" }));
              }
            }}
            error={fieldErrors.name}
            hint="Use your real business, branch, or operations name."
            placeholder="Abuja Operations"
            autoComplete="organization"
            maxLength={255}
          />
          <TextField
            label="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            error={fieldErrors.country}
            placeholder="Nigeria"
            autoComplete="country-name"
            maxLength={100}
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Detected timezone</p>
                <p className="mt-1 text-xs text-slate-500">{timezone}</p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
            Create workspace
          </Button>
        </form>
      </section>
    </div>
  );
}
