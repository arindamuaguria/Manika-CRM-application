# Module: Lead Management

## Objective
Implement the full lead lifecycle (New → Assigned → Qualified → Deal Created → Won/Lost) with mandatory geo-capture, automatic BDM assignment, duplicate detection, and territory-scoped access.

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)
- 03_Geography_Module (must be completed)

## Database Tables
- `leads` — id, title, contact_name, contact_email, contact_mobile, address, latitude, longitude, locality_id (FK), territory_id (FK), division_id (FK), assigned_bdm_id (FK→users), source, status (enum: new, assigned, qualified, deal_created, won, lost), priority (enum: low, medium, high), notes, is_mapped, created_by, created_at, updated_at, deleted_at

## Backend Tasks
- [ ] Create Lead model with relationships (belongsTo locality, territory, division, assignedBdm)
- [ ] Create `Modules/CRM/Lead/Controllers/LeadController.php`
- [ ] Create `LeadService.php` with business logic
- [ ] Create `LeadRepository.php` with database operations
- [ ] Create `StoreLeadRequest.php` validation:
  - contact_mobile: required, unique (duplicate check)
  - contact_email: required, unique (duplicate check)
  - latitude/longitude: required (mandatory geo capture)
- [ ] Create `UpdateLeadRequest.php` validation
- [ ] Implement lead creation flow:
  1. Capture geo coordinates
  2. Call GeoService to identify locality → territory → BDM
  3. Auto-assign BDM based on territory
  4. Mark as unmapped if outside all polygons
  5. Set initial status to 'new', then 'assigned' after BDM assignment
- [ ] Implement duplicate detection (mobile + email)
- [ ] Implement lead status transitions with validation
- [ ] Implement territory-scoped queries for BDM role
- [ ] Fire `LeadCreated` event on creation
- [ ] Fire `LeadAssigned` event on BDM assignment
- [ ] Create `LeadCreated` event class
- [ ] Create `LeadAssigned` event class
- [ ] Create listeners: `SendLeadNotification`, `LogLeadActivity`
- [ ] Implement lead filtering (by status, territory, division, date range)
- [ ] Implement lead search (by name, mobile, email)
- [ ] Implement bulk lead operations (bulk assign, bulk status update)

## Frontend Tasks
- [ ] Create Lead List page with data table (`src/pages/crm/LeadList.tsx`)
- [ ] Create Lead Create form with geo capture (`src/pages/crm/LeadForm.tsx`)
- [ ] Create Lead Detail/View page (`src/pages/crm/LeadDetail.tsx`)
- [ ] Integrate Google Maps for geo-point capture on lead form
- [ ] Show geo-point on map in lead detail view
- [ ] Implement lead status badges with color coding
- [ ] Implement lead filtering UI (status, territory, division, date)
- [ ] Implement lead search bar
- [ ] Implement lead status transition buttons with confirmation
- [ ] Show unmapped indicator for leads outside polygons
- [ ] Implement pagination and sorting
- [ ] Create lead timeline/activity history component
- [ ] Create CRM store with Zustand (`src/store/crmStore.ts`)

## API Tasks
- [ ] `GET /api/leads` — List leads (paginated, filterable, BDM-scoped)
- [ ] `POST /api/leads` — Create lead with geo capture
- [ ] `GET /api/leads/{id}` — Get lead details
- [ ] `PUT /api/leads/{id}` — Update lead
- [ ] `PATCH /api/leads/{id}/status` — Update lead status
- [ ] `POST /api/leads/{id}/assign` — Manually assign/reassign BDM
- [ ] `GET /api/leads/duplicates` — Check for duplicate leads
- [ ] `POST /api/leads/bulk-assign` — Bulk assign leads
- [ ] `GET /api/leads/export` — Export leads to CSV/Excel

## Testing Tasks
- [ ] Test lead creation with valid geo coordinates
- [ ] Test auto BDM assignment via geo service
- [ ] Test duplicate detection (same mobile/email)
- [ ] Test unmapped lead handling
- [ ] Test lead status transitions (valid and invalid)
- [ ] Test BDM can only see assigned leads
- [ ] Test Admin can see all leads
- [ ] Test lead search and filtering
- [ ] Test LeadCreated event fires correctly
- [ ] Test LeadAssigned event fires correctly
- [ ] Frontend: Test geo capture on lead form
- [ ] Frontend: Test lead list filtering and pagination

## Acceptance Criteria
- [ ] Leads created with mandatory geo capture
- [ ] BDM auto-assigned based on geo → locality → territory chain
- [ ] Duplicate leads rejected (mobile/email uniqueness)
- [ ] Unmapped leads flagged when outside all polygons
- [ ] Lead lifecycle status transitions enforced
- [ ] BDM sees only territory-scoped leads
- [ ] Admin sees all leads
- [ ] Lead events fire and trigger notifications + audit logs
- [ ] Lead list supports search, filter, pagination, sort
- [ ] All lead changes logged in activity_log

## Status
Completed
