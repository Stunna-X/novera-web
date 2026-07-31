import { useEffect, useMemo, useState } from "react";

import { listOrganizationRoles } from "../services/workforce-service";

export default function useOrganizationRoles({
  organizationId,
  initialRoles = [],
  enabled = true,
}) {
  const normalizedInitial = useMemo(
    () => (Array.isArray(initialRoles) ? initialRoles : []),
    [initialRoles],
  );
  const initialRoleKey = normalizedInitial
    .map((role) => `${role?.id || ""}:${role?.name || ""}`)
    .join("|");
  const [roles, setRoles] = useState(normalizedInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (normalizedInitial.length > 0) {
      setRoles(normalizedInitial);
      setError(null);
      return undefined;
    }

    if (!enabled || !organizationId) {
      setRoles([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    listOrganizationRoles(organizationId, { signal: controller.signal })
      .then((payload) => setRoles(Array.isArray(payload) ? payload : []))
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, initialRoleKey, normalizedInitial, organizationId]);

  return { roles, loading, error };
}
