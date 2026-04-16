const db = require("../../config/database");
const ordersModel = require("./orders.model");
const commissionsService = require("../commissions/commissions.service");
const HttpError = require("../../utils/http-error");

const ORDER_STATUSES = new Set([
  "pendiente",
  "en_proceso",
  "aprobado",
  "denegado",
  "reconsideracion",
]);

function mapOrder(order) {
  return {
    id: order.id,
    clientId: order.client_id,
    advisorId: order.advisor_id,
    total: Number(order.total),
    status: order.status,
    observations: order.observations,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

function mapOrderItem(item) {
  return {
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    productName: item.product_name || null,
    productSku: item.product_sku || null,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    subtotal: Number(item.subtotal),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Order must have at least 1 item");
  }

  for (const item of items) {
    if (!item.productId || item.quantity === undefined) {
      throw new HttpError(400, "Each item requires productId and quantity");
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new HttpError(400, "quantity must be a positive integer");
    }
  }
}

async function resolveRequesterScope(user) {
  if (user.role === "admin") {
    return { scope: "admin" };
  }

  if (user.role === "advisor") {
    const advisor = await ordersModel.findAdvisorByUserId(user.sub);
    if (!advisor) {
      throw new HttpError(403, "Advisor profile not found for current user");
    }
    return { scope: "advisor", advisorId: advisor.id };
  }

  if (user.role === "client") {
    const client = await ordersModel.findClientByUserId(user.sub);
    if (!client) {
      throw new HttpError(403, "Client profile not found for current user");
    }
    return { scope: "client", clientId: client.id };
  }

  throw new HttpError(403, "Forbidden");
}

async function createOrder(payload, requester) {
  if (requester.role !== "client") {
    throw new HttpError(403, "Only clients can create orders");
  }

  validateItems(payload.items);

  const client = await ordersModel.findClientByUserId(requester.sub);
  if (!client) {
    throw new HttpError(403, "Client profile not found for current user");
  }

  if (client.status !== "activo") {
    throw new HttpError(403, "Only active clients can create orders");
  }

  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  const products = await ordersModel.getActiveProductsByIds(productIds);
  if (products.length !== productIds.length) {
    throw new HttpError(400, "Some products do not exist or are inactive");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  let total = 0;
  const calculatedItems = payload.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new HttpError(400, "Invalid product in order items");
    }

    const quantity = Number(item.quantity);
    const unitPrice = Number(product.price);
    const subtotal = Number((unitPrice * quantity).toFixed(2));
    total += subtotal;

    return {
      productId: item.productId,
      quantity,
      unitPrice,
      subtotal,
    };
  });

  total = Number(total.toFixed(2));
  const observations = payload.observations ? String(payload.observations).trim() : null;

  const transactionalClient = await db.getClient();
  try {
    await transactionalClient.query("BEGIN");

    const createdOrder = await ordersModel.createOrder(
      {
        clientId: client.id,
        advisorId: client.advisor_id,
        status: "pendiente",
        subtotal: total,
        total,
        observations,
      },
      transactionalClient
    );

    for (const item of calculatedItems) {
      await ordersModel.createOrderItem(
        {
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        },
        transactionalClient
      );
    }

    const commission = await commissionsService.createCommissionForOrder(
      {
        orderId: createdOrder.id,
        advisorId: createdOrder.advisor_id,
        orderTotal: total,
      },
      transactionalClient
    );

    await transactionalClient.query("COMMIT");

    const items = await ordersModel.listOrderItems(createdOrder.id);
    return {
      ...mapOrder(createdOrder),
      items: items.map(mapOrderItem),
      commission,
    };
  } catch (error) {
    await transactionalClient.query("ROLLBACK");
    throw error;
  } finally {
    transactionalClient.release();
  }
}

async function getOrders(requester) {
  const scope = await resolveRequesterScope(requester);
  let orders = [];

  if (scope.scope === "admin") {
    orders = await ordersModel.listOrders();
  } else if (scope.scope === "advisor") {
    orders = await ordersModel.listOrdersByAdvisorId(scope.advisorId);
  } else {
    orders = await ordersModel.listOrdersByClientId(scope.clientId);
  }

  return orders.map(mapOrder);
}

async function getOrderById(orderId, requester) {
  const scope = await resolveRequesterScope(requester);
  const order = await ordersModel.findOrderById(orderId);
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  if (scope.scope === "advisor" && order.advisor_id !== scope.advisorId) {
    throw new HttpError(403, "Forbidden");
  }

  if (scope.scope === "client" && order.client_id !== scope.clientId) {
    throw new HttpError(403, "Forbidden");
  }

  const items = await ordersModel.listOrderItems(order.id);
  return {
    ...mapOrder(order),
    items: items.map(mapOrderItem),
  };
}

async function updateOrderStatus(orderId, status, requester) {
  if (requester.role !== "admin") {
    throw new HttpError(403, "Only admins can update order status");
  }

  if (!ORDER_STATUSES.has(status)) {
    throw new HttpError(400, "Invalid order status");
  }

  const existing = await ordersModel.findOrderById(orderId);
  if (!existing) {
    throw new HttpError(404, "Order not found");
  }

  const updated = await ordersModel.updateOrderStatus(orderId, status);
  return mapOrder(updated);
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
