import { useEffect, useState } from "react";

import { getWorkOrderDashboard } from "../services/dashboard-service";

export default function useWorkOrderDashboard(organizationId, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !organizationId) {
      setData(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getWorkOrderDashboard(organizationId, {
      limit: 6,
      signal: controller.signal,
    })
      .then(setData)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, organizationId]);

  return { data, loading, error };
}
