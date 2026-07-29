import { useCallback, useEffect, useState } from "react";

import { listCustomers } from "../services/customer-service";

export default function useCustomers({
  organizationId,
  skip = 0,
  limit = 20,
  search = "",
  includeInactive = false,
  enabled = true,
}) {
  const [data, setData] = useState({ items: [], total: 0, skip, limit });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId) {
      setData({ items: [], total: 0, skip, limit });
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    listCustomers(
      organizationId,
      {
        skip,
        limit,
        search: search.trim() || undefined,
        include_inactive: includeInactive,
      },
      { signal: controller.signal },
    )
      .then((payload) => {
        setData({
          items: Array.isArray(payload?.items) ? payload.items : [],
          total: payload?.total || 0,
          skip: payload?.skip ?? skip,
          limit: payload?.limit ?? limit,
        });
      })
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, includeInactive, limit, organizationId, search, skip, version]);

  return { ...data, loading, error, reload };
}
