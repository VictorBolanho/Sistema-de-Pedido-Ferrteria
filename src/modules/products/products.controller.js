const productsService = require("./products.service");
const { validate, productSchemas } = require("../../utils/validators");

async function createProduct(req, res, next) {
  try {
    const payload = validate(productSchemas.createProduct, req.body);
    const product = await productsService.createProduct(payload, req.user);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function bulkCreateProducts(req, res, next) {
  try {
    const payload = validate(productSchemas.bulkCreateProducts, req.body);
    const products = await productsService.bulkCreateProducts(payload.products, req.user);
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
    const product = await productsService.getProductById(req.params.id, req.user || null);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const payload = validate(productSchemas.updateProduct, req.body);
    const product = await productsService.updateProduct(req.params.id, payload, req.user);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProductStock(req, res, next) {
  try {
    const payload = validate(productSchemas.updateProductStock, req.body);
    const product = await productsService.updateProductStock(req.params.id, payload.stock, req.user);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProductStatus(req, res, next) {
  try {
    const payload = validate(productSchemas.updateProductStatus, req.body);
    const product = await productsService.updateProductStatus(req.params.id, payload.active, req.user);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(req.params.id, req.user);
    res.status(204).send();
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
  updateProductStock,
  updateProductStatus,
  deleteProduct,
};
