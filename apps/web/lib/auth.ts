export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
};

const TOKEN_KEY = "andre-burger-admin-token";
const USER_KEY = "andre-burger-admin-user";

export function saveAdminSession(accessToken: string, user: AdminUser) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;

  const storedUser = window.localStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem("andre-burger-admin-session");
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}
