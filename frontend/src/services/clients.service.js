import { del, get, patch, post } from "./api";

export async function getClients(token) {
  const response = await get("/clients", token);
  return response.clients || [];
}

export async function createClient(payload, token) {
  return post("/clients", payload, token);
}

export async function assignAdvisor(clientId, advisorId, token) {
  const response = await patch(
    `/clients/${clientId}/assign-advisor`,
    { advisorId },
    token
  );
  return response.client;
}

export async function updateClientStatus(clientId, status, token) {
  const response = await patch(`/clients/${clientId}/status`, { status }, token);
  return response.client;
}

export async function createAdvisor(payload, token) {
  const response = await post("/auth/advisor", payload, token);
  return response.user;
}

export async function getAdvisors(token) {
  const response = await get("/auth/advisors", token);
  return response.advisors || [];
}

export async function updateAdvisorStatus(advisorId, isActive, token) {
  const response = await patch(`/auth/advisor/${advisorId}/status`, { isActive }, token);
  return response.advisor;
}

export async function deleteAdvisor(advisorId, token) {
  const response = await del(`/auth/advisor/${advisorId}`, token);
  return response.advisor;
}
