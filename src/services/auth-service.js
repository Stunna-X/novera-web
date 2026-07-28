import {
  apiRequest,
  extractUser,
  renewSession,
} from "../lib/api-client";
import {
  clearSession,
  getRefreshToken,
  getStoredUser,
  storeSession,
} from "../lib/token-storage";

function extractTokens(payload) {
  const source = payload?.tokens || payload?.token || payload?.data || payload || {};

  return {
    accessToken: source.access_token || source.accessToken || null,
    refreshToken: source.refresh_token || source.refreshToken || null,
  };
}

function persistAuthResponse(payload) {
  const tokens = extractTokens(payload);
  const user = extractUser(payload) || getStoredUser();

  storeSession({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user,
  });

  return { user, ...tokens };
}

export async function loginUser({ email, password }) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: {
      email: email.trim().toLowerCase(),
      password,
    },
  });

  return persistAuthResponse(payload);
}

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
  phone,
}) {
  const payload = await apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      ...(phone?.trim() ? { phone: phone.trim() } : {}),
    },
  });

  return persistAuthResponse(payload);
}

export async function refreshUserSession() {
  const payload = await renewSession();
  return persistAuthResponse(payload);
}

export async function logoutUser() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await apiRequest("/auth/logout", {
        method: "POST",
        retryOnUnauthorized: false,
        body: { refresh_token: refreshToken },
      });
    }
  } finally {
    clearSession();
  }
}

export function getCurrentSession() {
  return {
    refreshToken: getRefreshToken(),
    user: getStoredUser(),
  };
}
