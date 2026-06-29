# Module: Partner Management

## Objective
Implement partner conversion from deals, partner profile management, service coverage locality assignment, and partner type differentiation (BDM, Seller, Service Person).

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)
- 03_Geography_Module (must be completed)
- 04_Lead_Module (must be completed)
- 05_Deal_Module (must be completed)

## Database Tables
- `partners` — id, user_id (FK), deal_id (FK), partner_type (enum: bdm, seller, service_person), business_name, business_address, latitude, longitude, locality_id (FK), territory_id (FK), contact_name, contact_email, contact_mobile, status (enum: active, inactive, suspended), onboarded_at, created_by, created_at, updated_at, deleted_at
- `partner_service_coverage_localities` — id, partner_id (FK), locality_id (FK), is_active, created_at, updated_at (N:N pivot)

## Backend Tasks
- [ ] Create Partner model with relationships (belongsTo user, deal, locality, territory; belongsToMany localities via coverage)
- [ ] Create `Modules/Partner/Controllers/PartnerController.php`
- [ ] Create `PartnerService.php` with business logic
- [ ] Create `PartnerRepository.php` with database operations
- [ ] Create `StorePartnerRequest.php` and `UpdatePartnerRequest.php` validations
- [ ] Implement partner conversion from approved deal:
  1. Create user account for partner
  2. Assign role (Seller or Service Person)
  3. Create partner record linked to deal
  4. Set partner geo location
- [ ] Fire `PartnerConverted` event
- [ ] Create event listeners for notifications and audit
- [ ] Implement service coverage locality assignment (N:N)
- [ ] Implement partner listing with filters (type, territory, status)
- [ ] Implement partner search
- [ ] Implement partner profile management (partner can update own profile)
- [ ] Implement partner activation/deactivation (Admin only)
- [ ] Implement territory-scoped partner queries for BDM role

## Frontend Tasks
- [ ] Create Partner List page (`src/pages/partner/PartnerList.tsx`)
- [ ] Create Partner Detail page (`src/pages/partner/PartnerDetail.tsx`)
- [ ] Create Partner Conversion UI (from deal) (`src/pages/partner/PartnerConvert.tsx`)
- [ ] Create Partner Profile page (for Seller/Service Person roles) (`src/pages/partner/PartnerProfile.tsx`)
- [ ] Create Service Coverage Map (assign localities on map)
- [ ] Create Partner Map View (show partners as markers on Google Maps)
- [ ] Implement partner type badges
- [ ] Implement partner filtering (type, territory, status)
- [ ] Implement partner search
- [ ] Create partner store with Zustand

## API Tasks
- [ ] `GET /api/partners` — List partners (paginated, filterable, BDM-scoped)
- [ ] `POST /api/partners/convert` — Convert approved deal to partner
- [ ] `GET /api/partners/{id}` — Get partner details
- [ ] `PUT /api/partners/{id}` — Update partner profile
- [ ] `PATCH /api/partners/{id}/status` — Activate/deactivate partner
- [ ] `GET /api/partners/{id}/coverage` — Get service coverage localities
- [ ] `POST /api/partners/{id}/coverage` — Assign coverage localities
- [ ] `DELETE /api/partners/{id}/coverage/{localityId}` — Remove coverage locality
- [ ] `GET /api/partners/map` — Get partner markers for map view

## Testing Tasks
- [ ] Test partner conversion from approved deal
- [ ] Test user account creation during conversion
- [ ] Test role assignment (Seller/Service Person)
- [ ] Test service coverage locality assignment
- [ ] Test partner profile update (own profile only)
- [ ] Test Admin can manage all partners
- [ ] Test BDM can see only territory-scoped partners
- [ ] Test PartnerConverted event fires correctly
- [ ] Test partner filtering and search
- [ ] Frontend: Test partner map view
- [ ] Frontend: Test coverage map assignment

## Acceptance Criteria
- [ ] Approved deals can be converted to partners
- [ ] Partner user account created with correct role
- [ ] Partner types (BDM, Seller, Service Person) correctly assigned
- [ ] Service coverage localities assignable via map
- [ ] Partners visible as markers on Google Maps
- [ ] Seller/Service Person can update own profile only
- [ ] BDM sees only territory-scoped partners
- [ ] Admin can manage all partners
- [ ] Partner conversion event fires and triggers notifications + audit
- [ ] All partner changes logged in activity_log

## Status
Completed
