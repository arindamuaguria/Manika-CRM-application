# Geo Dashboard - Implementation Plan

## 1. Backend API Layer

### New Endpoint: `GET /api/geo-dashboard`
* **Route Path**: `/api/geo-dashboard` (registered in `routes/api.php`)
* **Controller**: `App\Modules\Dashboard\Controllers\GeoDashboardController@index`
* **Middleware**: `auth:sanctum`, `role_or_permission:Admin|dashboard.view`
* **Query Parameters**:
  * `search`: (string) filters by name or code.
  * `territory_id`: (integer) narrows down localities and partners.
  * `locality_id`: (integer) narrows down partners.
  * `status`: (string) partner status filter (`pending`/`active`/`inactive`/`suspended`).
  * `layers[]`: (array) specifies which datasets to return (`territory`, `locality`, `bdm`, `seller`, `service_person`).

### Controller Implementation & Data Optimization
The controller will query each layer using eager loading to prevent N+1 query execution:
* **Territories**: `Territory::with(['division', 'activeAssignment.user'])`
* **Localities**: `Locality::with(['territory'])`
* **BDMs**: `User::role('BDM')->with(['assignments.territory'])`
* **Sellers**: `Partner::where('partner_type', 'seller')->with(['locality', 'territory'])`
* **Service Persons**: `Partner::where('partner_type', 'service_person')->with(['locality', 'territory', 'coverageLocalities'])`

### Data Scoping for BDM Role
If the authenticated user is a BDM, scope the data automatically:
* Can only see their assigned territories.
* Localities, Sellers, and Service Persons are filtered to fall within those assigned territories.

---

## 2. Frontend Map Integration & Layout

### Component Structure
* **Page Wrapper**: `frontend/src/pages/dashboard/GeoDashboard.tsx`
* **Layout Layout**: 
  * Left sidebar containing collapsible filter checklist toggles, autocomplete input dropdowns, and search controls.
  * Right canvas rendering statistics KPI metric cards (horizontal flex row) and the Google Map.
* **Reusable Google Maps Components**:
  * Reuse `MapContainer` as the map wrapper.
  * Nest `PolygonViewer` to render territory boundaries (outline) and locality polygons.
  * Nest a customized `MarkerLayer` to show Seller markers (e.g. orange pin icon) and Service Person markers (e.g. teal pin icon).

### State Management
* Page-level state manages:
  * Selected filter options.
  * Autocomplete search results.
  * Hovered/active marker or polygon ID.
  * Active InfoWindow metadata to show when a polygon or marker pin is clicked.
