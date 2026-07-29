import { Building2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import useWorkspace from "../../hooks/useWorkspace";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import {
  isPlaceholderWorkspaceName,
  validateWorkspaceName,
} from "../../utils/workspace-name";

export default function WorkspaceSettingsPage() {
  const {
    activeOrganization,
    hasWorkspace,
    hasPermission,
    updateWorkspace,
    requiresWorkspaceRename,
  } = useWorkspace();
  const location = useLocation();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!activeOrganization) return;
    setName(
      isPlaceholderWorkspaceName(activeOrganization.name)
        ? ""
        : activeOrganization.name || "",
    );
    setCountry(
      isPlaceholderWorkspaceName(activeOrganization.country)
        ? ""
        : activeOrganization.country || "",
    );
    setTimezone(
      isPlaceholderWorkspaceName(activeOrganization.timezone)
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : activeOrganization.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "UTC",
    );
  }, [activeOrganization]);

  if (!hasWorkspace) {
    return (
      <Alert variant="error">
        Create a workspace before opening workspace settings.
      </Alert>
    );
  }

  if (!hasPermission("organizations.update")) {
    return (
      <AccessDenied
        title="Workspace settings are restricted"
        description="You need the organizations.update permission to rename or configure this workspace."
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nameError = validateWorkspaceName(name);
    if (nameError) {
      setFieldErrors({ name: nameError });
      return;
    }

    setSubmitting(true);
    setSaved(false);
    setError("");
    setFieldErrors({});

    try {
      await updateWorkspace(activeOrganization.id, {
        name: name.trim().replace(/\s+/g, " "),
        country: country.trim() || null,
        timezone: timezone.trim() || "UTC",
      });
      setSaved(true);
    } catch (requestError) {
      setFieldErrors(getApiFieldErrors(requestError));
      setError(getApiErrorMessage(requestError, "Unable to update the workspace."));
    } finally {
      setSubmitting(false);
    }
  }

  const forcedRename =
    requiresWorkspaceRename || Boolean(location.state?.workspaceNameRequired);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {forcedRename && (
        <Alert variant="error">
          <span className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            <span>
              Your workspace was created with a placeholder name. Enter the real
              organisation or operations name before continuing.
            </span>
          </span>
        </Alert>
      )}

      {saved && (
        <Alert>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Workspace details saved. The new name is now used across Novera.
          </span>
        </Alert>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Workspace profile
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Organisation settings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Set the name and regional details shown throughout jobs, reports,
            documents, navigation, and operational records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {error && <Alert variant="error">{error}</Alert>}

          <TextField
            label="Workspace name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
              if (fieldErrors.name) {
                setFieldErrors((current) => ({ ...current, name: "" }));
              }
            }}
            error={fieldErrors.name}
            hint="Use your real business, branch, or operations name."
            placeholder="Abuja Operations"
            autoComplete="organization"
            maxLength={255}
            autoFocus={forcedRename}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value);
                setSaved(false);
              }}
              error={fieldErrors.country}
              placeholder="Nigeria"
              autoComplete="country-name"
              maxLength={100}
            />
            <TextField
              label="Timezone"
              required
              value={timezone}
              onChange={(event) => {
                setTimezone(event.target.value);
                setSaved(false);
              }}
              error={fieldErrors.timezone}
              placeholder="Africa/Lagos"
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="lg" loading={submitting}>
              Save workspace
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}


