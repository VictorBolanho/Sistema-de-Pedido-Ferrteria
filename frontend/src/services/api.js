const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(error.message || "Network request failed");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Unexpected API error");
  }

  return data;
}

export async function post(path, body, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

export async function get(path, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request(path, {
    method: "GET",
    headers,
  });
}

export async function patch(path, body, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers,
  });
}
