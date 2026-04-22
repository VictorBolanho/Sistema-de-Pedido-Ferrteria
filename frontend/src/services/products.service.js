import { get, patch, post, put, postFormData, del } from "./api";

export async function getProducts(token) {
  const response = await get("/products", token);
  return response.products || [];
}

export async function getProductById(productId, token) {
  const response = await get(`/products/${productId}`, token);
  return response.product;
}

export async function createProduct(payload, token) {
  const response = await post("/products", payload, token);
  return response.product;
}

export async function updateProduct(productId, payload, token) {
  const response = await patch(`/products/${productId}`, payload, token);
  return response.product;
}

export async function updateProductFull(productId, payload, token) {
  const response = await put(`/products/${productId}`, payload, token);
  return response.product;
}

export async function deleteProduct(productId, token) {
  const response = await del(`/products/${productId}`, token);
  return response.product;
}

export async function uploadProductImage(formData, token) {
  const response = await postFormData("/upload", formData, token);
  return response.url;
}

export async function updateProductStock(productId, stock, token) {
  const response = await patch(`/products/${productId}/stock`, { stock }, token);
  return response.product;
}

export async function updateProductStatus(productId, active, token) {
  const response = await patch(`/products/${productId}/status`, { active }, token);
  return response.product;
}

