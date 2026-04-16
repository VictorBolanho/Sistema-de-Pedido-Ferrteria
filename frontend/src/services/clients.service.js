import { get, patch, post, del } from "./api";

export async function getClients(token) {
  const response = await get("/clients", token);
  return response.clients || [];
}

export async function assignAdvisor(clientId, advisorId, token) {
  const response = await patch(
    `/clients/${clientId}/assign-advisor`,
    { advisorId },
    token
  );
  return response.client;
}

export async function createAdvisor(email, password, token) {
  const response = await post("/auth/advisor", { email, password }, token);
  return response.user;
}

export async function getAdvisors(token) {
  const response = await get("/auth/advisors", token);
  return response.advisors || [];
}

export async function deleteAdvisor(advisorId, token) {
  const response = await del(`/auth/advisor/${advisorId}`, token);
  return response.advisor;
}

