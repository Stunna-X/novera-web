import { useCallback, useEffect, useState } from "react";

import { getWorkforceProfile } from "../services/workforce-service";

export default function useWorkforceProfile({
  organizationId,
  profileId,
  includeInactive = true,
  enabled = true,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId || !profileId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getWorkforceProfile(organizationId, profileId, {
      includeInactive,
      signal: controller.signal,
    })
      .then(setProfile)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, includeInactive, organizationId, profileId, version]);

  return { profile, loading, error, reload, setProfile };
}
