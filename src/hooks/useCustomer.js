import { useCallback, useEffect, useState } from "react";

import { getCustomer } from "../services/customer-service";

export default function useCustomer({
  organizationId,
  customerId,
  includeInactive = true,
  enabled = true,
}) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId || !customerId) {
      setCustomer(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getCustomer(organizationId, customerId, {
      includeInactive,
      signal: controller.signal,
    })
      .then(setCustomer)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [customerId, enabled, includeInactive, organizationId, version]);

  return { customer, loading, error, reload, setCustomer };
}
