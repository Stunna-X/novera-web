import { useCallback, useEffect, useState } from "react";

import { listOrganizationMembers } from "../services/workforce-service";

export default function useOrganizationMembers({
  organizationId,
  enabled = true,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId) {
      setMembers([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    listOrganizationMembers(organizationId, { signal: controller.signal })
      .then((payload) => setMembers(Array.isArray(payload) ? payload : []))
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, organizationId, version]);

  return { members, loading, error, reload };
}
