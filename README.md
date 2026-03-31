# Task Management System

This project is a comprehensive Task Management System built with a scalable **NestJS** backend (using MySQL and TypeORM) and a modern **Next.js** frontend. This application implements the "bdlaws" architectural pattern but substitutes MongoDB for a relational SQL structure using TypeORM.

## Project Structure and Architecture Overview

The system is separated into two primary directories: `backend/` and `frontend/`.

### ⚡ Backend (NestJS + TypeORM + MySQL)
The backend follows a highly modular, domain-driven design structure.

**Key Architecture Concepts:**
- **Modules (`src/modules`):** Feature isolation. Instead of sprawling routes, each domain (e.g., Users, Roles, Tasks) is encapsulated in its own directory containing controllers, services, entities, and data transfer objects (DTOs).
- **Global Error Handling (`src/exception`):** A custom HTTP exception filter catches all application and database errors (including TypeORM duplicates or EntityNotFound exceptions) and structures them uniformly before returning them to the user.
- **RBAC (Role-Based Access Control):** Utilizing `AuthenticationGuard` and custom route decorators, endpoints verify deeply nested permissions associated with incoming JWT models.
- **Common (`src/common`):** Contains globally accessible utility functions, decorators, shared DTOs, configurations, and guards.
- **Auto Data-Migration:** TypeORM configurations can automatically sync entity structures directly back to the database as long as `synchronize` is set, but this project employs `migrations` defined in `package.json` to generate, run, and reverse tracked database modifications securely.

#### Running the Backend
1. **Prerequisites:** Ensure you have a running MySQL database.
2. **Access Backend Directory:** `cd backend`
3. **Install Dependencies:** `yarn install` or `npm install`
4. **Environment Setup:** Make sure your database is running on `127.0.0.1:3306` with username `root`. You can configure the `data-source.ts` to attach a password if needed.
5. **Database Migration:** Run `yarn run migration:run` to inject the tables.
6. **Database Seeding (Optional):** Run `yarn run seed` to populate initial roles, admin context, and data.
7. **Development Server:** Run `yarn run start:dev` or `npm run start:dev` to start the backend. Swagger docs are at `/api/docs`.

### 🎨 Frontend (Next.js App Router)
The frontend uses Next.js app directory principles unified around the architecture defined by your other applications.

**Key Architecture Concepts:**
- **App Router (`src/app`):** Represents routing strictly defined through directory paths.
- **Components (`src/components`):** Reusable atomic design elements (e.g. customized buttons, inputs, dialogs).
- **Modules (`src/modules`):** Larger business-logic groupings (such as a full feature page container like TaskBoard or UserProfile). This promotes reusability across a monorepo setup if expanded.
- **Services (`src/services`):** External data fetching logic (Axios or Fetch wrappers). By separating HTTP requests here, UI components remain clean.
- **Hooks (`src/hooks`):** Common React logic to handle abstractions like localized state, debouncing, or customized contexts.
- **Store (`src/store`):** Handles global client-side state managers like Zustand.
- **Commons (`src/@commons`):** Shared type interfaces and constants.

#### Running the Frontend
1. **Access Frontend Directory:** `cd frontend`
2. **Install Dependencies:** `npm install` or `yarn install`
3. **Environment Setup:** Configure anything targeting `localhost:3003`.
4. **Development Server:** Run `npm run dev` to start the frontend on port 3000.

---
### 📖 Learning Guide & Design Patterns Used
1. **Module Pattern:** We logically group logic, data layers, and interaction points. It keeps software boundaries clean (NestJS heavily leans on this).
2. **Repository Pattern:** Database interaction goes exclusively through repositories, ensuring business logic isn't tightly coupled to MySQL syntax.
3. **Guard/Interceptor/Filter Pattern:** Incoming metadata is intercepted universally rather than writing inline checks in every controller path. Standardizing JSON outputs heavily uses the Exception Filter!
4. **Decoupled Frontend:** Presentational Components (UI only) exist separate from Smart Components (Modules) which interact with Services (Data Layer).
