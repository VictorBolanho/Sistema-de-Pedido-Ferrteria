import { get, patch } from "./api";

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

