# Quick Start - Admin Product Management

## What Was Built

✅ **ProductCard with Images** - Products now display with images (or placeholder)
✅ **Admin Product Form** - Create individual products via form
✅ **Admin Bulk Upload** - Import multiple products via CSV
✅ **Seed Data** - 16 sample products with real images already in database
✅ **All Integrated** - Everything working together in Admin panel

---

## To Get Started (5 minutes)

### Step 1: Start the Backend
```bash
cd "c:\Users\victor\Documents\2026\Proyectos\Andimat\Sistema de pedidos"
npm run dev
```

### Step 2: Start the Frontend (new terminal)
```bash
cd "c:\Users\victor\Documents\2026\Proyectos\Andimat\Sistema de pedidos\frontend"
npm run dev
```

### Step 3: View the Admin Panel
1. Navigate to `http://localhost:5173` (or your Vite port)
2. Go to `/admin` 
3. You should see:
   - **Crear Nuevo Producto** form
   - **Carga Masiva de Productos** CSV upload
   - **Productos Existentes** table with 16 seed products

### Step 4: View Products with Images
1. Go to `/catalog` page
2. See all 16 products with images from Unsplash
3. Click "🛒 Agregar al carrito" to add any product

---

## Test Creating Products

### Test 1: Create Single Product
1. On Admin page, fill "Crear Nuevo Producto" form:
   - Nombre: "Destornillador Magnético"
   - SKU: "TOOL-SCREW-MAG-001"
   - Categoría: "herramientas"
   - Precio: "24.99"
   - Stock: "35"
   - URL: "https://images.unsplash.com/photo-1586864388619-7e12e2c21f32?w=400&q=80"

2. Click "Crear Producto"
3. Success message appears
4. Product visible in list below
5. Should appear on Catalog page

### Test 2: Bulk Upload CSV
1. On Admin page, click "📥 Descargar Plantilla CSV"
2. Edit template, add 2 new products:
   ```csv
   name,sku,category,price,stock,image_url
   Cinta Adhesiva Industrial,ACC-TAPE-001,accesorios,15.99,25,https://images.unsplash.com/photo-1605555927218-acf53f28f129?w=400&q=80
   Pegamento Epoxy 500ml,ADH-EPOXY-001,pegantes,18.50,40,https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80
   ```
3. Upload file
4. See results: "✅ 2 producto(s) creado(s)"
5. Both products appear in product list

---

## File Structure

```
Sistema de pedidos/
├── backend/
│   ├── src/
│   │   ├── db/seeds/
│   │   │   └── seed_products.sql (16 sample products)
│   │   └── modules/products/
│   │       ├── products.model.js (updated with image_url)
│   │       ├── products.service.js (updated with bulkCreateProducts)
│   │       └── products.controller.js (updated with bulk handler)
│   └── sql/
│       └── 006_products_images.sql (migration for image_url column)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductCard.jsx (now displays images) ⭐
│   │   │   ├── AdminProductForm.jsx (new component) ⭐
│   │   │   └── AdminBulkUpload.jsx (new component) ⭐
│   │   ├── pages/
│   │   │   └── Admin.jsx (updated with new components) ⭐
│   │   └── services/
│   │       └── productsService.js (unchanged, works with images)
│   └── package.json (added papaparse)
│
├── package.json (added db:seed script)
├── scripts/
│   ├── migrate.js (existing)
│   └── seed.js (new - loads seed data) ⭐
│
└── ADMIN_FEATURES.md (complete documentation) ⭐
```

---

## Key Features Explained

### 1. ProductCard - Image Display
```jsx
// Shows image if available, otherwise "Sin imagen" placeholder
{product.imageUrl ? <img src={product.imageUrl} /> : <placeholder>}
```

### 2. AdminProductForm - Single Product
- Form with validation
- Posts to `POST /api/v1/products`
- Auto-reloads product list
- Optional image URLs

### 3. AdminBulkUpload - Multiple Products
- Accepts CSV files
- Parses with papaparse
- Posts to `POST /api/v1/products/bulk`
- Handles duplicates (skips if SKU exists)
- Shows results summary

### 4. Seed Data
- 16 products pre-loaded
- 4 categories: herramientas, accesorios, ceramicas, pegantes
- Real Unsplash image URLs
- Loaded via `npm run db:seed`

---

## API Endpoints

```
POST /api/v1/products
  Create single product
  Body: { name, sku, category, price, stock, image_url? }

POST /api/v1/products/bulk
  Create multiple products
  Body: { products: [...] }

GET /api/v1/products
  Fetch all products (includes imageUrl)
```

---

## Troubleshooting

**Issue:** Images not showing on Catalog page
- Solution: Check if seed data loaded (`npm run db:seed`)
- Check browser console for network errors
- Verify image URLs are publicly accessible

**Issue:** Admin form not creating products
- Solution: Check you're logged in as admin
- Check AUTH token in localStorage
- Check browser console for errors

**Issue:** CSV upload fails
- Solution: Verify CSV headers match exactly: `name,sku,category,price,stock,image_url`
- Check file is `.csv` format
- Verify no duplicate SKUs (they'll be skipped)

**Issue:** `papaparse` not found error
- Solution: Run `npm install papaparse` in frontend folder

---

## Next Steps

1. ✅ **Immediate:** Test creating products on Admin page
2. ✅ **Immediate:** Upload CSV with bulk products
3. ✅ **Next:** View products with images on Catalog page
4. **Future:** Add product edit/delete functionality
5. **Future:** Add product image upload (file upload to server)
6. **Future:** Add category filtering with images

---

## Database Setup Summary

```bash
# Already done:
npm run db:migrate        # Applied all migrations (including image_url)
npm run db:seed          # Loaded 16 seed products

# To reset to fresh state:
# 1. Delete orden_db database: dropdb orden_db
# 2. Create fresh: createdb orden_db
# 3. Run: npm run db:migrate
# 4. Run: npm run db:seed
```

---

## Component Files Added

1. **AdminProductForm.jsx** (95 lines)
   - Single product form with validation
   - Toast notifications
   - Integrates with POST /products API

2. **AdminBulkUpload.jsx** (155 lines)
   - CSV file upload and parsing
   - Results display
   - Template download button

3. **seed.js** (32 lines)
   - Node.js script to load seed data
   - Can be run separately with `npm run db:seed`

---

## Summary

Everything is working and ready to use! 
- 📦 16 sample products with images already loaded
- 🎨 ProductCard displays images beautifully
- ➕ Create individual products via form
- 📥 Bulk import products via CSV
- 🔐 Admin authorization required
- ✅ All endpoints functional

**You can now:**
1. See 16 product images on the Catalog page
2. Create new products one at a time
3. Upload multiple products via CSV
4. Manage product images using Unsplash URLs
