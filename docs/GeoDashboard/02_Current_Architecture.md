# Geo Dashboard - Current Architecture

## 1. Backend Architecture (Laravel 12)
The backend is built on **Laravel 12** running on **PHP ^8.2**. It adheres to a strict modular design pattern where core business domains are separated into modules.

### Folder Structure & Modular Segregation
All custom domain logic is located under `app/Modules/` instead of standard Laravel folders:
* `app/Modules/Auth/` - Authentication logic, Login, Password resets.
* `app/Modules/CRM/` - Lead and Deal pipeline management.
* `app/Modules/Dashboard/` - Role-based KPI stats.
* `app/Modules/Geography/` - Divisions, Territories, and Localities.
* `app/Modules/Notification/` - Event-driven in-app alerts and notifications.
* `app/Modules/Partner/` - Partner lifecycle and conversion.
* `app/Modules/Report/` - CSV exports and report generation.

### 6-Layer Architecture Pattern
Every module follows a decoupled 6-layer design pattern:
1. **Controller**: Handles incoming HTTP requests and returns standardized JSON responses via `BaseApiController.php`.
2. **Form Request**: Validates request parameters (located in `app/Modules/<Domain>/Requests/`).
3. **Service**: Contains the core business logic (located in `app/Modules/<Domain>/Services/` or global `app/Services/`).
4. **Repository**: Encapsulates all query and database persistence logic (located in `app/Repositories/`).
5. **Model**: Defines the Eloquent attributes, relations, and casts (located in `app/Models/`).
6. **Database**: Migrations, seeders, and model factories.

### Authentication & Authorization
* **Sanctum Authentication**: The app uses token-based API authentication via `Laravel Sanctum`.
* **RBAC Authorization**: Managed via the `spatie/laravel-permission` package. Roles and permissions are evaluated using policies, controllers, or gates.

---

## 2. Frontend Architecture (React 19)
The frontend is a single-page application built on **React 19**, compiled with **Vite 8**, and styled using **TailwindCSS 4**.

### Folder & Core Architecture
* `src/App.tsx` - App-wide routing definitions.
* `src/types/` - TypeScript interface and type declarations.
* `src/services/api.ts` - Axios client configuration. It intercept requests to automatically inject the Sanctum `auth_token` and intercepts response errors (redirecting to `/login` upon receiving `401 Unauthorized`).
* `src/store/authStore.ts` - Zustand store for persistent authentication state management.
* `src/hooks/usePermission.ts` - Permission check utility (`can`, `is`, `isAdmin`, `isBDM`, etc.).
* `src/layouts/` - Shell structures (`AdminLayout`, `BDMLayout`) containing headers, notifications dropdown, and navigation.

### Map & Rendering Components
Google Maps is loaded dynamically via `MapContainer.tsx`. Custom overlay layers manipulate geographic metadata directly:
* `PolygonViewer.tsx` - Renders boundary regions from GeoJSON coordinate coordinates and sets bounds.
* `MarkerLayer.tsx` - Plots point pins for specific coordinates.
* `PolygonDrawer.tsx` - Provides tools to draw new polygon areas.
* `TerritoryMapView.tsx` - Standard wrapper connecting local territories data with the map components.
