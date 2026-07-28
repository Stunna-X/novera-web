function normaliseBaseUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

function normalisePrefix(value) {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "";
}

export const env = Object.freeze({
  apiBaseUrl: normaliseBaseUrl(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  ),
  apiPrefix: normalisePrefix(import.meta.env.VITE_API_PREFIX || "/api/v1"),
});

export function buildApiUrl(path) {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${env.apiBaseUrl}${env.apiPrefix}${normalisedPath}`;
}
