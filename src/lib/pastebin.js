const DEFAULT_API_BASE_URL = "http://localhost:3001";

function getApiBaseUrl() {
  return process.env.PASTEBIN_API_BASE_URL || DEFAULT_API_BASE_URL;
}

function apiUrl(pathname) {
  return new URL(pathname, getApiBaseUrl());
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function createPaste({ content, ttl_seconds, max_views }) {
  const response = await fetch(apiUrl("/api/pastes"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content, ttl_seconds, max_views }),
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const message = payload?.error?.message || "Failed to create paste";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export async function getPaste(id) {
  const response = await fetch(apiUrl(`/api/pastes/${encodeURIComponent(id)}`), {
    method: "GET",
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const message = payload?.error?.message || "Failed to fetch paste";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}
