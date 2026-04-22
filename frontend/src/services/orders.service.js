import { get, patch, post } from "./api";

export async function createOrder(payload, token) {
  return post("/orders", payload, token);
}

export async function getOrders(token) {
  const response = await get("/orders", token);
  return response.orders || [];
}

export async function getOrderById(orderId, token) {
  const response = await get(`/orders/${orderId}`, token);
  return response.order;
}

export async function updateOrderStatus(orderId, status, token) {
  const response = await patch(`/orders/${orderId}/status`, { status }, token);
  return response.order;
}
