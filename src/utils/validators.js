const { z } = require("zod");
const HttpError = require("./http-error");

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.errors.map((error) => ({
      path: error.path.join("."),
      message: error.message,
    }));
    throw new HttpError(400, "Validation error", details);
  }
  return result.data;
}

const authSchemas = {
  login: z.object({
    email: z.string().email({ message: "Email invalido" }),
    password: z.string().min(1, { message: "Password is required" }),
  }),
  bootstrapAdmin: z.object({
    email: z.string().email({ message: "Email invalido" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    bootstrapToken: z.string().min(1, { message: "Bootstrap token is required" }),
  }),
  createAdvisor: z.object({
    email: z.string().email({ message: "Email invalido" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
  }),
  updateAdvisorStatus: z.object({
    isActive: z.boolean(),
  }),
  requestPasswordReset: z.object({
    email: z.string().email({ message: "email must be valid" }),
  }),
  resetPassword: z.object({
    email: z.string().email({ message: "email must be valid" }),
    resetCode: z.string().min(6, { message: "resetCode is required" }),
    newPassword: z.string().min(8, { message: "newPassword must be at least 8 characters" }),
  }),
};

const clientSchemas = {
  createClient: z.object({
    businessName: z.string().min(1, { message: "businessName is required" }),
    taxId: z.string().min(1, { message: "taxId is required" }),
    contactName: z.string().min(1, { message: "contactName is required" }),
    email: z.string().email({ message: "email must be valid" }),
    password: z.string().min(8, { message: "password must be at least 8 characters" }).optional(),
    phone: z.string().min(1, { message: "phone is required" }),
    advisorId: z.string().uuid({ message: "advisorId must be a valid UUID" }),
    status: z.enum(["pendiente", "activo", "bloqueado"]).optional(),
  }),
  assignAdvisor: z.object({
    advisorId: z.string().uuid({ message: "advisorId must be a valid UUID" }),
  }),
  updateClientStatus: z.object({
    status: z.enum(["pendiente", "activo", "bloqueado"]),
  }),
};

const orderSchemas = {
  createOrder: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid({ message: "productId must be a valid UUID" }),
        quantity: z.number().int().positive({ message: "quantity must be a positive integer" }),
      })
    ).min(1, { message: "Order must have at least 1 item" }),
    observations: z.string().optional(),
  }),
  updateOrderStatus: z.object({
    status: z.string().min(1, { message: "status is required" }),
  }),
};

const productSchemas = {
  createProduct: z.object({
    name: z.string().min(1, { message: "name is required" }),
    sku: z.string().min(1, { message: "sku is required" }),
    price: z.number().nonnegative({ message: "price must be a non-negative number" }),
    stock: z.number().int().nonnegative({ message: "stock must be a non-negative integer" }),
    category: z.string().min(1, { message: "category is required" }),
    active: z.boolean().optional(),
    image_url: z.string().optional().nullable(),
  }),
  updateProduct: z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    category: z.string().optional(),
    active: z.boolean().optional(),
    image_url: z.string().optional().nullable(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "No valid fields provided for update",
  }),
  updateProductStock: z.object({
    stock: z.number().int().nonnegative({ message: "stock must be a non-negative integer" }),
  }),
  updateProductStatus: z.object({
    active: z.boolean(),
  }),
  bulkCreateProducts: z.object({
    products: z.array(z.any()).min(1, { message: "products must be a non-empty array" }),
  }),
};

module.exports = {
  validate,
  authSchemas,
  clientSchemas,
  orderSchemas,
  productSchemas,
};
