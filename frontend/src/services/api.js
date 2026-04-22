const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const TOKEN_KEY = "auth_token";

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  const token = options.token || getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
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
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
}

export async function postFormData(path, formData, token) {
  return request(path, {
    method: "POST",
    body: formData,
    token,
  });
}

export async function get(path, token) {
  return request(path, {
    method: "GET",
    token,
  });
}

export async function patch(path, body, token) {
  return request(path, {
    method: "PATCH",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    token,
  });
}

export async function put(path, body, token) {
  return request(path, {
    method: "PUT",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    token,
  });
}

export async function del(path, token) {
  return request(path, {
    method: "DELETE",
    token,
  });
}
