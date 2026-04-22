const ordersService = require("./orders.service");
const { validate, orderSchemas } = require("../../utils/validators");

async function createOrder(req, res, next) {
  try {
    const payload = validate(orderSchemas.createOrder, req.body);
    const order = await ordersService.createOrder(payload, req.user);
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await ordersService.getOrders(req.user);
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.params.id, req.user);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const payload = validate(orderSchemas.updateOrderStatus, req.body);
    const order = await ordersService.updateOrderStatus(
      req.params.id,
      payload.status,
      req.user
    );
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};

