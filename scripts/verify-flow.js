require("dotenv").config();

const BASE = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const DEFAULT_PASSWORD = "admin123";

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message || `HTTP ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function expectFailure(label, fn, expectedStatus) {
  try {
    await fn();
  } catch (error) {
    if (error.status === expectedStatus) {
      console.log(`PASS: ${label} failed as expected (${error.status})`);
      return;
    }
    throw error;
  }

  throw new Error(`${label} was expected to fail`);
}

async function main() {
  const unique = Date.now();
  const adminLogin = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@test.com", password: DEFAULT_PASSWORD }),
  });
  const adminToken = adminLogin.token;
  console.log("PASS: admin login");

  const advisors = await request("/auth/advisors", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const activeAdvisor = advisors.advisors.find((advisor) => advisor.isActive);
  if (!activeAdvisor) {
    throw new Error("No active advisor available");
  }
  console.log("PASS: advisors loaded");

  const publicProducts = await request("/products");
  const product = publicProducts.products.find((row) => row.active && Number(row.stock) >= 3);
  if (!product) {
    throw new Error("No active product with enough stock");
  }
  const originalStock = Number(product.stock);
  console.log("PASS: product available");

  await request(`/products/${product.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ active: false }),
  });
  await expectFailure("public inactive product access", () => request(`/products/${product.id}`), 404);
  await request(`/products/${product.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ active: true }),
  });
  console.log("PASS: inactive products hidden from public");

  const createdClient = await request("/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      businessName: `Cliente Privado ${unique}`,
      taxId: `NIT${unique}`,
      contactName: "Cliente Privado",
      email: `cliente.${unique}@test.com`,
      phone: "3005550000",
      advisorId: activeAdvisor.id,
      status: "pendiente",
      password: DEFAULT_PASSWORD,
    }),
  });
  console.log("PASS: private client created");

  await expectFailure(
    "pending client login",
    () =>
      request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: createdClient.client.email, password: DEFAULT_PASSWORD }),
      }),
    403
  );

  await request(`/clients/${createdClient.client.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "activo" }),
  });
  console.log("PASS: client approved");

  const clientLogin = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: createdClient.client.email, password: DEFAULT_PASSWORD }),
  });
  console.log("PASS: approved client can log in");

  const firstOrder = await request("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientLogin.token}`,
    },
    body: JSON.stringify({
      items: [{ productId: product.id, quantity: 2 }],
      observations: "Pedido de prueba privado",
    }),
  });
  console.log("PASS: order created");

  const productAfterCreate = await request(`/products/${product.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (Number(productAfterCreate.product.stock) !== originalStock - 2) {
    throw new Error("Stock was not reserved");
  }
  console.log("PASS: stock reserved");

  await request(`/orders/${firstOrder.order.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "denegado" }),
  });
  const productAfterDenied = await request(`/products/${product.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (Number(productAfterDenied.product.stock) !== originalStock) {
    throw new Error("Stock was not restored");
  }
  console.log("PASS: denied order restores stock");

  const secondOrder = await request("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientLogin.token}`,
    },
    body: JSON.stringify({
      items: [{ productId: product.id, quantity: 1 }],
      observations: "Pedido para comision",
    }),
  });

  await request(`/orders/${secondOrder.order.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "aprobado" }),
  });

  const commissions = await request("/commissions", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!commissions.commissions.some((row) => row.orderId === secondOrder.order.id)) {
    throw new Error("Approved order should generate commission");
  }
  console.log("PASS: approved order generates commission");

  await request(`/auth/advisor/${activeAdvisor.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isActive: false }),
  });
  console.log("PASS: advisor deactivated");

  await expectFailure(
    "deactivated advisor login",
    () =>
      request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeAdvisor.email, password: DEFAULT_PASSWORD }),
      }),
    403
  );

  await request(`/auth/advisor/${activeAdvisor.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isActive: true }),
  });
  console.log("PASS: advisor reactivated");

  console.log("\nFlow verification complete.");
}

main().catch((error) => {
  console.error("Flow verification failed:", error.message);
  if (error.body) {
    console.error("Response body:", JSON.stringify(error.body));
  }
  process.exit(1);
});
