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

function customersPath(organizationId, suffix = "") {
  return `/organizations/${organizationId}/customers${suffix}`;
}

export function listCustomers(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(
    customersPath(organizationId, buildQuery(parameters)),
    { signal },
  );
}

export function createCustomer(organizationId, payload) {
  return apiRequest(customersPath(organizationId), {
    method: "POST",
    body: payload,
  });
}

export function getCustomer(
  organizationId,
  customerId,
  { includeInactive = true, signal } = {},
) {
  return apiRequest(
    customersPath(
      organizationId,
      `/${customerId}${buildQuery({ include_inactive: includeInactive })}`,
    ),
    { signal },
  );
}

export function updateCustomer(organizationId, customerId, payload) {
  return apiRequest(customersPath(organizationId, `/${customerId}`), {
    method: "PATCH",
    body: payload,
  });
}

export function deactivateCustomer(organizationId, customerId) {
  return apiRequest(customersPath(organizationId, `/${customerId}`), {
    method: "DELETE",
  });
}

export function reactivateCustomer(organizationId, customerId) {
  return apiRequest(
    customersPath(organizationId, `/${customerId}/reactivate`),
    { method: "PATCH" },
  );
}

export function listCustomerSites(
  organizationId,
  customerId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    customersPath(
      organizationId,
      `/${customerId}/sites${buildQuery(parameters)}`,
    ),
    { signal },
  );
}

export function createCustomerSite(organizationId, customerId, payload) {
  return apiRequest(customersPath(organizationId, `/${customerId}/sites`), {
    method: "POST",
    body: payload,
  });
}

export function getCustomerSite(
  organizationId,
  customerId,
  siteId,
  { includeInactive = true, signal } = {},
) {
  return apiRequest(
    customersPath(
      organizationId,
      `/${customerId}/sites/${siteId}${buildQuery({ include_inactive: includeInactive })}`,
    ),
    { signal },
  );
}

export function updateCustomerSite(
  organizationId,
  customerId,
  siteId,
  payload,
) {
  return apiRequest(
    customersPath(organizationId, `/${customerId}/sites/${siteId}`),
    { method: "PATCH", body: payload },
  );
}

export function deactivateCustomerSite(organizationId, customerId, siteId) {
  return apiRequest(
    customersPath(organizationId, `/${customerId}/sites/${siteId}`),
    { method: "DELETE" },
  );
}

export function reactivateCustomerSite(organizationId, customerId, siteId) {
  return apiRequest(
    customersPath(
      organizationId,
      `/${customerId}/sites/${siteId}/reactivate`,
    ),
    { method: "PATCH" },
  );
}
