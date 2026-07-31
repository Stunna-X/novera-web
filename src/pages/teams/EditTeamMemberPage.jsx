import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import WorkforceProfileForm from "../../components/teams/WorkforceProfileForm";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useWorkforceProfile from "../../hooks/useWorkforceProfile";
import useWorkspace from "../../hooks/useWorkspace";
import { updateWorkforceProfile } from "../../services/workforce-service";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../utils/api-errors";
import {
  buildWorkforcePayload,
  profileToFormValues,
  teamMemberName,
} from "../../utils/team-utils";

export default function EditTeamMemberPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { activeOrganizationId, isLoading: workspaceLoading, hasPermission } =
    useWorkspace();
  const canRead = hasPermission("workforce.read");
  const canUpdate = hasPermission("workforce.update");
  const { profile, loading, error: loadError } = useWorkforceProfile({
    organizationId: activeOrganizationId,
    profileId,
    enabled: Boolean(activeOrganizationId && canRead),
  });
  const [values, setValues] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (profile) setValues(profileToFormValues(profile));
  }, [profile]);

  if (workspaceLoading || loading || !values) {
    if (!activeOrganizationId && !workspaceLoading) {
      return <WorkspaceEmptyState returnTo={`/teams/${profileId}/edit`} />;
    }
    if (!canRead && !workspaceLoading) {
      return <AccessDenied description="Your workspace role does not allow workforce records to be viewed." />;
    }
    if (loadError) {
      return (
        <Alert variant="error">
          {getApiErrorMessage(loadError, "Unable to load this team member.")}
        </Alert>
      );
    }
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }

  if (!canUpdate) {
    return (
      <AccessDenied description="Your workspace role does not allow workforce profiles to be updated." />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await updateWorkforceProfile(
        activeOrganizationId,
        profileId,
        buildWorkforcePayload(values),
      );
      navigate(`/teams/${profileId}`);
    } catch (requestError) {
      setError(requestError);
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/teams/${profileId}`}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Back to team member"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Workforce
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Edit {teamMemberName(profile)}
          </h1>
        </div>
      </div>

      {error ? (
        <Alert variant="error">
          {getApiErrorMessage(error, "Unable to update the workforce profile.")}
        </Alert>
      ) : null}

      <WorkforceProfileForm
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        submitting={submitting}
        submitLabel="Save changes"
        cancelTo={`/teams/${profileId}`}
      />
    </div>
  );
}
