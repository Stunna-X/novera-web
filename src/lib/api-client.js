import { buildApiUrl } from "../config/env";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  storeSession,
} from "./token-storage";

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise = null;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.detail === "string") return payload.detail;

  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ") || fallback;
  }

  return fallback;
}

function extractTokens(payload) {
  const source = payload?.tokens || payload?.token || payload?.data || payload || {};

  return {
    accessToken: source.access_token || source.accessToken || null,
    refreshToken: source.refresh_token || source.refreshToken || null,
  };
}

export function extractUser(payload) {
  return payload?.user || payload?.data?.user || null;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new ApiError("Your session has expired. Please sign in again.", {
      status: 401,
    });
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(buildApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const payload = await parseResponse(response);

      if (!response.ok) {
        clearSession();
        throw new ApiError(
          getErrorMessage(payload, "Your session has expired. Please sign in again."),
          {
            status: response.status,
            code: payload?.code || null,
            details: payload,
          },
        );
      }

      const tokens = extractTokens(payload);

      if (!tokens.accessToken) {
        clearSession();
        throw new ApiError("The server returned an invalid session response.", {
          status: 500,
          details: payload,
        });
      }

      storeSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || refreshToken,
        user: extractUser(payload) || getStoredUser(),
      });

      return payload;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function renewSession() {
  return refreshAccessToken();
}

export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    headers = {},
    auth = true,
    retryOnUnauthorized = true,
    signal,
  } = {},
) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  const isFormData = body instanceof FormData;
  let requestBody = body;

  if (body !== undefined && body !== null && !isFormData) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    credentials: "include",
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  if (response.status === 401 && auth && retryOnUnauthorized && getRefreshToken()) {
    await refreshAccessToken();
    return apiRequest(path, {
      method,
      body,
      headers,
      auth,
      retryOnUnauthorized: false,
      signal,
    });
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Request failed with status ${response.status}.`),
      {
        status: response.status,
        code: payload?.code || null,
        details: payload,
      },
    );
  }

  return payload;
}
