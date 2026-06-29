# Module: Deal Management

## Objective
Implement the deal pipeline (Draft → Verification → Documentation → Approval → Won/Lost) with document management, verification workflow, and conversion from leads.

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)
- 03_Geography_Module (must be completed)
- 04_Lead_Module (must be completed)

## Database Tables
- `deals` — id, lead_id (FK), title, description, value, status (enum: draft, verification, documentation, approval, won, lost), assigned_bdm_id (FK→users), territory_id (FK), verification_status, approval_status, approved_by, approved_at, notes, created_by, created_at, updated_at, deleted_at
- `deal_documents` — id, deal_id (FK), document_type, file_path, file_name, file_size, mime_type, verification_status (enum: pending, verified, rejected), verified_by, verified_at, notes, uploaded_by, created_at, updated_at, deleted_at

## Backend Tasks
- [ ] Create Deal model with relationships (belongsTo lead, assignedBdm, territory; hasMany documents)
- [ ] Create DealDocument model with relationships (belongsTo deal)
- [ ] Create `Modules/CRM/Deal/Controllers/DealController.php`
- [ ] Create `Modules/CRM/Deal/Controllers/DealDocumentController.php`
- [ ] Create `DealService.php` with business logic
- [ ] Create `DealRepository.php` with database operations
- [ ] Create `StoreDealRequest.php` and `UpdateDealRequest.php` validations
- [ ] Implement deal creation from lead (auto-populate from lead data)
- [ ] Implement deal status pipeline with transition rules:
  - Draft → Verification (requires all mandatory docs uploaded)
  - Verification → Documentation (requires doc verification)
  - Documentation → Approval (requires all docs verified)
  - Approval → Won/Lost (requires admin approval)
- [ ] Implement document upload via Spatie Media Library
- [ ] Implement document verification workflow (Admin only)
- [ ] Implement deal approval workflow (Admin only)
- [ ] Fire `DealCreated` event on creation
- [ ] Create event listeners for notifications and audit
- [ ] Implement territory-scoped queries for BDM role
- [ ] Implement deal filtering and search

## Frontend Tasks
- [ ] Create Deal List page with pipeline view (`src/pages/crm/DealList.tsx`)
- [ ] Create Deal Create form (`src/pages/crm/DealForm.tsx`)
- [ ] Create Deal Detail page (`src/pages/crm/DealDetail.tsx`)
- [ ] Create Deal Pipeline/Kanban board view
- [ ] Create Document Upload component with drag-and-drop
- [ ] Create Document Verification UI (Admin)
- [ ] Create Deal Approval UI (Admin)
- [ ] Implement deal status badges and progress indicator
- [ ] Implement deal filtering (status, territory, date range)
- [ ] Implement deal search
- [ ] Create deal timeline/activity component

## API Tasks
- [ ] `GET /api/deals` — List deals (paginated, filterable, BDM-scoped)
- [ ] `POST /api/deals` — Create deal from lead
- [ ] `GET /api/deals/{id}` — Get deal details with documents
- [ ] `PUT /api/deals/{id}` — Update deal
- [ ] `PATCH /api/deals/{id}/status` — Transition deal status
- [ ] `POST /api/deals/{id}/approve` — Approve deal (Admin only)
- [ ] `POST /api/deals/{id}/documents` — Upload document
- [ ] `GET /api/deals/{id}/documents` — List deal documents
- [ ] `PATCH /api/deals/{id}/documents/{docId}/verify` — Verify document (Admin)
- [ ] `DELETE /api/deals/{id}/documents/{docId}` — Remove document

## Testing Tasks
- [ ] Test deal creation from lead
- [ ] Test deal status pipeline transitions (valid and invalid)
- [ ] Test document upload and storage
- [ ] Test document verification workflow
- [ ] Test deal approval workflow
- [ ] Test BDM can only see assigned deals
- [ ] Test Admin can manage all deals
- [ ] Test DealCreated event fires correctly
- [ ] Test deal filtering and search
- [ ] Frontend: Test pipeline/kanban view
- [ ] Frontend: Test document upload UI

## Acceptance Criteria
- [ ] Deals created from leads with auto-populated data
- [ ] Deal pipeline enforces status transition rules
- [ ] Documents can be uploaded, viewed, and verified
- [ ] Admin can verify documents and approve deals
- [ ] BDM sees only territory-scoped deals
- [ ] Deal events fire and trigger notifications + audit
- [ ] Deal pipeline view shows visual progress
- [ ] All deal changes logged in activity_log

## Status
Not Started
