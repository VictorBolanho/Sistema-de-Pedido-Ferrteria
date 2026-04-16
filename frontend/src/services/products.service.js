import { get, patch, post } from "./api";

export async function getProducts(token) {
  const response = await get("/products", token);
  return response.products || [];
}

export async function createProduct(payload, token) {
  const response = await post("/products", payload, token);
  return response.product;
}

export async function updateProduct(productId, payload, token) {
  const response = await patch(`/products/${productId}`, payload, token);
  return response.product;
}

