const productsModel = require("./products.model");
const HttpError = require("../../utils/http-error");

function mapProduct(product) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    stock: product.stock,
    category: product.category,
    active: product.active,
    imageUrl: product.image_url,
    updatedAt: product.updated_at,
    createdAt: product.created_at,
  };
}

function ensureAdmin(user) {
  if (!user || user.role !== "admin") {
    throw new HttpError(403, "Only admins can manage products");
  }
}

function validatePrice(price) {
  const value = Number(price);
  if (Number.isNaN(value) || value < 0) {
    throw new HttpError(400, "price must be a non-negative number");
  }
  return value;
}

function validateStock(stock) {
  const value = Number(stock);
  if (!Number.isInteger(value) || value < 0) {
    throw new HttpError(400, "stock must be a non-negative integer");
  }
  return value;
}

function normalizeCreatePayload(payload) {
  if (!payload.name || !payload.sku || payload.price === undefined || payload.stock === undefined || !payload.category) {
    throw new HttpError(400, "name, sku, price, stock and category are required");
  }

  return {
    name: payload.name.trim(),
    sku: payload.sku.trim(),
    price: validatePrice(payload.price),
    stock: validateStock(payload.stock),
    category: payload.category.trim(),
    active: payload.active === undefined ? true : Boolean(payload.active),
    image_url: payload.image_url ? String(payload.image_url).trim() : null,
  };
}

function normalizeUpdatePayload(payload) {
  const output = {};

  if (payload.name !== undefined) {
    output.name = String(payload.name).trim();
  }
  if (payload.sku !== undefined) {
    output.sku = String(payload.sku).trim();
  }
  if (payload.price !== undefined) {
    output.price = validatePrice(payload.price);
  }
  if (payload.stock !== undefined) {
    output.stock = validateStock(payload.stock);
  }
  if (payload.category !== undefined) {
    output.category = String(payload.category).trim();
  }
  if (payload.active !== undefined) {
    output.active = Boolean(payload.active);
  }
  if (payload.image_url !== undefined) {
    output.image_url = payload.image_url ? String(payload.image_url).trim() : null;
  }

  if (Object.keys(output).length === 0) {
    throw new HttpError(400, "No valid fields provided for update");
  }

  return output;
}

async function createProduct(payload, requester) {
  ensureAdmin(requester);
  const normalized = normalizeCreatePayload(payload);

  try {
    const created = await productsModel.createProduct(normalized);
    return mapProduct(created);
  } catch (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "SKU already exists");
    }
    throw error;
  }
}

async function getProducts(user) {
  if (!user) {
    const rows = await productsModel.listActiveProducts();
    return rows.map(mapProduct);
  }

  if (user.role === "admin") {
    const rows = await productsModel.getAllProducts();
    return rows.map(mapProduct);
  }

  const rows = await productsModel.listActiveProducts();
  return rows.map(mapProduct);
}

async function getProductById(productId) {
  const row = await productsModel.findProductById(productId);
  if (!row) {
    throw new HttpError(404, "Product not found");
  }
  return mapProduct(row);
}

async function updateProduct(productId, payload, requester) {
  ensureAdmin(requester);
  const existing = await productsModel.findProductById(productId);
  if (!existing) {
    throw new HttpError(404, "Product not found");
  }

  const normalized = normalizeUpdatePayload(payload);

  try {
    const updated = await productsModel.updateProduct(productId, normalized);
    return mapProduct(updated);
  } catch (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "SKU already exists");
    }
    throw error;
  }
}

async function bulkCreateProducts(products, requester) {
  ensureAdmin(requester);
  
  if (!Array.isArray(products) || products.length === 0) {
    throw new HttpError(400, "products must be a non-empty array");
  }

  const normalized = products.map(normalizeCreatePayload);
  const created = [];

  for (const product of normalized) {
    try {
      const result = await productsModel.createProduct(product);
      created.push(mapProduct(result));
    } catch (error) {
      if (error.code === "23505") {
        // SKU already exists, skip and continue
        continue;
      }
      throw error;
    }
  }

  return created;
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  bulkCreateProducts,
};

