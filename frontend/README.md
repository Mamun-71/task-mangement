# Task Management — Frontend (Next.js)

> Production-ready frontend built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Zustand**, **Axios** (with silent token refresh), and **React Hook Form + Zod**.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Core Concepts (Beginner-Friendly)](#2-core-concepts)
3. [Getting Started](#3-getting-started)
4. [Environment Variables](#4-environment-variables)
5. [Authentication Flow](#5-authentication-flow)
6. [API Layer](#6-api-layer)
7. [State Management (Zustand)](#7-state-management)
8. [Protected Routes](#8-protected-routes)
9. [How to Add a New Feature Page](#9-extending)

---

## 1. Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router — each folder is a route
│   │   ├── layout.tsx              # Root layout — wraps every page
│   │   ├── page.tsx                # / — home/redirect page
│   │   ├── login/
│   │   │   └── page.tsx            # /login
│   │   ├── signup/
│   │   │   └── page.tsx            # /signup
│   │   └── (authenticated)/        # Route group — protected pages share a layout
│   │       ├── layout.tsx          # Auth check: redirect to /login if not logged in
│   │       ├── dashboard/
│   │       │   └── page.tsx        # /dashboard
│   │       ├── tasks/
│   │       │   └── page.tsx        # /tasks
│   │       ├── task-levels/
│   │       │   └── page.tsx        # /task-levels
│   │       └── users/
│   │           └── page.tsx        # /users
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── TaskForm.tsx            # Feature component
│   │   └── ui/                     # shadcn/ui primitives (Button, Card, etc.)
│   │
│   ├── lib/
│   │   ├── axios.ts                # Configured Axios instance with interceptors
│   │   ├── api-services.ts         # Feature-level API functions (authService, tasksService...)
│   │   └── utils.ts                # shadcn cn() utility
│   │
│   └── store/
│       └── useAuthStore.ts         # Zustand auth store — user, tokens, helpers
│
├── .env.local.example              # Copy to .env.local and fill in
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 2. Core Concepts

### 2.1 Next.js App Router

The `app/` directory maps directly to URLs. Each `page.tsx` file is a route.

```
app/
  login/page.tsx          →  /login
  (authenticated)/
    dashboard/page.tsx    →  /dashboard   (protected)
    tasks/page.tsx        →  /tasks       (protected)
```

**Route groups** (folder names in parentheses like `(authenticated)`) are invisible in the URL but let you share a layout — perfect for wrapping all protected pages in a single auth check.

---

### 2.2 Server vs Client Components

| Type | Default | Can use hooks? | Can fetch on server? |
|------|---------|----------------|----------------------|
| Server Component | Yes | No | Yes |
| Client Component (`'use client'`) | No | Yes | No |

**Rule of thumb:**
- Pages that only display data fetched at build/request time → Server Component (faster, SEO-friendly)
- Pages with `useState`, `useEffect`, event handlers → add `'use client'` at the top

---

### 2.3 Axios Instance & Interceptors

Instead of calling `axios.get(url)` directly, all requests go through the configured instance in `lib/axios.ts`.

**Request interceptor** — automatically attaches the access token:
```
Every request → "Authorization: Bearer <access_token>" added automatically
```

**Response interceptor** — handles token expiry silently:
```
Response 401
  → try POST /auth/refresh with refresh_token
  → success? retry original request with new access_token
  → fail? clear cookies and redirect to /login
```

This means pages/components **never need to handle 401 manually** — the interceptor does it for them.

---

### 2.4 Zustand (Global State)

Zustand is a lightweight state library. Think of it as a shared `useState` accessible from any component without prop drilling.

```typescript
// In any component:
const { user, isAuthenticated, logout } = useAuthStore();

// Check a role:
const isAdmin = useAuthStore(s => s.hasRole('ADMIN'));
```

Auth state is initialised from cookies on every page load, so a browser refresh doesn't log the user out.

---

### 2.5 API Services Layer

`lib/api-services.ts` wraps every backend endpoint in a typed function. Components never construct URLs manually.

```typescript
// Component calls a service function:
const response = await tasksService.getAll({ status: 'PENDING' });

// Service function builds the request:
export const tasksService = {
  getAll: (filters?) => api.get(`/tasks?...`),
  create: (data)    => api.post('/tasks', data),
  ...
};
```

Benefits: if the backend URL changes, you fix it in one place.

---

### 2.6 React Hook Form + Zod

Forms use `react-hook-form` for state management and `zod` for schema validation.

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

No manual `if (!email.includes('@'))` checks — Zod handles all validation and provides typed error messages.

---

### 2.7 Protected Routes

The `(authenticated)/layout.tsx` file runs on every page inside the group. It checks the Zustand store:

```
Page load → layout checks isAuthenticated
  → false? redirect to /login
  → true?  render the page
```

---

## 3. Getting Started

```bash
# 1. Copy and fill env vars
cp .env.local.example .env.local

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

App available at: **http://localhost:3000**

Make sure the backend is running at `http://localhost:3003` (or update `NEXT_PUBLIC_API_URL`).

---

## 4. Environment Variables

Copy `.env.local.example` to `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (no trailing slash) |
| `NEXT_PUBLIC_APP_NAME` | App name shown in UI |

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets here.

---

## 5. Authentication Flow

### Login (Email + Password)

```
User submits form
  → authService.login({ email, password })
  → backend returns { access_token, refresh_token, user }
  → setTokens() stores both tokens in cookies + Zustand
  → router.push('/dashboard')
```

### Silent Refresh (Automatic)

```
Any API call returns 401
  → axios interceptor calls POST /auth/refresh
  → new tokens stored in cookies + Zustand
  → original request retried automatically
```

### Logout

```
User clicks Logout
  → calls POST /auth/logout (invalidates server-side refresh token)
  → store.logout() clears cookies + Zustand state
  → redirect to /login
```

### Google OAuth (Frontend Side)

Redirect the user to the backend's Google auth endpoint:

```typescript
window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
// Backend handles OAuth, returns tokens, redirects back to frontend
```

---

## 6. API Layer

### Adding a new service

```typescript
// src/lib/api-services.ts

export const leaveService = {
  getAll:  ()           => api.get('/leave'),
  create:  (data: any)  => api.post('/leave', data),
  update:  (id: number, data: any) => api.patch(`/leave/${id}`, data),
  delete:  (id: number) => api.delete(`/leave/${id}`),
};
```

### Response envelope

All backend responses are wrapped:
```typescript
// response.data.data contains the actual payload
const { data } = await tasksService.getAll();
const tasks = data.data; // the array of tasks
```

---

## 7. State Management (Zustand)

```typescript
import { useAuthStore } from '@/store/useAuthStore';

// Read state
const user = useAuthStore(s => s.user);
const isAdmin = useAuthStore(s => s.hasRole('ADMIN'));
const canDelete = useAuthStore(s => s.hasPermission('DELETE_TASK'));

// Write state
const { setTokens, logout } = useAuthStore();
setTokens(user, accessToken, refreshToken);
logout();
```

For non-auth global state (e.g., filters, UI state) create a new store file in `src/store/`.

---

## 8. Protected Routes

The `(authenticated)/layout.tsx` checks authentication. All pages inside that folder are automatically protected.

To add role-based protection to a specific page:

```typescript
'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const isAdmin = useAuthStore(s => s.hasRole('ADMIN'));
  if (!isAdmin) redirect('/dashboard');
  // ...
}
```

---

## 9. How to Add a New Feature Page

Example: adding a `/leave` page.

```
1. Create the route file:
   src/app/(authenticated)/leave/page.tsx

2. Add the API service:
   src/lib/api-services.ts  →  export const leaveService = { ... }

3. (Optional) Create a reusable component:
   src/components/LeaveForm.tsx

4. (Optional) Add a nav link in the authenticated layout sidebar.
```

**Checklist:**
- [ ] Page file inside `(authenticated)/` for auto-protection
- [ ] API service functions in `api-services.ts`
- [ ] Types defined (avoid `any` — define an interface)
- [ ] Loading and error states handled
- [ ] Form validation with Zod if the page has a form
