# Module: RBAC (Role-Based Access Control)

## Objective
Implement role and permission management using Spatie Permission package with 4 roles (Admin, BDM, Seller, Service Person) and granular module-level permissions.

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)

## Database Tables
- `roles` (Spatie) — id, name, guard_name, created_at, updated_at
- `permissions` (Spatie) — id, name, guard_name, created_at, updated_at
- `model_has_roles` (Spatie pivot)
- `model_has_permissions` (Spatie pivot)
- `role_has_permissions` (Spatie pivot)

## Backend Tasks
- [ ] Define 4 roles: Admin, BDM, Seller, Service Person
- [ ] Define granular permissions per module:
  - Division: `divisions.view`, `divisions.create`, `divisions.update`, `divisions.delete`
  - Territory: `territories.view`, `territories.create`, `territories.update`, `territories.delete`
  - Locality: `localities.view`, `localities.create`, `localities.update`, `localities.delete`
  - Lead: `leads.view`, `leads.create`, `leads.update`, `leads.delete`, `leads.assign`
  - Deal: `deals.view`, `deals.create`, `deals.update`, `deals.delete`, `deals.approve`
  - Partner: `partners.view`, `partners.create`, `partners.update`, `partners.delete`, `partners.convert`
  - Dashboard: `dashboard.view`
  - Reports: `reports.view`, `reports.export`
  - Notifications: `notifications.view`, `notifications.manage`
  - Users: `users.view`, `users.create`, `users.update`, `users.delete`
- [ ] Create `RolePermissionSeeder` with role-permission mappings:
  - Admin: ALL permissions
  - BDM: View assigned territories/localities, manage assigned leads/deals, view partners in territory
  - Seller: View/update own profile
  - Service Person: View/update own profile
- [ ] Create authorization middleware for permission checks
- [ ] Create authorization policies for each model
- [ ] Create `Modules/Auth/Controllers/RoleController.php` (Admin only)
- [ ] Create `Modules/Auth/Controllers/PermissionController.php` (Admin only)
- [ ] Implement user role assignment (Admin only)
- [ ] Add `hasRole()` and `hasPermission()` checks to User model
- [ ] Create scope for BDM territory-based data filtering

## Frontend Tasks
- [ ] Create User Management page (Admin only) — `src/pages/admin/Users.tsx`
- [ ] Create Role Management page (Admin only) — `src/pages/admin/Roles.tsx`
- [ ] Implement permission-based UI element visibility
- [ ] Create `usePermission` hook for conditional rendering
- [ ] Create `useRole` hook for role checking
- [ ] Update navigation to show/hide items based on role
- [ ] Implement Admin sidebar navigation (Geography, CRM, Partners, Reports, Notifications)
- [ ] Implement BDM sidebar navigation (Leads, Deals, Partners, Territory Map)

## API Tasks
- [ ] `GET /api/roles` — List all roles (Admin only)
- [ ] `POST /api/roles` — Create role (Admin only)
- [ ] `PUT /api/roles/{id}` — Update role (Admin only)
- [ ] `DELETE /api/roles/{id}` — Delete role (Admin only)
- [ ] `GET /api/permissions` — List all permissions (Admin only)
- [ ] `GET /api/users` — List users with roles (Admin only)
- [ ] `POST /api/users` — Create user with role (Admin only)
- [ ] `PUT /api/users/{id}` — Update user/role (Admin only)
- [ ] `DELETE /api/users/{id}` — Deactivate user (Admin only)
- [ ] `POST /api/users/{id}/assign-role` — Assign role to user (Admin only)

## Testing Tasks
- [ ] Test Admin has full CRUD on all modules
- [ ] Test BDM can only access assigned territories
- [ ] Test BDM cannot access other BDMs' leads/deals
- [ ] Test Seller can only view/update own profile
- [ ] Test Service Person can only view/update own profile
- [ ] Test unauthorized access returns 403
- [ ] Test role assignment works correctly
- [ ] Test permission seeder creates all expected entries
- [ ] Frontend: Test navigation renders correctly per role
- [ ] Frontend: Test permission-gated UI elements

## Acceptance Criteria
- [ ] 4 roles seeded with correct permissions
- [ ] All 30+ permissions seeded and assigned
- [ ] Admin can manage users and roles
- [ ] BDM sees only territory-scoped data
- [ ] Seller/Service Person see only own profile
- [ ] Unauthorized API access returns 403 Forbidden
- [ ] Navigation adapts to user role
- [ ] UI elements show/hide based on permissions
- [ ] All RBAC changes logged in activity_log

## Status
Completed
