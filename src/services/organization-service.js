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

export function listOrganizations({ signal } = {}) {
  return apiRequest("/organizations", { signal });
}

export function createOrganization(payload) {
  return apiRequest("/organizations", {
    method: "POST",
    body: payload,
  });
}

export function updateOrganization(organizationId, payload) {
  return apiRequest(organizationPath(organizationId), {
    method: "PATCH",
    body: payload,
  });
}

export function getOrganizationAccess(organizationId, { signal } = {}) {
  return apiRequest(organizationPath(organizationId, "/access"), { signal });
}

export function createCustomer(organizationId, payload) {
  return apiRequest(organizationPath(organizationId, "/customers"), {
    method: "POST",
    body: payload,
  });
}

export function listCustomers(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(
    organizationPath(organizationId, `/customers${buildQuery(parameters)}`),
    { signal },
  );
}

export function getCustomer(organizationId, customerId, { signal } = {}) {
  return apiRequest(
    organizationPath(organizationId, `/customers/${customerId}`),
    { signal },
  );
}

export function createCustomerSite(organizationId, customerId, payload) {
  return apiRequest(
    organizationPath(organizationId, `/customers/${customerId}/sites`),
    { method: "POST", body: payload },
  );
}

export function listCustomerSites(
  organizationId,
  customerId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    organizationPath(
      organizationId,
      `/customers/${customerId}/sites${buildQuery(parameters)}`,
    ),
    { signal },
  );
}

export function getCustomerSite(
  organizationId,
  customerId,
  siteId,
  { signal } = {},
) {
  return apiRequest(
    organizationPath(organizationId, `/customers/${customerId}/sites/${siteId}`),
    { signal },
  );
}

export function listWorkforce(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(
    organizationPath(organizationId, `/workforce${buildQuery(parameters)}`),
    { signal },
  );
}

export function listAssets(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(
    organizationPath(organizationId, `/assets${buildQuery(parameters)}`),
    { signal },
  );
}
