const BASE = 'http://localhost:3000/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `HTTP ${res.status} ${res.statusText}`);
  return body;
}

async function main() {
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: '123456' }),
  });

  console.log('Admin token acquired');
  const token = adminLogin.token;

  const advisors = await request('/auth/advisors', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Advisors before create:', advisors.advisors.map((a) => a.email));

  const createVendor = await request('/auth/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email: 'nuevo-vendedor-delete@test.com', password: '123456' }),
  });
  console.log('Created vendor:', createVendor.user.email, createVendor.user.id);

  const advisorsAfter = await request('/auth/advisors', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Advisors after create:', advisorsAfter.advisors.map((a) => a.email));

  const vendor1 = advisorsAfter.advisors.find((a) => a.email === 'vendedor1@test.com');
  if (!vendor1) throw new Error('vendedor1@test.com not found');

  const clientCreate = await request('/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      businessName: 'Cliente Dos S.A.',
      taxId: 'TAXCLIENTE1002',
      contactName: 'Cliente Dos',
      advisorId: vendor1.id,
      status: 'activo',
    }),
  });
  console.log('Created second client assigned to vendedor1:', clientCreate.client.id);

  const products = await request('/products');
  if (!Array.isArray(products.products) || products.products.length === 0) {
    throw new Error('No products available to make order');
  }
  const product = products.products[0];
  console.log('Using product:', product.id, product.name);

  const clientLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cliente1@test.com', password: '123456' }),
  });
  console.log('Client login success');

  const order = await request('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientLogin.token}` },
    body: JSON.stringify({ items: [{ productId: product.id, quantity: 1 }] }),
  });
  console.log('Client order created:', order.order.id);

  const deleteVendor = await request(`/auth/advisor/${createVendor.user.advisorId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Deleted vendor:', deleteVendor.advisor.id);

  console.log('\nFlow verification complete.');
}

main().catch((error) => {
  console.error('Flow verification failed:', error.message);
  process.exit(1);
});