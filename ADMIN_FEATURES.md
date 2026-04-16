# Admin Product Management System - Complete Documentation

## Overview

The admin panel now includes complete product management capabilities with:
1. ✅ **Single Product Creation Form** - Create individual products with image URLs
2. ✅ **Bulk CSV Import** - Upload multiple products via CSV file
3. ✅ **Product Catalog Display** - View all products with images
4. ✅ **Database Seed Data** - 16 sample products across 4 categories with real image URLs

---

## Features

### 1. Single Product Creation Form

Located in: `/admin` page, **"Crear Nuevo Producto"** section

**Fields:**
- **Nombre del Producto** (required) - Product name
- **SKU** (required) - Unique product identifier (auto-uppercased)
- **Categoría** (required) - Select from: herramientas, accesorios, ceramicas, pegantes
- **Precio** (required) - Product price in dollars
- **Stock** (required) - Available quantity
- **URL de Imagen** (optional) - Public image URL (e.g., from Unsplash, Pexels)

**Features:**
- Real-time form validation
- Success/error toast messages
- Auto-resets form on successful creation
- Reloads product list automatically
- Image URLs are optional - shows "Sin imagen" placeholder if not provided

**Example Input:**
```
Nombre: Taladro Percutor 20V
SKU: TOOL-DRILL-020
Categoría: herramientas
Precio: 99.99
Stock: 25
URL: https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80
```

**Result:** Product created instantly, appears in product list below

---

### 2. Bulk CSV Import

Located in: `/admin` page, **"Carga Masiva de Productos"** section

**Supported CSV Format:**
```csv
name,sku,category,price,stock,image_url
Taladro Percutor 18V,TOOL-DRILL-001,herramientas,89.99,15,https://example.com/drill.jpg
Sierra Circular 7.25",TOOL-SAW-001,herramientas,65.50,22,https://example.com/saw.jpg
Baldosa Cerámica 30x30 Gris,CER-TILE-GRAY-001,ceramicas,3.50,500,https://example.com/tile.jpg
```

**Features:**
- Accepts `.csv` files
- Automatic CSV parsing via papaparse library
- Duplicate SKU handling (skips existing SKUs automatically)
- Shows detailed results: total, created, skipped
- Download template CSV button for quick start
- Image URLs are optional

**Process:**
1. Click "Selecciona tu archivo CSV"
2. Select prepared CSV file
3. System validates and sends to `/api/v1/products/bulk`
4. Results display: how many created, how many skipped (duplicates)
5. Product list refreshes automatically

