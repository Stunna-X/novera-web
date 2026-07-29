import { useCallback, useEffect, useState } from "react";

import { getCustomerSite } from "../services/customer-service";

export default function useCustomerSite({
  organizationId,
  customerId,
  siteId,
  includeInactive = true,
  enabled = true,
}) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId || !customerId || !siteId) {
      setSite(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getCustomerSite(organizationId, customerId, siteId, {
      includeInactive,
      signal: controller.signal,
    })
      .then(setSite)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [customerId, enabled, includeInactive, organizationId, siteId, version]);

  return { site, loading, error, reload, setSite };
}
