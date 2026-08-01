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

function inventoryPath(organizationId, suffix = "") {
  return `/organizations/${organizationId}/inventory${suffix}`;
}

export function listInventoryItems(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(
    inventoryPath(organizationId, `/items${buildQuery(parameters)}`),
    { signal },
  );
}

export function createInventoryItem(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/items"), {
    method: "POST",
    body: payload,
  });
}

export function updateInventoryItem(organizationId, itemId, payload) {
  return apiRequest(inventoryPath(organizationId, `/items/${itemId}`), {
    method: "PATCH",
    body: payload,
  });
}

export function deactivateInventoryItem(organizationId, itemId) {
  return apiRequest(inventoryPath(organizationId, `/items/${itemId}`), {
    method: "DELETE",
  });
}

export function reactivateInventoryItem(organizationId, itemId) {
  return apiRequest(inventoryPath(organizationId, `/items/${itemId}/reactivate`), {
    method: "PATCH",
  });
}

export function listInventoryLocations(
  organizationId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    inventoryPath(organizationId, `/locations${buildQuery(parameters)}`),
    { signal },
  );
}

export function createInventoryLocation(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/locations"), {
    method: "POST",
    body: payload,
  });
}

export function updateInventoryLocation(organizationId, locationId, payload) {
  return apiRequest(inventoryPath(organizationId, `/locations/${locationId}`), {
    method: "PATCH",
    body: payload,
  });
}

export function deactivateInventoryLocation(organizationId, locationId) {
  return apiRequest(inventoryPath(organizationId, `/locations/${locationId}`), {
    method: "DELETE",
  });
}

export function reactivateInventoryLocation(organizationId, locationId) {
  return apiRequest(
    inventoryPath(organizationId, `/locations/${locationId}/reactivate`),
    { method: "PATCH" },
  );
}

export function listInventoryBalances(
  organizationId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    inventoryPath(organizationId, `/balances${buildQuery(parameters)}`),
    { signal },
  );
}

export function listLowStock(organizationId, parameters = {}, { signal } = {}) {
  return apiRequest(
    inventoryPath(organizationId, `/low-stock${buildQuery(parameters)}`),
    { signal },
  );
}

export function listInventoryMovements(
  organizationId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    inventoryPath(organizationId, `/movements${buildQuery(parameters)}`),
    { signal },
  );
}

export function receiveInventoryStock(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/movements/receipts"), {
    method: "POST",
    body: payload,
  });
}

export function issueInventoryStock(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/movements/issues"), {
    method: "POST",
    body: payload,
  });
}

export function returnInventoryStock(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/movements/returns"), {
    method: "POST",
    body: payload,
  });
}

export function adjustInventoryStock(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/movements/adjustments"), {
    method: "POST",
    body: payload,
  });
}

export function transferInventoryStock(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/movements/transfers"), {
    method: "POST",
    body: payload,
  });
}

export function listInventoryReservations(
  organizationId,
  parameters = {},
  { signal } = {},
) {
  return apiRequest(
    inventoryPath(organizationId, `/reservations${buildQuery(parameters)}`),
    { signal },
  );
}

export function createInventoryReservation(organizationId, payload) {
  return apiRequest(inventoryPath(organizationId, "/reservations"), {
    method: "POST",
    body: payload,
  });
}

export function consumeInventoryReservation(organizationId, reservationId, payload) {
  return apiRequest(
    inventoryPath(organizationId, `/reservations/${reservationId}/consume`),
    { method: "POST", body: payload },
  );
}

export function releaseInventoryReservation(organizationId, reservationId, payload) {
  return apiRequest(
    inventoryPath(organizationId, `/reservations/${reservationId}/release`),
    { method: "POST", body: payload },
  );
}
