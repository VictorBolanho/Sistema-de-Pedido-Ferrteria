import { get } from "./api";

export async function getCommissions(token) {
  const response = await get("/commissions", token);
  return response.commissions || [];
}

