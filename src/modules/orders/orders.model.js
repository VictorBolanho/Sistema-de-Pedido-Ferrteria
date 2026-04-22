const db = require("../../config/database");

async function findClientByUserId(userId) {
  const result = await db.query(
    `
      SELECT id, user_id, advisor_id, status
      FROM clients
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function findClientById(clientId) {
  const result = await db.query(
    `
      SELECT id, user_id, advisor_id, status
      FROM clients
      WHERE id = $1
      LIMIT 1
    `,
    [clientId]
  );
  return result.rows[0] || null;
}

async function findAdvisorByUserId(userId) {
  const result = await db.query(
    `
      SELECT id, user_id
      FROM advisors
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function getActiveProductsByIds(productIds) {
  if (productIds.length === 0) {
    return [];
  }

  const result = await db.query(
    `
      SELECT id, name, sku, price, stock, category, active
      FROM products
      WHERE id = ANY($1::uuid[]) AND active = TRUE
    `,
    [productIds]
  );
  return result.rows;
}

async function decrementProductStock(productId, quantity, transactionalClient) {
  const result = await transactionalClient.query(
    `
      UPDATE products
      SET stock = stock - $2
      WHERE id = $1 AND stock >= $2
      RETURNING id, stock
    `,
    [productId, quantity]
  );
  return result.rows[0] || null;
}

async function createOrder(orderData, transactionalClient) {
  const result = await transactionalClient.query(
    `
      INSERT INTO orders (client_id, advisor_id, status, subtotal, total, observations)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, client_id, advisor_id, status, subtotal, total, observations, created_at, updated_at
    `,
    [
      orderData.clientId,
      orderData.advisorId,
      orderData.status,
      orderData.subtotal,
      orderData.total,
      orderData.observations || null,
    ]
  );
  return result.rows[0];
}

async function createOrderItem(item, transactionalClient) {
  const result = await transactionalClient.query(
    `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, order_id, product_id, quantity, unit_price, subtotal, created_at, updated_at
    `,
    [item.orderId, item.productId, item.quantity, item.unitPrice, item.subtotal]
  );
  return result.rows[0];
}

async function listOrders() {
  const result = await db.query(`
    SELECT id, client_id, advisor_id, total, status, observations, created_at, updated_at
    FROM orders
    ORDER BY created_at DESC
  `);
  return result.rows;
}

async function listOrdersByAdvisorId(advisorId) {
  const result = await db.query(
    `
      SELECT id, client_id, advisor_id, total, status, observations, created_at, updated_at
      FROM orders
      WHERE advisor_id = $1
      ORDER BY created_at DESC
    `,
    [advisorId]
  );
  return result.rows;
}

async function listOrdersByClientId(clientId) {
  const result = await db.query(
    `
      SELECT id, client_id, advisor_id, total, status, observations, created_at, updated_at
      FROM orders
      WHERE client_id = $1
      ORDER BY created_at DESC
    `,
    [clientId]
  );
  return result.rows;
}

async function findOrderById(orderId) {
  const result = await db.query(
    `
      SELECT id, client_id, advisor_id, total, status, observations, created_at, updated_at
      FROM orders
      WHERE id = $1
      LIMIT 1
    `,
    [orderId]
  );
  return result.rows[0] || null;
}

async function listOrderItems(orderId) {
  return listOrderItemsWithClient(orderId, db);
}

async function listOrderItemsWithClient(orderId, dbClient = db) {
  const result = await dbClient.query(
    `
      SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        oi.created_at,
        oi.updated_at,
        p.name AS product_name,
        p.sku AS product_sku
      FROM order_items oi
      INNER JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
    `,
    [orderId]
  );
  return result.rows;
}

async function updateOrderStatus(orderId, status, transactionalClient = db) {
  const result = await transactionalClient.query(
    `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, client_id, advisor_id, total, status, observations, created_at, updated_at
    `,
    [status, orderId]
  );
  return result.rows[0] || null;
}

async function incrementProductStock(productId, quantity, transactionalClient) {
  const result = await transactionalClient.query(
    `
      UPDATE products
      SET stock = stock + $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, stock
    `,
    [productId, quantity]
  );
  return result.rows[0] || null;
}

module.exports = {
  findClientByUserId,
  findClientById,
  findAdvisorByUserId,
  getActiveProductsByIds,
  decrementProductStock,
  createOrder,
  createOrderItem,
  listOrders,
  listOrdersByAdvisorId,
  listOrdersByClientId,
  findOrderById,
  listOrderItems,
  listOrderItemsWithClient,
  updateOrderStatus,
  incrementProductStock,
};
