# Geo Dashboard - Existing Modules

Below is the list of already implemented modules and features in the Manika CRM project:

## 1. Authentication (Auth Module)
* **Backend**: Session-less token authentication via `Laravel Sanctum`. Features: Login, Logout, Forgot/Reset password endpoints.
* **Frontend**: Stateful user session maintained via Zustand (`authStore.ts`). Login page, Forgot Password page, and Reset Password page are fully functional.

## 2. Role-Based Access Control (RBAC Module)
* **Backend**: Powered by `spatie/laravel-permission`. Roles (`Admin`, `BDM`, `Seller`, `Service Person`) are seeded with distinct module-level permissions.
* **Frontend**: Dynamic UI rendering scoped to permissions via the custom `usePermission` hook. Route protection is enforced via `ProtectedRoute` and `RoleBasedRoute` wrappers.

## 3. Geography Module
* **Backend**: Implements a strict 3-level geographical hierarchy: `Division -> Territory -> Locality`.
* **Frontend**: Map integration using Google Maps drawing library to trace polygon boundaries for Localities and view outline boundaries for Territories.
* **Geo-matching Service**: Features point-in-polygon matching logic (`GeoService.php`) that parses a latitude/longitude point and returns the mapped locality, territory, division, and currently assigned BDM.

## 4. Lead Management (CRM Module)
* **Backend**: Standard RESTful resource APIs. Supports:
  * Duplicate contact mobile validation.
  * Geographical assignment: Coordinates automatically run through the `GeoService` to auto-assign the BDM managing that region.
  * Public Lead Form: Endpoint `POST /api/leads/public` allowing unauthenticated submissions.
* **Frontend**: Stacked card-based form layouts including dynamic coordinate pinning on a Google Map container.

## 5. Deal Management (CRM Module)
* **Backend**: Life cycle tracking (`draft`, `verification`, `documentation`, `approval`, `won`, `lost`). Includes document attachment and admin verification checks.
* **Frontend**: Deal details view, document uploading status, and admin approval workflows.

## 6. Partner Management
* **Backend**: Converts won and approved deals into a Partner Profile.
  * Public Partner Wizard: Dynamic onboarding form registering candidates under a `pending` status.
  * Email Integration: Fires `WelcomePartnerMail` attaching a custom `.ics` calendar invitation file.
  * Notifications: Automatically alerts Admin users upon receiving new partner registrations.
* **Frontend**: Public multi-step registration wizard (`PublicPartnerForm.tsx`) with Google Map location pinning, conditional role-based questionnaire (BDM / Seller / Service Person), and scheduling slot calendar.

## 7. Dashboard Module
* **Backend**: Role-based analytics:
  * **Admin**: Receives globally aggregated stats, pipeline revenue valuation, monthly won deal revenue charts, and audit activity history via Spatie activity logs.
  * **BDM**: Scoped stats for leads/deals/revenue, assigned territory locality counts, and monthly trends.
* **Frontend**: Custom dashboard with dynamic status cards, SVG trends, and activity timelines.

## 8. Notifications Module
* **Backend**: Proprietary notification storage table and `NotificationService` helper class.
* **Frontend**: Red-dot header bell icon with inline read actions and dedicated list page.

## 9. Reports Module
* **Backend**: Live CSV query streaming for Leads, Deals, and Partners.
* **Frontend**: Dynamic page with criteria filters, paginated grid previews, and streamed file download triggers.
