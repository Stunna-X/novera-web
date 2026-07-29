import { apiRequest } from "../lib/api-client";

export function getWorkOrderDashboard(organizationId, { limit = 6, signal } = {}) {
  const query = new URLSearchParams({ limit: String(limit) });
  return apiRequest(
    `/organizations/${organizationId}/dashboard/work-orders?${query.toString()}`,
    { signal },
  );
}
