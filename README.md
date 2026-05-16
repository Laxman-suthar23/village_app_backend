# 🏘️ Village Family Directory API

A production-ready REST API for managing village family directories, built with **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM**, **JWT Auth**, and **Cloudinary** image uploads.

---

## 📁 Project Structure

```
village-directory-api/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.js                # Super admin seeder
├── src/
│   ├── app.js                 # Express app entry point
│   ├── config/
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── cloudinary.js      # Cloudinary + Multer config
│   ├── controllers/           # Request/response handlers
│   │   ├── auth.controller.js
│   │   ├── village.controller.js
│   │   ├── family.controller.js
│   │   └── member.controller.js
│   ├── services/              # Business logic
│   │   ├── auth.service.js
│   │   ├── village.service.js
│   │   ├── family.service.js
│   │   └── member.service.js
│   ├── routes/                # Route definitions
│   │   ├── auth.routes.js
│   │   ├── village.routes.js
│   │   ├── family.routes.js
│   │   └── member.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── role.middleware.js      # Role-based access control
│   │   └── validate.middleware.js  # Request validation rules
│   └── utils/
│       ├── ApiError.js        # Custom error class + handler
│       ├── response.js        # Consistent success responses
│       ├── jwt.js             # JWT sign/verify helpers
│       └── pagination.js      # Pagination utilities
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd village-directory-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Setup Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed super admin
node prisma/seed.js
```

Or run everything at once:

```bash
npm run setup
```

### 4. Start Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

---

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/village_directory"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Seeded super admin credentials
SUPER_ADMIN_MOBILE=9999999999
SUPER_ADMIN_PASSWORD=Admin@1234
```

---

## 👤 Roles & Permissions

| Action                        | SUPER_ADMIN | VILLAGE_ADMIN       |
|-------------------------------|:-----------:|:-------------------:|
| Login                         | ✅          | ✅                  |
| Create village admin          | ✅          | ❌                  |
| CRUD all villages             | ✅          | ❌ (read own only)  |
| CRUD families in any village  | ✅          | Own village only    |
| CRUD members in any family    | ✅          | Own village only    |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected endpoints require:
```
Authorization: Bearer <token>
```

---

### 🔑 Auth

#### Login
```
POST /auth/login
Body: { "mobile": "9999999999", "password": "Admin@1234" }
Response: { token, user }
```

#### Get Current User
```
GET /auth/me
Auth: Required
```

#### Create Village Admin *(SUPER_ADMIN only)*
```
POST /auth/admins
Body: { "name", "mobile", "password", "village_id" }
```

---

### 🏘️ Villages

| Method | Endpoint         | Auth Required | Role        |
|--------|-----------------|---------------|-------------|
| GET    | /villages        | ✅            | Any         |
| GET    | /villages/:id    | ✅            | Any         |
| POST   | /villages        | ✅            | SUPER_ADMIN |
| PUT    | /villages/:id    | ✅            | SUPER_ADMIN |
| DELETE | /villages/:id    | ✅            | SUPER_ADMIN |

**POST/PUT** supports `multipart/form-data` with `cover_image` field.

**GET /villages** query params:
- `q` — search by name
- `page`, `limit` — pagination

---

### 👨‍👩‍👧‍👦 Families

| Method | Endpoint               | Auth Required | Role            |
|--------|------------------------|---------------|-----------------|
| GET    | /families              | ✅            | Filtered by village |
| GET    | /families/search?q=    | ✅            | Filtered by village |
| GET    | /families/:id          | ✅            | Own village     |
| POST   | /families              | ✅            | Own village     |
| PUT    | /families/:id          | ✅            | Own village     |
| DELETE | /families/:id          | ✅            | Own village     |

**POST/PUT** supports `multipart/form-data` with `photo` field.

**GET /families** query params:
- `village_id` — filter by village *(SUPER_ADMIN only, injected automatically for VILLAGE_ADMIN)*
- `gotra` — filter by gotra
- `page`, `limit` — pagination

**GET /families/search** query params:
- `q` — searches head_name, father_name, gotra, address, mobile, member names
- `page`, `limit`

---

### 👤 Members

| Method | Endpoint       | Auth Required |
|--------|----------------|---------------|
| POST   | /members       | ✅            |
| PUT    | /members/:id   | ✅            |
| DELETE | /members/:id   | ✅            |

**POST body:** `family_id`, `name`, `relation`, `age`, `education`, `occupation`

---

## 📦 Response Format

### Success
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "mobile", "message": "Invalid mobile number" }
  ]
}
```

---

## 🛠️ Useful Commands

```bash
npm run db:migrate     # Run pending migrations
npm run db:generate    # Regenerate Prisma client
npm run db:push        # Push schema without migration (dev)
npm run db:seed        # Seed super admin
npm run db:studio      # Open Prisma Studio (visual DB browser)
```

---

## 🏗️ Architecture Decisions

- **Clean layered architecture**: Routes → Controllers → Services → Prisma
- **Centralized error handling**: `ApiError` class + Express error middleware
- **Role enforcement at middleware level**: `authenticate` → `authorize` → `restrictToOwnVillage`
- **Image uploads via Cloudinary**: Only URLs stored in DB, transforms applied on upload
- **Pagination** on all list endpoints, configurable via query params
- **Search** across multiple fields using Prisma `OR` conditions
- **bcryptjs** for password hashing (salt rounds: 10)
- **UUID** primary keys for all models

---

## 🔒 Security Notes

- Passwords are never returned in any API response
- VILLAGE_ADMINs are automatically scoped to their village — they cannot query or modify other villages
- Image uploads are restricted to image MIME types, max 5MB
- JWT tokens expire (configurable via `JWT_EXPIRES_IN`)
- All UUIDs in params are validated before DB queries
