# Geo Dashboard - Gap Analysis

A comparison between the current codebase features and the required **Geo Dashboard** module reveals the following gaps and opportunities.

## 1. Codebase Availability Matrix

| Feature Requirement | Status | Available Component/Model | Missing Component/Model |
|---|---|---|---|
| **Google Maps Script Loader** | Available | `MapContainer.tsx` | None |
| **Polygon Rendering** | Available | `PolygonViewer.tsx` | None |
| **Marker Rendering** | Available | `MarkerLayer.tsx` | InfoWindow popup display |
| **KPI Statistics** | Partial | `DashboardController.php` (Admin / BDM stats) | Unified KPI counts endpoint for Geo Dashboard |
| **Filters Panel** | Missing | None | Sidebar filters checkbox panel with search autocompletes |
| **Unified Geo Query API** | Missing | None | Eager-loaded coordinates, polygon, and status details endpoint |
| **Role-based Scoping** | Available | Spatie roles, BDM assignment models | Filtering geographic scope for BDMs (only showing their territory) |
| **Customer Model** | Missing | None | No Customer table, model, or controller exists |
| **Orders Model** | Missing | None | No Orders table, model, or controller exists |
| **Visits Model** | Missing | None | No Visits table, model, or controller exists |
| **Attendance Model** | Missing | None | No Attendance table, model, or controller exists |

---

## 2. Reusable Components & Logic
* **`MapContainer.tsx`**: Used as the base map engine to render the interactive map area.
* **`PolygonViewer.tsx`**: Renders Division, Territory, and Locality polygons.
* **`MarkerLayer.tsx`**: Renders Seller and Service Person marker pins.
* **`GeoService.php`**: Reused to perform coordinate validations.
* **`usePermission`**: Enforces BDM data-scoping (e.g. BDMs can only view geo-metrics inside their assigned territories).

---

## 3. Risks, Dependencies & Performance Concerns

### Performance Risks (N+1 Query Danger)
Fetching hundreds of Territories, Localities, and Partners can trigger slow responses.
* *Mitigation*: The new Geo Dashboard endpoint must use Laravel eager loading:
  * `Territory::with(['division', 'activeAssignment.user'])`
  * `Partner::with(['locality', 'territory'])`

### Google Maps API Limitations
If the user loads many polygons and markers concurrently, map rendering performance might degrade.
* *Mitigation*: Apply map bounds filtering (only render markers inside the viewport) or group overlays efficiently.

### Security & Role Restrictions
BDMs should not see territories, sellers, or service persons outside their assigned jurisdictions.
* *Mitigation*: Inject authorization middleware and scope the database queries:
  ```php
  if (auth()->user()->hasRole('BDM')) {
      $query->whereHas('assignments', function ($q) {
          $q->where('user_id', auth()->id())->where('is_active', true);
      });
  }
  ```
