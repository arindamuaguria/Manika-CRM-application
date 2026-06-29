# Module: Geography Management

## Objective
Implement the 3-level geographic hierarchy (Division → Territory → Locality) with Google Maps polygon drawing, territory-BDM assignment, and point-in-polygon geo-matching.

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)

## Database Tables
- `divisions` — id, name, code, description, is_active, created_by, created_at, updated_at, deleted_at
- `territories` — id, division_id (FK), name, code, description, boundaries (JSON), is_active, created_by, created_at, updated_at, deleted_at
- `localities` — id, territory_id (FK), name, code, description, polygon (JSON), geo_data (JSON), is_active, created_by, created_at, updated_at, deleted_at
- `territory_bdm_assignments` — id, territory_id (FK), user_id (FK/BDM), assigned_at, assigned_by, is_active, created_at, updated_at

## Backend Tasks
### Division
- [ ] Create Division model with relationships (hasMany territories)
- [ ] Create `Modules/Geography/Division/Controllers/DivisionController.php`
- [ ] Create `DivisionService.php` with business logic
- [ ] Create `DivisionRepository.php` with database operations
- [ ] Create `StoreDivisionRequest.php` and `UpdateDivisionRequest.php` validations
- [ ] Implement CRUD operations with soft delete
- [ ] Implement division code uniqueness validation

### Territory
- [ ] Create Territory model with relationships (belongsTo division, hasMany localities)
- [ ] Create `Modules/Geography/Territory/Controllers/TerritoryController.php`
- [ ] Create `TerritoryService.php` with business logic
- [ ] Create `TerritoryRepository.php` with database operations
- [ ] Create `StoreTerritoryRequest.php` and `UpdateTerritoryRequest.php` validations
- [ ] Implement CRUD with soft delete
- [ ] Store territory boundaries as JSON (GeoJSON polygon)
- [ ] Implement territory-BDM assignment (1 territory : 1 BDM)
- [ ] Validate territory code uniqueness within division

### Locality
- [ ] Create Locality model with relationships (belongsTo territory)
- [ ] Create `Modules/Geography/Locality/Controllers/LocalityController.php`
- [ ] Create `LocalityService.php` with business logic
- [ ] Create `LocalityRepository.php` with database operations
- [ ] Create `StoreLocalityRequest.php` and `UpdateLocalityRequest.php` validations
- [ ] Implement CRUD with soft delete
- [ ] Store locality polygon as JSON (GeoJSON polygon)
- [ ] Implement point-in-polygon service using Google Geometry library

### Geo Service
- [ ] Create `Services/GeoService.php` — shared geo-matching logic
- [ ] Implement `identifyLocality(lat, lng)` — find locality for a geo point
- [ ] Implement `identifyTerritory(localityId)` — find territory for locality
- [ ] Implement `assignBDM(territoryId)` — find assigned BDM
- [ ] Implement `getFullGeoChain(lat, lng)` — returns locality → territory → division → BDM
- [ ] Handle unmapped geo points (outside all polygons)

## Frontend Tasks
### Division
- [ ] Create Division List page with data table (`src/pages/geography/DivisionList.tsx`)
- [ ] Create Division Create/Edit form (`src/pages/geography/DivisionForm.tsx`)
- [ ] Implement search, filter, pagination

### Territory
- [ ] Create Territory List page with data table (`src/pages/geography/TerritoryList.tsx`)
- [ ] Create Territory Create/Edit form (`src/pages/geography/TerritoryForm.tsx`)
- [ ] Integrate Google Maps for territory boundary drawing
- [ ] Implement BDM assignment dropdown (filtered to BDM role users)
- [ ] Implement territory map view with polygon overlay

### Locality
- [ ] Create Locality List page with data table (`src/pages/geography/LocalityList.tsx`)
- [ ] Create Locality Create/Edit form with map (`src/pages/geography/LocalityForm.tsx`)
- [ ] Integrate Google Maps for locality polygon drawing
- [ ] Implement polygon editing (add/remove/modify points)
- [ ] Show locality within territory boundary on map

### Map Components
- [ ] Create reusable `MapContainer` component
- [ ] Create `PolygonDrawer` component for drawing polygons
- [ ] Create `PolygonViewer` component for displaying polygons
- [ ] Create `MarkerLayer` component for displaying markers
- [ ] Create `TerritoryMapView` component for BDM territory overview

## API Tasks
- [ ] `GET /api/divisions` — List all divisions (paginated, searchable)
- [ ] `POST /api/divisions` — Create division (Admin only)
- [ ] `GET /api/divisions/{id}` — Get division details
- [ ] `PUT /api/divisions/{id}` — Update division (Admin only)
- [ ] `DELETE /api/divisions/{id}` — Soft delete division (Admin only)
- [ ] `GET /api/territories` — List territories (filterable by division)
- [ ] `POST /api/territories` — Create territory with boundary (Admin only)
- [ ] `GET /api/territories/{id}` — Get territory details with boundary
- [ ] `PUT /api/territories/{id}` — Update territory (Admin only)
- [ ] `DELETE /api/territories/{id}` — Soft delete territory (Admin only)
- [ ] `POST /api/territories/{id}/assign-bdm` — Assign BDM to territory (Admin only)
- [ ] `GET /api/localities` — List localities (filterable by territory)
- [ ] `POST /api/localities` — Create locality with polygon (Admin only)
- [ ] `GET /api/localities/{id}` — Get locality details with polygon
- [ ] `PUT /api/localities/{id}` — Update locality (Admin only)
- [ ] `DELETE /api/localities/{id}` — Soft delete locality (Admin only)
- [ ] `POST /api/geo/identify` — Identify locality/territory/BDM for a geo point

## Testing Tasks
- [ ] Test Division CRUD operations
- [ ] Test Territory CRUD with boundary JSON
- [ ] Test Locality CRUD with polygon JSON
- [ ] Test territory-BDM assignment (1:1 constraint)
- [ ] Test geo point-in-polygon identification
- [ ] Test unmapped geo point handling
- [ ] Test cascade relationships (division → territories → localities)
- [ ] Test unique code validations
- [ ] Test Admin-only access restrictions
- [ ] Test BDM can view only assigned territories
- [ ] Frontend: Test map polygon drawing
- [ ] Frontend: Test territory map visualization

## Acceptance Criteria
- [ ] Admin can CRUD divisions, territories, localities
- [ ] Territory boundaries can be drawn on Google Maps
- [ ] Locality polygons can be drawn on Google Maps
- [ ] BDM can be assigned to a territory (1:1)
- [ ] Geo point identifies correct locality → territory → BDM chain
- [ ] Unmapped points are flagged correctly
- [ ] BDM can view only assigned territories on map
- [ ] Soft delete works with cascading checks
- [ ] All geography changes logged in activity_log

## Status
Not Started
