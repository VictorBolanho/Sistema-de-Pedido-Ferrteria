import { get, post } from "./api";

export async function login(email, password) {
  return post("/auth/login", { email, password });
}

export async function requestPasswordReset(email) {
  return post("/auth/forgot-password", { email });
}

export async function resetPassword(email, resetCode, newPassword) {
  return post("/auth/reset-password", { email, resetCode, newPassword });
}

export async function getMe(token) {
  const response = await get("/auth/me", token);
  return response.user;
}
