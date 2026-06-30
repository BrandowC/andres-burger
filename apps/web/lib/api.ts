import { clearAdminSession, getAdminToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

function handleUnauthorized() {
  if (typeof window === "undefined") return;

  clearAdminSession();
  window.location.href = "/admin/login";
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error consultando ${path}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function apiPost<TResponse = unknown, TBody = unknown>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error enviando ${path}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function apiPatch<TResponse = unknown, TBody = unknown>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error actualizando ${path}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function apiDelete<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error eliminando ${path}`);
  }

  return response.json();
}

export async function apiUploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/uploads/products`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error subiendo imagen.");
  }

  return response.json() as Promise<{ url: string }>;
}
