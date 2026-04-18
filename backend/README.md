# Task Management — Backend (NestJS)

> Production-ready REST API built with **NestJS 11**, **TypeORM**, **MySQL**, **JWT** (access + refresh tokens), **Google OAuth**, and **RBAC** (Roles & Permissions).

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Core Concepts (Beginner-Friendly)](#2-core-concepts)
3. [Getting Started](#3-getting-started)
4. [Environment Variables](#4-environment-variables)
5. [Database — Migrations & Seeding](#5-database)
6. [Authentication Flow](#6-authentication-flow)
7. [RBAC — Roles & Permissions](#7-rbac)
8. [API Documentation (Swagger)](#8-swagger)
9. [Best Practices Used](#9-best-practices)
10. [How to Add a New Feature Module](#10-extending)

---

## 1. Project Structure

```
backend/
├── src/
│   ├── app.module.ts              # Root module — wires everything together
│   ├── main.ts                    # Entry point — bootstrap, CORS, pipes, Swagger
│   │
│   ├── common/                    # Shared, reusable code
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser() param decorator
│   │   │   ├── roles.decorator.ts          # @Roles('ADMIN') metadata setter
│   │   │   └── permissions.decorator.ts    # @Permissions('CREATE_TASK') setter
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts           # Validates Bearer access token
│   │   │   ├── roles.guard.ts              # Checks user.roles against @Roles()
│   │   │   └── permissions.guard.ts        # Checks user permissions
│   │   └── interceptors/
│   │       └── transform.interceptor.ts    # Wraps all responses: { success, data, ... }
│   │
│   ├── database/
│   │   ├── data-source.ts         # TypeORM DataSource for CLI (migrations, seed)
│   │   ├── seeder.ts              # Creates default roles, permissions, admin user
│   │   └── migrations/            # Auto-generated migration files
│   │
│   ├── exception/
│   │   └── custom-exception.filter.ts  # Global error handler — consistent error shape
│   │
│   ├── helpers/
│   │   └── pagination.helper.ts   # Generic paginate() utility for QueryBuilders
│   │
│   └── modules/                   # Feature modules — one folder per domain
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts        # signup, login, refresh, logout, googleLogin
│       │   ├── auth.controller.ts     # POST /auth/signup|login|refresh|logout
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── signup.dto.ts
│       │   └── strategies/
│       │       ├── jwt.strategy.ts          # Validates access tokens (JWT_SECRET)
│       │       ├── jwt-refresh.strategy.ts  # Validates refresh tokens (JWT_REFRESH_SECRET)
│       │       └── google.strategy.ts       # Handles Google OAuth callback
│       ├── users/
│       ├── roles/
│       ├── permissions/
│       ├── tasks/
│       └── task-levels/
│
├── .env.example                   # Copy to .env and fill in your values
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## 2. Core Concepts

### 2.1 What is a NestJS Module?

A **module** is a class decorated with `@Module()` that groups related code — controller, service, entities, and guards — for a single feature (e.g., Auth, Tasks).

```
+─────────────────────────────────+
|           AuthModule            |
|  +──────────+  +─────────────+  |
|  |Controller|  |   Service   |  |
|  | (routes) |  | (business)  |  |
|  +────+─────+  +──────+──────+  |
|       |               |         |
|       +───── DI ──────+         |
+─────────────────────────────────+
```

**Rule of thumb:** one folder = one module = one domain concern.

---

### 2.2 Dependency Injection (DI)

NestJS manages class instances for you. You declare *what you need* in the constructor, and NestJS *provides* it.

```typescript
// BAD — manual instantiation (hard to test, tight coupling)
const service = new AuthService(new UserRepository(), new JwtService());

// GOOD — DI (NestJS creates and injects the dependency)
constructor(private authService: AuthService) {}
```

---

### 2.3 Decorators

Decorators are TypeScript annotations that add metadata or wrap behavior.

| Decorator | Where | What it does |
|-----------|-------|-------------|
| `@Module()` | Class | Declares a module |
| `@Controller('auth')` | Class | Mounts routes at `/auth` |
| `@Get()` / `@Post()` | Method | Registers an HTTP endpoint |
| `@Body()` | Param | Extracts request body |
| `@UseGuards(JwtAuthGuard)` | Method/Class | Runs a guard before the handler |
| `@CurrentUser()` | Param | Injects the logged-in user from `req.user` |

---

### 2.4 Guards

Guards decide **can this request proceed?** They run *before* the controller method.

```
Request → Guard (yes/no) → Controller → Service → Response
```

- `JwtAuthGuard` — is the Bearer token valid?
- `RolesGuard` — does the user have the required role?
- `PermissionsGuard` — does the user have the required permission?

---

### 2.5 DTOs and Validation

A **DTO (Data Transfer Object)** is a class that describes the *shape* of incoming data. Combined with `class-validator`, it auto-validates every request body.

```typescript
export class CreateTaskDto {
  @IsString() @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;
}
```

The global `ValidationPipe` in `main.ts` rejects requests that don't match the DTO — no manual `if (!body.description)` checks needed.

---

### 2.6 Interceptors

Interceptors wrap the request/response lifecycle. Our `TransformInterceptor` ensures every successful response looks like:

```json
{
  "success": true,
  "status_code": 200,
  "message": "Request successful",
  "data": { "..." },
  "timestamp": "2026-04-18T10:00:00.000Z"
}
```

---

### 2.7 JWT — Access & Refresh Tokens

| Token | Secret | Lifetime | Purpose |
|-------|--------|----------|---------|
| Access token | `JWT_SECRET` | 15 min | Authenticate every API request |
| Refresh token | `JWT_REFRESH_SECRET` | 7 days | Issue a new access token silently |

**Flow:**
```
Login
  → access_token (15m) + refresh_token (7d)
      |
      +-- Attach access_token to every request: Authorization: Bearer <access_token>
      |
      +-- When 401 received:
            POST /auth/refresh  Authorization: Bearer <refresh_token>
              → new access_token + new refresh_token
```

Using two different secrets means a refresh token **cannot** be used as an access token even if intercepted.

---

### 2.8 RBAC (Role-Based Access Control)

```
User  --has many-->  Roles  --has many-->  Permissions
```

Example:
- Role `ADMIN` — permissions: `CREATE_TASK`, `READ_TASK`, `UPDATE_TASK`, `DELETE_TASK`
- Role `USER`  — permissions: `CREATE_TASK`, `READ_TASK`, `UPDATE_TASK`

Protect an endpoint:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
remove(@Param('id') id: number) { ... }
```

---

## 3. Getting Started

```bash
# 1. Copy and fill env vars
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Create database (MySQL must be running)
mysql -u root -e "CREATE DATABASE task_management;"

# 4. Run migrations (creates all tables)
npm run migration:run

# 5. Seed default roles, permissions, and admin user
npm run seed

# 6. Start development server (watch mode)
npm run start:dev
```

API available at: **http://localhost:3003**

**Default admin credentials:**
- Email: `admin@tasksystem.com`
- Password: `admin123`

---

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3003`) |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | MySQL connection |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | **Different** secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | Must match the URI registered in Google Console |
| `FRONTEND_URL` | Used for CORS allow-list |

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Database

### Migrations

Migrations are version-controlled SQL changes. **Never use `synchronize: true` in production** — it can silently drop data.

```bash
# After changing an entity, generate a migration
npm run migration:generate -- -n YourMigrationName

# Apply all pending migrations
npm run migration:run

# Undo the last migration
npm run migration:revert
```

### Seeder

```bash
npm run seed
```

Creates:
- Permissions: `CREATE_TASK`, `READ_TASK`, `UPDATE_TASK`, `DELETE_TASK`
- Roles: `ADMIN` (all permissions), `USER` (create/read/update)
- Admin user: `admin@tasksystem.com` / `admin123`
- Task levels: Beginner, Intermediate, Expert

---

## 6. Authentication Flow

### Local (Email + Password)

```
POST /auth/signup   { name, email, password }
POST /auth/login    { email, password }
  Response: { access_token, refresh_token, user }

POST /auth/refresh   Authorization: Bearer <refresh_token>
  Response: { access_token, refresh_token, user }

POST /auth/logout    Authorization: Bearer <access_token>
  Response: { message: "Logged out successfully" }
```

### Google OAuth

```
GET /auth/google             -- redirects browser to Google
GET /auth/google/callback    -- Google redirects here after approval
  Response: { access_token, refresh_token, user }
```

**Setup Google OAuth:**
1. Open https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID
3. Add `http://localhost:3003/auth/google/callback` to Authorized Redirect URIs
4. Copy Client ID and Secret into `.env`

---

## 7. RBAC

```typescript
// Require login only
@UseGuards(JwtAuthGuard)

// Require login + specific role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')

// Require login + specific permission
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('DELETE_TASK')
```

Assign roles to a user: `POST /users/:id/roles  { roleIds: [1, 2] }`

---

## 8. Swagger

Interactive API docs: **http://localhost:3003/api/docs**

Click **Authorize** and paste your `access_token` to test protected endpoints.

---

## 9. Best Practices Used

| Practice | Location |
|----------|----------|
| **ConfigModule** — no hardcoded secrets | `app.module.ts`, all strategies |
| **ValidationPipe** with `whitelist: true` | `main.ts` — strips unknown fields automatically |
| **Global exception filter** — consistent error shape | `custom-exception.filter.ts` |
| **Global response interceptor** — consistent success shape | `transform.interceptor.ts` |
| **Refresh token invalidated on logout** | `auth.service.ts` sets `refreshToken = null` |
| **`select: false`** on sensitive columns | `user.entity.ts` — password, refreshToken hidden by default |
| **Separate secrets** for access vs refresh tokens | `jwt.strategy.ts` vs `jwt-refresh.strategy.ts` |
| **Migrations** instead of `synchronize: true` | `data-source.ts` |
| **DTOs** for all incoming data | `/dto` folders in each module |
| **Swagger decorators** on all endpoints | All controllers |

---

## 10. How to Add a New Feature Module

Example: adding a `Leave` module.

```bash
# 1. Generate scaffolding
nest generate module modules/leave
nest generate controller modules/leave
nest generate service modules/leave
```

Then follow this checklist:

- [ ] **Entity** — `src/modules/leave/entities/leave.entity.ts` with TypeORM decorators
- [ ] **DTO** — `src/modules/leave/dto/create-leave.dto.ts` with class-validator
- [ ] **Service** — business logic, inject repository via `@InjectRepository`
- [ ] **Controller** — routes, Swagger decorators, and Guards
- [ ] **Module** — register entity in `TypeOrmModule.forFeature([Leave])`, import in `AppModule`
- [ ] **Migration** — `npm run migration:generate -- -n AddLeaveTable`, then `npm run migration:run`
