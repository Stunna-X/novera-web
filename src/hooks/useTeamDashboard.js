import { useCallback, useEffect, useState } from "react";

import { getTeamDashboard } from "../services/workforce-service";

export default function useTeamDashboard({
  organizationId,
  limit = 100,
  enabled = true,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId) {
      setDashboard(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getTeamDashboard(organizationId, { limit, signal: controller.signal })
      .then(setDashboard)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, limit, organizationId, version]);

  return { dashboard, loading, error, reload };
}
