import { get, post } from "./api";

export async function login(email, password) {
  return post("/auth/login", { email, password });
}

export async function getMe(token) {
  const response = await get("/auth/me", token);
  return response.user;
}

