import { apiRequest } from "../lib/api-client";

function buildQuery(parameters = {}) {
  const search = new URLSearchParams();

  Object.entries(parameters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

function organizationPath(organizationId, suffix = "") {
  return `/organizations/${organizationId}${suffix}`;
}

function workforcePath(organizationId, suffix = "") {
  return organizationPath(organizationId, `/workforce${suffix}`);
}

export function listWorkforceProfiles(
  organizationId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    workforcePath(organizationId, buildQuery(parameters)),
    { signal },
  );
}

export function createWorkforceProfile(organizationId, payload) {
  return apiRequest(workforcePath(organizationId), {
    method: "POST",
    body: payload,
  });
}

export function getWorkforceProfile(
  organizationId,
  profileId,
  { includeInactive = true, signal } = {},
) {
  return apiRequest(
    workforcePath(
      organizationId,
      `/${profileId}${buildQuery({ include_inactive: includeInactive })}`,
    ),
    { signal },
  );
}

export function updateWorkforceProfile(organizationId, profileId, payload) {
  return apiRequest(workforcePath(organizationId, `/${profileId}`), {
    method: "PATCH",
    body: payload,
  });
}

export function deactivateWorkforceProfile(organizationId, profileId) {
  return apiRequest(workforcePath(organizationId, `/${profileId}`), {
    method: "DELETE",
  });
}

export function reactivateWorkforceProfile(organizationId, profileId) {
  return apiRequest(
    workforcePath(organizationId, `/${profileId}/reactivate`),
    { method: "PATCH" },
  );
}

export function listOrganizationMembers(organizationId, { signal } = {}) {
  return apiRequest(organizationPath(organizationId, "/members"), { signal });
}

export function addOrganizationMember(organizationId, payload) {
  return apiRequest(organizationPath(organizationId, "/members"), {
    method: "POST",
    body: payload,
  });
}

export function updateOrganizationMemberRole(
  organizationId,
  membershipId,
  roleName,
) {
  return apiRequest(
    organizationPath(organizationId, `/members/${membershipId}/role`),
    {
      method: "PATCH",
      body: { role_name: roleName },
    },
  );
}

export function listOrganizationRoles(organizationId, { signal } = {}) {
  return apiRequest(organizationPath(organizationId, "/roles"), { signal });
}

export function getTeamDashboard(
  organizationId,
  { limit = 100, signal } = {},
) {
  return apiRequest(
    organizationPath(
      organizationId,
      `/dashboard/team${buildQuery({ limit })}`,
    ),
    { signal },
  );
}
