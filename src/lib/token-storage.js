const ACCESS_TOKEN_KEY = "novera.access-token";
const REFRESH_TOKEN_KEY = "novera.refresh-token";
const USER_KEY = "novera.user";

function safeParse(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  return safeParse(localStorage.getItem(USER_KEY));
}

export function storeSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const sessionStorageKeys = Object.freeze({
  refreshToken: REFRESH_TOKEN_KEY,
  user: USER_KEY,
});
