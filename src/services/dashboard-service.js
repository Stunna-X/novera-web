import { apiRequest } from "../lib/api-client";

export function getDashboardOverview(organizationId, { signal } = {}) {
  return apiRequest(
    `/organizations/${organizationId}/dashboard/overview`,
    { signal },
  );
}

export function getWorkOrderDashboard(
  organizationId,
  { start, end, limit = 8, signal } = {},
) {
  const query = new URLSearchParams({ limit: String(limit) });

  if (start) query.set("start", start);
  if (end) query.set("end", end);

  return apiRequest(
    `/organizations/${organizationId}/dashboard/work-orders?${query.toString()}`,
    { signal },
  );
}

export function getFinanceDashboard(organizationId, { signal } = {}) {
  return apiRequest(
    `/organizations/${organizationId}/dashboard/finance`,
    { signal },
  );
}

export function getTeamDashboard(
  organizationId,
  { limit = 25, signal } = {},
) {
  const query = new URLSearchParams({ limit: String(limit) });

  return apiRequest(
    `/organizations/${organizationId}/dashboard/team?${query.toString()}`,
    { signal },
  );
}
