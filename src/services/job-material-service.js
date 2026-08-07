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

function materialPath(organizationId, jobId, suffix = "") {
  return `/organizations/${organizationId}/work-orders/${jobId}/materials${suffix}`;
}

export function listJobMaterials(
  organizationId,
  jobId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    materialPath(organizationId, jobId, buildQuery(parameters)),
    { signal },
  );
}

export function createJobMaterial(organizationId, jobId, payload) {
  return apiRequest(materialPath(organizationId, jobId), {
    method: "POST",
    body: payload,
  });
}

export function updateJobMaterial(
  organizationId,
  jobId,
  requirementId,
  payload,
) {
  return apiRequest(
    materialPath(organizationId, jobId, `/${requirementId}`),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function removeJobMaterial(
  organizationId,
  jobId,
  requirementId,
) {
  return apiRequest(
    materialPath(organizationId, jobId, `/${requirementId}`),
    { method: "DELETE" },
  );
}

export function restoreJobMaterial(
  organizationId,
  jobId,
  requirementId,
) {
  return apiRequest(
    materialPath(
      organizationId,
      jobId,
      `/${requirementId}/reactivate`,
    ),
    { method: "PATCH" },
  );
}

export function requestMissingJobMaterials(
  organizationId,
  jobId,
  payload = {},
) {
  return apiRequest(
    materialPath(
      organizationId,
      jobId,
      "/request-missing",
    ),
    {
      method: "POST",
      body: payload,
    },
  );
}