**Error Handling:**
- Missing required fields → Skipped with note
- Duplicate SKU → Skipped (doesn't overwrite)
- Invalid numbers → Shows error message
- Malformed CSV → Displays parse error

---

### 3. Product Catalog Display

Located in: `/admin` page, **"Productos Existentes"** section

**Shows:**
- Product count total
- Table with: Name, SKU, Price, Stock, Category
- All 16 seed products visible after seeding

**Sorting:**
- Products sorted by insertion order by default
- Can be extended for filtering/sorting in future

---

## Database Seed Data

### Initial Products (16 total, 4 per category)

**Herramientas (Tools):**
1. Taladro Percutor 18V - $89.99 - Stock: 15
2. Sierra Circular 7.25" - $65.50 - Stock: 22
3. Destornillador Set 45 Piezas - $34.99 - Stock: 30
4. Martillo de 16 oz - $19.99 - Stock: 50

**Accesorios (Accessories):**
1. Broca Set 18 Piezas - $22.50 - Stock: 45
2. Lija Assorted Grit Pack - $12.99 - Stock: 60
3. Cintas de Medición 25ft - $8.50 - Stock: 40
4. Nivel Laser Digital - $45.00 - Stock: 12

**Cerámicas (Ceramics):**
1. Baldosa Cerámica 30x30 Gris - $3.50 - Stock: 500
2. Baldosa Cerámica 40x40 Blanco - $5.25 - Stock: 350
3. Baldosa Cerámica Antideslizante - $6.99 - Stock: 250
4. Zócalo Cerámica 10x30 Negro - $2.75 - Stock: 400

**Pegantes (Adhesives):**
1. Pegante PVC 250ml - $5.99 - Stock: 100
2. Silicona Blanca 310ml - $3.50 - Stock: 80
3. Pegante Poliuretano Profesional - $12.99 - Stock: 50
4. Masilla para Grietas 1kg - $8.50 - Stock: 60

**All include real image URLs from Unsplash (public/free images)**

---

## Product Images on Frontend

### ProductCard Component Changes

**File:** `frontend/src/components/ProductCard.jsx`

**Features:**
- Displays product image at top (180px height, cover fit)
- Shows "Sin imagen" placeholder if no image URL
- Links imageUrl from backend response
- Fallback gray box with light text

**Image Display:**
```jsx
{product.imageUrl ? (
  <img
    src={product.imageUrl}
    alt={product.name}
    style={{
      width: "100%",
      height: "180px",
      objectFit: "cover",
      borderRadius: "6px 6px 0 0",
      marginBottom: "12px"
    }}
  />
) : (
  <div style={{...placeholder...}}>Sin imagen</div>
)}
```

**On Catalog Page:**
- Products appear with images in grid layout
- Clicking card adds to cart
- Price shows in orange (#f97316)
- Stock level displayed

---

## API Endpoints (Backend)

### Create Single Product
```
POST /api/v1/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "UNIQUE-SKU",
  "category": "herramientas|accesorios|ceramicas|pegantes",
  "price": 99.99,
  "stock": 50,
  "image_url": "https://example.com/image.jpg" // optional
}

Response: { id, name, sku, price, stock, category, imageUrl, active }
```

### Bulk Create Products
```
POST /api/v1/products/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "products": [
    { "name", "sku", "category", "price", "stock", "image_url" },
    ...
  ]
}

Response: [{ id, name, sku, price, stock, category, imageUrl, active }, ...]
```

### Get All Products
```
GET /api/v1/products
Response: [{ id, name, sku, price, stock, category, imageUrl, active }, ...]
```

---

## Setup Instructions

### 1. Run Migrations
```bash
cd "c:\Users\victor\Documents\2026\Proyectos\Andimat\Sistema de pedidos"
npm run db:migrate
```

### 2. Load Seed Data (Optional)
```bash
npm run db:seed
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Start Frontend (separate terminal)
```bash
cd frontend
npm run dev
```

---

## File Locations

### Backend Components
- **Product Model:** `backend/src/modules/products/products.model.js`
- **Product Service:** `backend/src/modules/products/products.service.js`
- **Product Controller:** `backend/src/modules/products/products.controller.js`
- **Product Routes:** `backend/src/modules/products/products.routes.js`
- **Migration:** `backend/sql/006_products_images.sql`
- **Seed Data:** `backend/src/db/seeds/seed_products.sql`
- **Seed Script:** `backend/scripts/seed.js`

### Frontend Components
- **ProductCard:** `frontend/src/components/ProductCard.jsx`
- **AdminProductForm:** `frontend/src/components/AdminProductForm.jsx`
- **AdminBulkUpload:** `frontend/src/components/AdminBulkUpload.jsx`
- **Admin Page:** `frontend/src/pages/Admin.jsx`

---

## Testing the System

### Test 1: View Seeded Products
1. Navigate to `/catalog` page after seeding
2. Should see 16 products with images from Unsplash
3. Images load correctly with fallback if URL broken

### Test 2: Create Single Product
1. Go to `/admin` → Crear Nuevo Producto
2. Fill in all fields
3. Click "Crear Producto"
4. Should show success message
5. Product appears in list below

### Test 3: Bulk Upload
1. Go to `/admin` → Carga Masiva de Productos
2. Click "📥 Descargar Plantilla CSV"
3. Edit template with 2-3 new products
4. Upload file
5. Should show results (e.g., "2 producto(s) creado(s)")
6. New products visible in list

### Test 4: Add to Cart
1. On `/catalog` page
2. Click "🛒 Agregar al carrito" on any product
3. Should add to cart without page reload
4. Cart count increases

---

## Future Enhancements

- ✅ Image preview before upload
- ✅ Category filtering by product card images
- ✅ Product detail page with full description
- ✅ Edit/delete product functionality
- ✅ Bulk operations (delete/archive multiple)
- ✅ Image upload to server (instead of just URLs)
- ✅ Product variant management (sizes, colors)
- ✅ Inventory tracking per warehouse

---

## Dependencies

**Frontend:**
- `papaparse` - CSV parsing

**Backend:**
- Already includes: `pg`, `express`, `dotenv`, `jsonwebtoken`

---

## Notes

- Image URLs must be publicly accessible (HTTPS recommended)
- CSV files follow strict format (headers: name, sku, category, price, stock, image_url)
- SKU field is case-insensitive (auto-uppercased)
- All numeric fields validated server-side
- Admin authorization required for all product operations
- Bulk upload skips duplicates (SKU field must be unique)

