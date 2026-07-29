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

function jobsPath(organizationId, suffix = "") {
  return `/organizations/${organizationId}/work-orders${suffix}`;
}

export function listJobs(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(jobsPath(organizationId, buildQuery(parameters)), { signal });
}

export function createJob(organizationId, payload) {
  return apiRequest(jobsPath(organizationId), {
    method: "POST",
    body: payload,
  });
}

export function getJob(
  organizationId,
  jobId,
  { includeInactive = true, signal } = {},
) {
  return apiRequest(
    jobsPath(
      organizationId,
      `/${jobId}${buildQuery({ include_inactive: includeInactive })}`,
    ),
    { signal },
  );
}

export function updateJob(organizationId, jobId, payload) {
  return apiRequest(jobsPath(organizationId, `/${jobId}`), {
    method: "PATCH",
    body: payload,
  });
}

export function changeJobStatus(organizationId, jobId, payload) {
  return apiRequest(jobsPath(organizationId, `/${jobId}/status`), {
    method: "PATCH",
    body: payload,
  });
}

export function deactivateJob(organizationId, jobId) {
  return apiRequest(jobsPath(organizationId, `/${jobId}`), {
    method: "DELETE",
  });
}

export function reactivateJob(organizationId, jobId) {
  return apiRequest(jobsPath(organizationId, `/${jobId}/reactivate`), {
    method: "PATCH",
  });
}

export function listJobActivities(
  organizationId,
  jobId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    jobsPath(organizationId, `/${jobId}/activities${buildQuery(parameters)}`),
    { signal },
  );
}

export function assignWorkforceMember(organizationId, jobId, workforceProfileId) {
  return apiRequest(
    jobsPath(organizationId, `/${jobId}/workforce/${workforceProfileId}`),
    { method: "POST" },
  );
}

export function removeWorkforceMember(organizationId, jobId, workforceProfileId) {
  return apiRequest(
    jobsPath(organizationId, `/${jobId}/workforce/${workforceProfileId}`),
    { method: "DELETE" },
  );
}

export function assignAsset(organizationId, jobId, assetId) {
  return apiRequest(jobsPath(organizationId, `/${jobId}/assets/${assetId}`), {
    method: "POST",
  });
}

export function removeAsset(organizationId, jobId, assetId) {
  return apiRequest(jobsPath(organizationId, `/${jobId}/assets/${assetId}`), {
    method: "DELETE",
  });
}
