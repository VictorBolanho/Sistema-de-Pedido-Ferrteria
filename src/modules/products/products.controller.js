const productsService = require("./products.service");

async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.body, req.user);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function bulkCreateProducts(req, res, next) {
  try {
    const products = await productsService.bulkCreateProducts(req.body.products, req.user);
    res.status(201).json({ products, count: products.length });
  } catch (error) {
    next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const products = await productsService.getProducts(req.user);
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body, req.user);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  bulkCreateProducts,
  getProducts,
  getProductById,
  updateProduct,
};

