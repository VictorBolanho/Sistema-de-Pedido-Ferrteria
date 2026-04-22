const db = require("../../config/database");

async function findProductById(productId) {
  const result = await db.query(
    `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.price,
        p.stock,
        p.category,
        p.active,
        p.image_url,
        p.updated_at,
        p.created_at,
        COALESCE(SUM(CASE WHEN o.status <> 'denegado' THEN oi.quantity ELSE 0 END), 0)::int AS units_sold,
        COUNT(DISTINCT CASE WHEN o.status <> 'denegado' THEN oi.order_id ELSE NULL END)::int AS orders_count
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE p.id = $1
      GROUP BY p.id
      LIMIT 1
    `,
    [productId]
  );
  return result.rows[0] || null;
}

async function findProductBySku(sku) {
  const result = await db.query(
    `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.price,
        p.stock,
        p.category,
        p.active,
        p.image_url,
        p.updated_at,
        p.created_at,
        COALESCE(SUM(CASE WHEN o.status <> 'denegado' THEN oi.quantity ELSE 0 END), 0)::int AS units_sold,
        COUNT(DISTINCT CASE WHEN o.status <> 'denegado' THEN oi.order_id ELSE NULL END)::int AS orders_count
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE p.sku = $1
      GROUP BY p.id
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
    SELECT
      p.id,
      p.name,
      p.sku,
      p.price,
      p.stock,
      p.category,
      p.active,
      p.image_url,
      p.updated_at,
      p.created_at,
      COALESCE(SUM(CASE WHEN o.status <> 'denegado' THEN oi.quantity ELSE 0 END), 0)::int AS units_sold,
      COUNT(DISTINCT CASE WHEN o.status <> 'denegado' THEN oi.order_id ELSE NULL END)::int AS orders_count
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id
    GROUP BY p.id
    ORDER BY units_sold DESC, p.created_at DESC
  `);
  return result.rows;
}

async function listActiveProducts() {
  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      p.sku,
      p.price,
      p.stock,
      p.category,
      p.active,
      p.image_url,
      p.updated_at,
      p.created_at,
      COALESCE(SUM(CASE WHEN o.status <> 'denegado' THEN oi.quantity ELSE 0 END), 0)::int AS units_sold,
      COUNT(DISTINCT CASE WHEN o.status <> 'denegado' THEN oi.order_id ELSE NULL END)::int AS orders_count
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id
    WHERE p.active = TRUE
    GROUP BY p.id
    ORDER BY units_sold DESC, p.created_at DESC
  `);
  return result.rows;
}

async function getAllProducts() {
  return await listProducts();
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

async function deleteProduct(productId) {
  await db.query(
    `
      DELETE FROM products
      WHERE id = $1
    `,
    [productId]
  );
}

module.exports = {
  findProductById,
  findProductBySku,
  createProduct,
  listProducts,
  listActiveProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
