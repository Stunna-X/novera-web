import { useCallback, useEffect, useState } from "react";

import {
  getDashboardOverview,
  getFinanceDashboard,
  getTeamDashboard,
  getWorkOrderDashboard,
} from "../services/dashboard-service";

const EMPTY_DASHBOARD = Object.freeze({
  overview: null,
  workOrders: null,
  finance: null,
  team: null,
});

const REQUESTS = [
  ["overview", getDashboardOverview],
  ["workOrders", getWorkOrderDashboard],
  ["finance", getFinanceDashboard],
  ["team", getTeamDashboard],
];

export default function useDashboardAnalytics(
  organizationId,
  { enabled = true } = {},
) {
  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !organizationId) {
      setData(EMPTY_DASHBOARD);
      setErrors([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setErrors([]);

    Promise.allSettled(
      REQUESTS.map(([, request]) =>
        request(organizationId, { signal: controller.signal }),
      ),
    )
      .then((results) => {
        if (controller.signal.aborted) return;

        const nextData = { ...EMPTY_DASHBOARD };
        const nextErrors = [];

        results.forEach((result, index) => {
          const [key] = REQUESTS[index];

          if (result.status === "fulfilled") {
            nextData[key] = result.value;
            return;
          }

          if (result.reason?.name !== "AbortError") {
            nextErrors.push({ key, error: result.reason });
          }
        });

        setData(nextData);
        setErrors(nextErrors);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, organizationId, version]);

  return { data, errors, loading, refresh };
}
