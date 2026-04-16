const db = require("../../config/database");

async function findProductById(productId) {
  const result = await db.query(
    `
      SELECT id, name, sku, price, stock, category, active, image_url, updated_at, created_at
      FROM products
      WHERE id = $1
      LIMIT 1
    `,
    [productId]
  );
  return result.rows[0] || null;
}

async function findProductBySku(sku) {
  const result = await db.query(
    `
      SELECT id, name, sku, price, stock, category, active, image_url, updated_at, created_at
      FROM products
      WHERE sku = $1
      LIMIT 1
    `,
    [sku]
  );
  return result.rows[0] || null;
}

async function createProduct(product) {
  const result = await db.query(
    `
      INSERT INTO products (name, sku, price, stock, category, active, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, sku, price, stock, category, active, image_url, updated_at, created_at
    `,
    [
      product.name,
      product.sku,
      product.price,
      product.stock,
      product.category,
      product.active,
      product.image_url || null,
    ]
  );
  return result.rows[0];
}

async function listProducts() {
  const result = await db.query(`
    SELECT id, name, sku, price, stock, category, active, image_url, updated_at, created_at
    FROM products
    ORDER BY created_at DESC
  `);
  return result.rows;
}

async function updateProduct(productId, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findProductById(productId);
  }

  const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
  const values = keys.map((key) => fields[key]);

  const result = await db.query(
    `
      UPDATE products
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING id, name, sku, price, stock, category, active, image_url, updated_at, created_at
    `,
    [...values, productId]
  );

  return result.rows[0] || null;
}

module.exports = {
  findProductById,
  findProductBySku,
  createProduct,
  listProducts,
  updateProduct,
};

