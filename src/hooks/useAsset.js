import { useCallback, useEffect, useState } from "react";

import { getAsset } from "../services/asset-service";

export default function useAsset({
  organizationId,
  assetId,
  includeInactive = true,
  enabled = true,
}) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId || !assetId) {
      setAsset(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getAsset(organizationId, assetId, {
      includeInactive,
      signal: controller.signal,
    })
      .then(setAsset)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [assetId, enabled, includeInactive, organizationId, version]);

  return { asset, setAsset, loading, error, reload };
}
