# Quick Reference: Authentication After Reset

## ⚡ TL;DR

**After `npm run db:reset` or `npm run db:seed`, you can login with:**

```
Email: admin@test.com
Password: 123456
```

All 3 test users are automatically created and ready to use.

---

## 🔐 Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | 123456 | admin |
| advisor@test.com | 123456 | advisor |
| client@test.com | 123456 | client |

All users use the **same password: 123456**

---

## 🚀 Quick Workflow

### 1. Reset Database
```bash
npm run db:reset
```

**What happens:**
- ✅ All old data deleted
- ✅ Products reseeded (16 items)
- ✅ Users recreated (3 test accounts)
- ✅ Ready to use (3-5 seconds)

### 2. Start Backend
```bash
npm run dev
```

### 3. Login
```
Username: admin@test.com
Password: 123456
```

**Done!** You're back in the system.

---

## 🔄 Common Tasks

### Fresh Development Environment
```bash
npm run db:reset  # ~3-5 seconds
npm run dev
```

### Reload Products Only
```bash
npm run db:seed
# Uses existing users (no duplicate errors)
```

### Recreate Users (keep products)
```bash
npm run db:seed-users
```

### Everything From Scratch
```bash
npm run db:migrate     # Schema only (rarely needed)
npm run db:seed        # Products + Users
npm run dev
```

---

## ✅ Verification

### Confirm Users Are Created
```bash
# Check database
psql -U postgres -d orden_db -c "SELECT email, role FROM users;"

# Output should show:
# admin@test.com     | admin
# advisor@test.com   | advisor
# client@test.com    | client
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'

# Should return JWT token
```

---

## 🎯 Features

✅ **Automatic** - Users created with reset/seed  
✅ **Idempotent** - Run multiple times, no errors  
✅ **Bcrypt Hashed** - Passwords properly secured  
✅ **Complete Profiles** - Advisors & clients set up  
✅ **All Roles** - Admin, advisor, client available  

---

## 🔧 Advanced Options

### Run User Seed Independently
```bash
npm run db:seed-users
```

### Manually Update Credentials
In `scripts/seed-users.js`, edit:
```javascript
const DEFAULT_USERS = [
  {
    email: "admin@test.com",      // Change email
    password: "123456",            // Change password
    role: "admin",
    firstName: "Admin",
    lastName: "User",
  },
  // ... more users
];
```

Then:
```bash
npm run db:seed-users
```

---

## 📊 What Gets Created

### Users Table
- admin@test.com (role: admin)
- advisor@test.com (role: advisor)
- client@test.com (role: client)

### Advisors Table
- 1 advisor record linked to advisor@test.com
- First name: Juan
- Last name: Advisor

### Clients Table
- 1 client record linked to client@test.com
- Business name: Test Business
- Tax ID: TAX123456789
- Assigned to Juan Advisor

### Products Table
- 16 products across 4 categories
- All with image URLs
- Ready for catalog

---

## 🚨 Important Notes

### Development Only
These test credentials are for **development** use only.

**Before production:**
1. Change passwords in seed-users.js
2. Use environment variables for production credentials
3. Disable auto-seed in production
4. Generate strong admin password
5. Create proper user management UI

### Login Flow
1. Navigate to app
2. Click "Login"
3. Enter admin@test.com / 123456
4. JWT token generated
5. Stored in localStorage
6. Used for API requests

### Passwords Are Hashed
- Never see plain text in database
- Uses bcryptjs (same as auth service)
- 10 rounds of hashing
- Secure comparison on login

---

## ✨ Summary

| Action | Command | Time | Result |
|--------|---------|------|--------|
| Full Reset | `npm run db:reset` | 3-5s | Users + Products ready |
| Products Only | `npm run db:seed` | 1-2s | Products reloaded |
| Users Only | `npm run db:seed-users` | 1s | Users recreated |
| Backend | `npm run dev` | 2-3s | Server running |

**Total time to working system: ~5-8 seconds**

---

## 🎉 Bottom Line

After database reset, login with:
- **Email:** admin@test.com
- **Password:** 123456

Everything is automated. Just run `npm run db:reset` and you're back in business! 🚀
