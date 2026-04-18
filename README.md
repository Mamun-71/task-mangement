# Task Management System — Architecture Guide

A production-ready fullstack application:

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeORM, MySQL |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Auth | JWT (access + refresh), Google OAuth2, RBAC |
| Docs | Swagger (backend), this file (architecture) |

---

## Repository Layout

```
task-management/
├── backend/     # NestJS REST API  →  see backend/README.md
└── frontend/    # Next.js UI       →  see frontend/README.md
```

---

## Quick Start

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env        # fill in your values
npm install
mysql -u root -e "CREATE DATABASE task_management;"
npm run migration:run
npm run seed
npm run start:dev           # http://localhost:3003

# Terminal 2 — Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

---

## Full Architecture

```
Browser
   |
   |  HTTPS
   v
+──────────────────────────────────────────────────────────+
|                  Next.js Frontend  :3000                  |
|                                                           |
|  app/(authenticated)/   ← protected route group          |
|    layout.tsx           ← single auth gate               |
|    dashboard/page.tsx                                     |
|    tasks/page.tsx                                         |
|    users/page.tsx                                         |
|                                                           |
|  lib/axios.ts           ← configured Axios instance      |
|    request interceptor  ← attaches access_token          |
|    response interceptor ← silent refresh on 401          |
|                                                           |
|  lib/api-services.ts    ← typed wrappers per feature     |
|  store/useAuthStore.ts  ← Zustand global auth state      |
+──────────────────┬───────────────────────────────────────+
                   |
                   |  REST (JSON) + Bearer token
                   |
+──────────────────v───────────────────────────────────────+
|                  NestJS Backend  :3003                    |
|                                                           |
|  main.ts                                                  |
|    ValidationPipe        ← reject invalid DTOs           |
|    TransformInterceptor  ← wrap success responses        |
|    CustomExceptionFilter ← wrap error responses          |
|    Swagger               ← /api/docs                     |
|                                                           |
|  modules/                                                 |
|    auth/       ← login, signup, refresh, logout, Google  |
|    users/      ← user CRUD + role assignment             |
|    roles/      ← role management                         |
|    permissions/← permission management                   |
|    tasks/      ← task CRUD + analytics                   |
|    task-levels/← task level CRUD                         |
|                                                           |
|  common/guards/                                           |
|    JwtAuthGuard      ← validates access token            |
|    RolesGuard        ← checks @Roles() metadata          |
|    PermissionsGuard  ← checks @Permissions() metadata    |
+──────────────────┬───────────────────────────────────────+
                   |
                   |  TypeORM
                   v
+──────────────────────────────────────────────────────────+
|                  MySQL Database                           |
|                                                           |
|  users          roles          permissions                |
|  user_roles     role_permissions                          |
|  tasks          task_levels                               |
+──────────────────────────────────────────────────────────+
```

---

## Authentication & Security Architecture

```
  SIGN UP / LOGIN
  ───────────────
  Client  ──POST /auth/login──►  AuthService
                                   validates credentials
                                   ◄── access_token (15m, JWT_SECRET)
                                   ◄── refresh_token (7d, JWT_REFRESH_SECRET)

  AUTHENTICATED REQUEST
  ─────────────────────
  Client  ──GET /tasks──►  JwtAuthGuard
  Authorization: Bearer      validates signature with JWT_SECRET
  <access_token>             loads user + roles + permissions from DB
                         ──► TasksController ──► TasksService ──► DB

  SILENT REFRESH (automatic, done by axios interceptor)
  ──────────────────────────────────────────────────────
  access_token expires (401)
  axios interceptor  ──POST /auth/refresh──►  JwtRefreshStrategy
  Authorization: Bearer                         validates with JWT_REFRESH_SECRET
  <refresh_token>                               compares against DB stored value
                                           ◄── new access_token + refresh_token
  retry original request automatically

  LOGOUT
  ──────
  Client  ──POST /auth/logout──►  AuthService
                                   sets user.refreshToken = null in DB
                                   (old refresh token is now invalid)
```

---

## RBAC Data Model

```
users (id, name, email, provider, ...)
  |
  +-- user_roles (user_id, role_id)
       |
       +-- roles (id, name)
              |
              +-- role_permissions (role_id, permission_id)
                   |
                   +-- permissions (id, name)

Example:
  User "Alice"
    roles: [ADMIN]
      permissions: [CREATE_TASK, READ_TASK, UPDATE_TASK, DELETE_TASK]

  User "Bob"
    roles: [USER]
      permissions: [CREATE_TASK, READ_TASK, UPDATE_TASK]
```

---

## API Response Envelope

Every response from the backend has a consistent shape:

**Success:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Request successful",
  "data": { "..." },
  "timestamp": "2026-04-18T10:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "status_code": 401,
  "message": "Invalid credentials",
  "code": "UnauthorizedException",
  "timestamp": "2026-04-18T10:00:00.000Z",
  "path": "/auth/login",
  "method": "POST"
}
```

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| Separate JWT_SECRET and JWT_REFRESH_SECRET | Prevents refresh tokens from being used as access tokens |
| `synchronize: false` in TypeORM | Migrations give full control; `synchronize: true` can silently drop columns in production |
| Route group `(authenticated)` in Next.js | Single layout file protects all pages — no per-page auth checks |
| Axios interceptor for silent refresh | Components never need to handle 401 — the token refresh is transparent |
| `select: false` on password and refreshToken columns | These fields are never accidentally returned in API responses |
| `whitelist: true` in ValidationPipe | Strips fields not declared in DTOs — prevents mass-assignment attacks |
| Global TransformInterceptor | Frontend always knows the response shape — no defensive checks per request |

---

## Adding a New Domain Feature

1. **Backend:** `nest g module modules/feature` → entity → DTO → service → controller → migration
2. **Frontend:** `src/app/(authenticated)/feature/page.tsx` → add to `api-services.ts`

See detailed steps in:
- [backend/README.md](./backend/README.md#10-extending)
- [frontend/README.md](./frontend/README.md#9-extending)
