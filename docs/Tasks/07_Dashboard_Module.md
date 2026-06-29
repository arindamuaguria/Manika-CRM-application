# Module: Dashboard

## Objective
Implement role-specific dashboards with KPI widgets, Google Maps territory overview, and real-time statistics for Admin and BDM users.

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)
- 03_Geography_Module (must be completed)
- 04_Lead_Module (must be completed)
- 05_Deal_Module (must be completed)
- 06_Partner_Module (must be completed)

## Database Tables
- No new tables (aggregates data from existing tables)

## Backend Tasks
- [ ] Create `Modules/Dashboard/Controllers/DashboardController.php`
- [ ] Create `DashboardService.php` with aggregation logic
- [ ] Implement Admin dashboard stats:
  - Total leads (by status breakdown)
  - Total deals (by status breakdown)
  - Total partners (by type breakdown)
  - Total divisions, territories, localities
  - Conversion rates (lead→deal, deal→partner)
  - Recent activity feed
- [ ] Implement BDM dashboard stats:
  - Assigned leads (by status)
  - Assigned deals (by status)
  - Partners in territory
  - Territory coverage percentage
- [ ] Implement date range filtering for stats
- [ ] Implement territory-scoped aggregation for BDM
- [ ] Create map data endpoint (territories, localities, partner markers)
- [ ] Optimize queries with caching for dashboard performance

## Frontend Tasks
- [ ] Create Admin Dashboard page (`src/pages/dashboard/AdminDashboard.tsx`)
- [ ] Create BDM Dashboard page (`src/pages/dashboard/BDMDashboard.tsx`)
- [ ] Create KPI Card widget component
- [ ] Create Stats Chart components (bar, pie, line charts)
- [ ] Create Recent Activity Feed component
- [ ] Create Territory Map Overview component (Google Maps with all layers)
- [ ] Implement date range picker for dashboard filtering
- [ ] Create Conversion Funnel visualization
- [ ] Implement responsive dashboard grid layout
- [ ] Add micro-animations for stat counter updates
- [ ] Implement dashboard auto-refresh

## API Tasks
- [ ] `GET /api/dashboard/admin` — Admin dashboard stats
- [ ] `GET /api/dashboard/bdm` — BDM dashboard stats (territory-scoped)
- [ ] `GET /api/dashboard/map-data` — Map data with territories, localities, markers
- [ ] `GET /api/dashboard/activity-feed` — Recent activity feed
- [ ] `GET /api/dashboard/conversion-stats` — Lead/Deal conversion statistics

## Testing Tasks
- [ ] Test Admin dashboard returns correct aggregate stats
- [ ] Test BDM dashboard returns only territory-scoped stats
- [ ] Test date range filtering works correctly
- [ ] Test map data endpoint returns correct GeoJSON
- [ ] Test conversion rate calculations
- [ ] Test dashboard caching behavior
- [ ] Frontend: Test KPI widgets render with correct data
- [ ] Frontend: Test map view with multiple layers

## Acceptance Criteria
- [ ] Admin dashboard shows system-wide KPIs
- [ ] BDM dashboard shows territory-scoped KPIs
- [ ] Google Maps displays territories, localities, partner markers
- [ ] KPI widgets show accurate counts and percentages
- [ ] Conversion funnel visualization works
- [ ] Date range filtering updates all widgets
- [ ] Dashboard performs well (< 2s load time)
- [ ] Activity feed shows recent system events
- [ ] Dashboard is responsive on all screen sizes

## Status
Completed
