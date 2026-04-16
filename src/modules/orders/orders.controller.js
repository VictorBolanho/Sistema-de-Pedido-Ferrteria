const ordersService = require("./orders.service");
const HttpError = require("../../utils/http-error");

async function createOrder(req, res, next) {
  try {
    const { items, observations } = req.body;
    if (!items) {
      throw new HttpError(400, "items are required");
    }

    const order = await ordersService.createOrder(
      { items, observations },
      req.user
    );
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
    const { status } = req.body;
    if (!status) {
      throw new HttpError(400, "status is required");
    }

    const order = await ordersService.updateOrderStatus(
      req.params.id,
      status,
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

