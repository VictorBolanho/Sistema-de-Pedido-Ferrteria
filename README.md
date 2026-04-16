# Sistema de Pedidos - Backend MVP

Backend MVP for a B2B hardware order management system (Andimat).

## Overview

This system allows:

* Clients to place orders through a web portal
* Advisors to earn commissions per order
* Admin to manage clients, products and orders

## Stack

* Node.js + Express
* PostgreSQL (`pg`)
* JWT Authentication

---

## Features implemented

### Phase 1 - Authentication

* JWT login
* Role-based access (admin, advisor, client)
* Bootstrap admin creation

### Phase 2 - Clients & Advisors

* Client creation with advisor assignment
* Advisor reassignment (admin only)
* Advisor history tracking

### Phase 3 - Products (Catalog)

* Product CRUD (admin only)
* Stock (informational)
* Active/inactive products

### Phase 4 - Orders

* Order creation from client
* Order items with transactional integrity
* Status management:

  * pendiente
  * en_proceso
  * aprobado
  * denegado
  * reconsideracion

### Phase 5 - Commissions

* Commission calculated per order
* Tier-based logic:

  * < 1M -> 0%
  * >= 1M -> 2%
  * >= 5M -> 3%
  * >= 10M -> 6%
* Stored permanently (no recalculation)

---

## Quick start

1. Create `.env` from `.env.example`
2. Run migrations:

   ```
   npm run db:migrate
   ```
3. Start API:

   ```
   npm run dev
   ```

---

## API base URL

`/api/v1`

---

## Main endpoints

### Auth

* `POST /auth/bootstrap-admin`
* `POST /auth/login`
* `GET /auth/me`

### Clients

* `POST /clients`
* `GET /clients`
* `PATCH /clients/:id/assign-advisor`

### Products

* `POST /products`
* `GET /products`
* `PATCH /products/:id`

### Orders

* `POST /orders`
* `GET /orders`
* `PATCH /orders/:id/status`

### Commissions

* `GET /commissions`

---

## Notes

* Orders are immutable after creation
* All calculations (totals, commissions) are handled in backend
* Stock is informational only (not enforced strictly)
* System is designed to scale into a full ERP in future phases

---

## Status

MVP fully functional and ready for real-world testing.
