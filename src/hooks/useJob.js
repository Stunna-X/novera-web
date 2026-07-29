import { useCallback, useEffect, useState } from "react";

import { getJob } from "../services/job-service";

export default function useJob({ organizationId, jobId, enabled = true }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!enabled || !organizationId || !jobId) {
      setJob(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getJob(organizationId, jobId, {
      includeInactive: true,
      signal: controller.signal,
    })
      .then(setJob)
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, jobId, organizationId, version]);

  return { job, loading, error, reload, setJob };
}
