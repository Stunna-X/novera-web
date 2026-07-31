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

function assetPath(organizationId, suffix = "") {
  return `/organizations/${organizationId}/assets${suffix}`;
}

export function listAssets(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(assetPath(organizationId, buildQuery(parameters)), {
    signal,
  });
}

export function createAsset(organizationId, payload) {
  return apiRequest(assetPath(organizationId), {
    method: "POST",
    body: payload,
  });
}

export function getAsset(
  organizationId,
  assetId,
  { includeInactive = true, signal } = {},
) {
  return apiRequest(
    assetPath(
      organizationId,
      `/${assetId}${buildQuery({ include_inactive: includeInactive })}`,
    ),
    { signal },
  );
}

export function updateAsset(organizationId, assetId, payload) {
  return apiRequest(assetPath(organizationId, `/${assetId}`), {
    method: "PATCH",
    body: payload,
  });
}

export function deactivateAsset(organizationId, assetId) {
  return apiRequest(assetPath(organizationId, `/${assetId}`), {
    method: "DELETE",
  });
}

export function reactivateAsset(organizationId, assetId) {
  return apiRequest(assetPath(organizationId, `/${assetId}/reactivate`), {
    method: "PATCH",
  });
}
