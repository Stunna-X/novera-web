import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Mail,
  Phone,
  Power,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Siren,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import AvailabilityBadge from "../../components/teams/AvailabilityBadge";
import WorkforceStatusBadge from "../../components/teams/WorkforceStatusBadge";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import SelectField from "../../components/ui/SelectField";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useOrganizationRoles from "../../hooks/useOrganizationRoles";
import useTeamDashboard from "../../hooks/useTeamDashboard";
import useWorkforceProfile from "../../hooks/useWorkforceProfile";
import useWorkspace from "../../hooks/useWorkspace";
import {
  deactivateWorkforceProfile,
  reactivateWorkforceProfile,
  updateOrganizationMemberRole,
} from "../../services/workforce-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { formatDateTime } from "../../utils/job-utils";
import {
  humanizeTeamValue,
  teamMemberName,
} from "../../utils/team-utils";

function DetailCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="mt-4 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export default function TeamMemberDetailsPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const {
    activeOrganizationId,
    access,
    isLoading: workspaceLoading,
    hasPermission,
  } = useWorkspace();
  const canRead = hasPermission("workforce.read");
  const canUpdate = hasPermission("workforce.update");
  const canDelete = hasPermission("workforce.delete");
  const canReadDashboard = hasPermission("work_orders.read");
  const canChangeRole =
    hasPermission("memberships.update") && hasPermission("roles.assign");
  const canReadRoles = hasPermission("roles.read");

  const { profile, loading, error, reload, setProfile } = useWorkforceProfile({
    organizationId: activeOrganizationId,
    profileId,
    enabled: Boolean(activeOrganizationId && canRead),
  });
  const { dashboard } = useTeamDashboard({
    organizationId: activeOrganizationId,
    enabled: Boolean(activeOrganizationId && canReadDashboard),
  });

  const accessRoles = useMemo(
    () => (Array.isArray(access?.available_roles) ? access.available_roles : []),
    [access?.available_roles],
  );
  const { roles } = useOrganizationRoles({
    organizationId: activeOrganizationId,
    initialRoles: accessRoles,
    enabled: Boolean(activeOrganizationId && canReadRoles && canChangeRole),
  });

  const [action, setAction] = useState("");
  const [actionError, setActionError] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleMessage, setRoleMessage] = useState("");

  useEffect(() => {
    if (profile?.role_name) setRoleName(profile.role_name);
  }, [profile?.role_name]);

  const workload = useMemo(
    () =>
      dashboard?.workforce?.find(
        (item) => item.workforce_profile_id === profileId,
      ) || null,
    [dashboard?.workforce, profileId],
  );

  if (workspaceLoading || loading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }
  if (!activeOrganizationId) {
    return <WorkspaceEmptyState returnTo={`/teams/${profileId}`} />;
  }
  if (!canRead) {
    return (
      <AccessDenied description="Your workspace role does not allow workforce records to be viewed." />
    );
  }
  if (error || !profile) {
    return (
      <Alert variant="error">
        {getApiErrorMessage(error, "Unable to load this team member.")}
      </Alert>
    );
  }

  async function handleDeactivate() {
    if (!window.confirm(`Deactivate ${teamMemberName(profile)}'s workforce profile?`)) return;
    setAction("deactivate");
    setActionError(null);
    try {
      await deactivateWorkforceProfile(activeOrganizationId, profileId);
      reload();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setAction("");
    }
  }

  async function handleReactivate() {
    setAction("reactivate");
    setActionError(null);
    try {
      const updated = await reactivateWorkforceProfile(
        activeOrganizationId,
        profileId,
      );
      setProfile(updated);
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setAction("");
    }
  }

  async function handleRoleChange(event) {
    event.preventDefault();
    if (!roleName || roleName === profile.role_name) return;
    setRoleSaving(true);
    setActionError(null);
    setRoleMessage("");
    try {
      const membership = await updateOrganizationMemberRole(
        activeOrganizationId,
        profile.membership_id,
        roleName,
      );
      setProfile((current) => ({
        ...current,
        role_name: membership?.role?.name || roleName,
      }));
      setRoleMessage("Workspace role updated.");
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setRoleSaving(false);
    }
  }

  const joinedText = profile.joined_on
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(`${profile.joined_on}T00:00:00`),
      )
    : "Not recorded";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/teams")}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Teams
        </button>
        <button
          type="button"
          onClick={reload}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Refresh team member"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {actionError ? (
        <Alert variant="error">
          {getApiErrorMessage(actionError, "Unable to complete this action.")}
        </Alert>
      ) : null}

      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/75 to-emerald-950/25 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <WorkforceStatusBadge status={profile.status} />
              <AvailabilityBadge available={profile.is_available} />
              {!profile.is_active ? (
                <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-200">
                  Deactivated record
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {teamMemberName(profile)}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {profile.job_title || "No job title recorded"} · {profile.role_name}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate && profile.is_active ? (
              <Link
                to={`/teams/${profileId}/edit`}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </Link>
            ) : null}
            {canDelete && profile.is_active ? (
              <Button
                variant="danger"
                size="sm"
                loading={action === "deactivate"}
                onClick={handleDeactivate}
              >
                <Power className="h-4 w-4" /> Deactivate
              </Button>
            ) : null}
            {canUpdate && !profile.is_active ? (
              <Button
                variant="secondary"
                size="sm"
                loading={action === "reactivate"}
                onClick={handleReactivate}
              >
                <RotateCcw className="h-4 w-4" /> Reactivate
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard icon={UserRound} label="Employment">
          <p className="font-semibold text-white">
            {profile.job_title || "No job title"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {humanizeTeamValue(profile.employment_type)} · {profile.employee_code || "No employee code"}
          </p>
        </DetailCard>
        <DetailCard icon={Mail} label="Contact">
          <p className="truncate font-semibold text-white">{profile.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {profile.phone || "No work phone recorded"}
          </p>
        </DetailCard>
        <DetailCard icon={CalendarDays} label="Workforce dates">
          <p className="font-semibold text-white">Joined {joinedText}</p>
          <p className="mt-1 text-xs text-slate-500">
            Added {formatDateTime(profile.created_at)}
          </p>
        </DetailCard>
        <DetailCard icon={BriefcaseBusiness} label="Assignment workload">
          <p className="font-semibold text-white">
            {workload ? `${workload.open_assignment_count} open` : "Not available"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {workload
              ? `${workload.completed_assignment_count} completed assignments`
              : "Requires work-order dashboard access"}
          </p>
        </DetailCard>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            <h2 className="font-semibold text-white">Skills</h2>
            {profile.skills?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No skills recorded.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            <h2 className="font-semibold text-white">Internal workforce notes</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {profile.notes || "No workforce notes recorded."}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-rose-300" />
              <h2 className="font-semibold text-white">Emergency contact</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p className="font-medium text-slate-200">
                {profile.emergency_contact_name || "No contact recorded"}
              </p>
              <p className="flex items-center gap-2 text-slate-500">
                <Phone className="h-4 w-4" />
                {profile.emergency_contact_phone || "No phone recorded"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <h2 className="font-semibold text-white">Workspace access role</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              The access role controls what this member can view and change across Novera. It is separate from the operational job title.
            </p>

            {canChangeRole && roles.length > 0 ? (
              <form onSubmit={handleRoleChange} className="mt-5 space-y-3">
                <SelectField
                  label="Assigned role"
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role.id || role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </SelectField>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  loading={roleSaving}
                  disabled={!roleName || roleName === profile.role_name}
                  className="w-full"
                >
                  Save role
                </Button>
                {roleMessage ? (
                  <p className="text-xs font-medium text-emerald-300">
                    {roleMessage}
                  </p>
                ) : null}
              </form>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/35 px-4 py-3">
                <p className="text-sm font-semibold text-white">{profile.role_name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  You do not have permission to change this role.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
