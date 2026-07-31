import { ArrowLeft, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import WorkforceProfileForm from "../../components/teams/WorkforceProfileForm";
import Alert from "../../components/ui/Alert";
import SelectField from "../../components/ui/SelectField";
import TextField from "../../components/ui/TextField";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useOrganizationMembers from "../../hooks/useOrganizationMembers";
import useOrganizationRoles from "../../hooks/useOrganizationRoles";
import useWorkforce from "../../hooks/useWorkforce";
import useWorkspace from "../../hooks/useWorkspace";
import {
  addOrganizationMember,
  createWorkforceProfile,
} from "../../services/workforce-service";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../utils/api-errors";
import {
  buildWorkforcePayload,
  membershipName,
} from "../../utils/team-utils";

const initialValues = {
  employeeCode: "",
  jobTitle: "",
  employmentType: "",
  phone: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  skillsText: "",
  joinedOn: "",
  status: "active",
  isAvailable: true,
  notes: "",
};

export default function CreateTeamMemberPage() {
  const navigate = useNavigate();
  const {
    activeOrganizationId,
    access,
    isLoading: workspaceLoading,
    hasPermission,
  } = useWorkspace();
  const canCreateProfile = hasPermission("workforce.create");
  const canReadWorkforce = hasPermission("workforce.read");
  const canReadMembers = hasPermission("memberships.read");
  const canAddMembers =
    hasPermission("memberships.create") && hasPermission("roles.assign");
  const canReadRoles = hasPermission("roles.read");
  const [sourceMode, setSourceMode] = useState("existing");
  const [membershipId, setMembershipId] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("");
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState("");

  const { members, loading: membersLoading, error: membersError, reload: reloadMembers } =
    useOrganizationMembers({
      organizationId: activeOrganizationId,
      enabled: Boolean(activeOrganizationId && canReadMembers),
    });

  const { items: profiles } = useWorkforce({
    organizationId: activeOrganizationId,
    limit: 200,
    includeInactive: true,
    enabled: Boolean(activeOrganizationId && canReadWorkforce),
  });

  const accessRoles = useMemo(
    () => (Array.isArray(access?.available_roles) ? access.available_roles : []),
    [access?.available_roles],
  );
  const { roles, loading: rolesLoading, error: rolesError } =
    useOrganizationRoles({
      organizationId: activeOrganizationId,
      initialRoles: accessRoles,
      enabled: Boolean(activeOrganizationId && canReadRoles),
    });

  const profiledMembershipIds = useMemo(
    () => new Set(profiles.map((profile) => profile.membership_id)),
    [profiles],
  );
  const availableMembers = useMemo(
    () => members.filter((member) => !profiledMembershipIds.has(member.id)),
    [members, profiledMembershipIds],
  );

  useEffect(() => {
    if (!canReadMembers && canAddMembers) {
      setSourceMode("registered");
    } else if (canReadMembers && !canAddMembers) {
      setSourceMode("existing");
    }
  }, [canAddMembers, canReadMembers]);

  useEffect(() => {
    if (sourceMode === "existing" && !membershipId && availableMembers[0]) {
      setMembershipId(availableMembers[0].id);
    }
  }, [availableMembers, membershipId, sourceMode]);

  useEffect(() => {
    if (!roleName && roles[0]?.name) setRoleName(roles[0].name);
  }, [roleName, roles]);

  if (workspaceLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/60" />;
  }
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo="/teams/new" />;
  if (!canCreateProfile) {
    return (
      <AccessDenied description="Your workspace role does not allow workforce profiles to be created." />
    );
  }
  if (!canReadMembers && !canAddMembers) {
    return (
      <AccessDenied description="Creating a workforce profile requires access to select an organization member or add a registered Novera user." />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setNotice("");

    const localErrors = {};
    if (sourceMode === "existing" && !membershipId) {
      localErrors.membership_id = "Choose an organization member.";
    }
    if (sourceMode === "registered") {
      if (!email.trim()) localErrors.email = "Enter the registered user's email.";
      if (!roleName.trim()) localErrors.role_name = "Choose or enter a role.";
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setSubmitting(true);
    let selectedMembershipId = membershipId;
    let membershipWasCreated = false;

    try {
      if (sourceMode === "registered") {
        const membership = await addOrganizationMember(activeOrganizationId, {
          email: email.trim(),
          role_name: roleName.trim(),
        });
        selectedMembershipId = membership.id;
        membershipWasCreated = true;
      }

      const profile = await createWorkforceProfile(
        activeOrganizationId,
        buildWorkforcePayload(
          { ...values, membershipId: selectedMembershipId },
          { includeMembership: true },
        ),
      );

      navigate(`/teams/${profile.id}`);
    } catch (requestError) {
      setError(requestError);
      setFieldErrors(getApiFieldErrors(requestError));

      if (membershipWasCreated) {
        setNotice(
          "The user was added to the workspace, but the workforce profile was not completed. The new member can now be selected under Existing workspace member before retrying.",
        );
        setSourceMode("existing");
        setMembershipId(selectedMembershipId);
        reloadMembers();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const sourceSection = (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
      <div className="border-b border-slate-800 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Account and access
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          Select the Novera user
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          A workforce profile belongs to an organization member. New people must already have a registered Novera account.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {canReadMembers ? (
          <button
            type="button"
            onClick={() => setSourceMode("existing")}
            className={`rounded-xl border p-4 text-left transition ${
              sourceMode === "existing"
                ? "border-emerald-400/50 bg-emerald-400/10"
                : "border-slate-800 bg-slate-950/30 hover:border-slate-700"
            }`}
          >
            <UsersRound className="h-5 w-5 text-emerald-300" />
            <span className="mt-3 block text-sm font-semibold text-white">
              Existing workspace member
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Create a workforce profile for someone already added to this workspace.
            </span>
          </button>
        ) : null}

        {canAddMembers ? (
          <button
            type="button"
            onClick={() => setSourceMode("registered")}
            className={`rounded-xl border p-4 text-left transition ${
              sourceMode === "registered"
                ? "border-emerald-400/50 bg-emerald-400/10"
                : "border-slate-800 bg-slate-950/30 hover:border-slate-700"
            }`}
          >
            <UserPlus className="h-5 w-5 text-emerald-300" />
            <span className="mt-3 block text-sm font-semibold text-white">
              Add registered Novera user
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Add an existing Novera account to this workspace and create its workforce profile.
            </span>
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {sourceMode === "existing" ? (
          <SelectField
            label="Organization member"
            required
            value={membershipId}
            onChange={(event) => setMembershipId(event.target.value)}
            disabled={membersLoading}
            error={fieldErrors.membership_id}
            hint={
              availableMembers.length === 0
                ? "Every visible organization member already has a workforce profile."
                : undefined
            }
          >
            <option value="">Choose a member</option>
            {membershipId &&
            !availableMembers.some((member) => member.id === membershipId) ? (
              <option value={membershipId}>Recently added workspace member</option>
            ) : null}
            {availableMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {membershipName(member)} • {member.role?.name}
              </option>
            ))}
          </SelectField>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Registered email address"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              hint="This does not send an invitation. The person must already have a Novera account."
              error={fieldErrors.email}
            />
            {roles.length > 0 ? (
              <SelectField
                label="Workspace role"
                required
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                disabled={rolesLoading}
                error={fieldErrors.role_name}
              >
                {roles.map((role) => (
                  <option key={role.id || role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </SelectField>
            ) : (
              <TextField
                label="Workspace role name"
                required
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                placeholder="Technician"
                error={fieldErrors.role_name}
              />
            )}
          </div>
        )}
      </div>

      {membersError ? (
        <Alert variant="error" className="mt-5">
          {getApiErrorMessage(membersError, "Unable to load workspace members.")}
        </Alert>
      ) : null}
      {rolesError ? (
        <Alert variant="error" className="mt-5">
          {getApiErrorMessage(rolesError, "Unable to load workspace roles.")}
        </Alert>
      ) : null}
    </section>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/teams"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Back to teams"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Workforce
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Add team member</h1>
        </div>
      </div>

      {notice ? <Alert variant="info">{notice}</Alert> : null}
      {error ? (
        <Alert variant="error">
          {getApiErrorMessage(error, "Unable to create the workforce profile.")}
        </Alert>
      ) : null}

      <WorkforceProfileForm
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        submitting={submitting}
        submitLabel="Add team member"
        sourceSection={sourceSection}
      />
    </div>
  );
}

