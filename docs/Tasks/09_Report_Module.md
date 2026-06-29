# Module: Reports

## Objective
Implement reporting module with filterable reports for leads, deals, partners, and territory coverage with export capabilities (CSV/Excel/PDF).

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)
- 03_Geography_Module (must be completed)
- 04_Lead_Module (must be completed)
- 05_Deal_Module (must be completed)
- 06_Partner_Module (must be completed)

## Database Tables
- No new tables (aggregates and queries existing tables)

## Backend Tasks
- [ ] Create `Modules/Report/Controllers/ReportController.php`
- [ ] Create `ReportService.php` with report generation logic
- [ ] Implement Lead Report:
  - Leads by status, territory, division, date range
  - Lead conversion rates
  - Unmapped leads count
- [ ] Implement Deal Report:
  - Deals by status, territory, date range
  - Deal pipeline velocity
  - Document verification stats
- [ ] Implement Partner Report:
  - Partners by type, territory, status
  - Coverage statistics
- [ ] Implement Territory Coverage Report:
  - Territory utilization
  - BDM performance per territory
  - Localities covered vs uncovered
- [ ] Implement export functionality:
  - CSV export
  - Excel export (using Laravel Excel / Maatwebsite)
  - PDF export (using DomPDF or Snappy)
- [ ] Implement date range filtering for all reports
- [ ] Implement territory-scoped reports for BDM role
- [ ] Optimize report queries with indexing and caching

## Frontend Tasks
- [ ] Create Reports page with report type selector (`src/pages/reports/Reports.tsx`)
- [ ] Create Lead Report view (`src/pages/reports/LeadReport.tsx`)
- [ ] Create Deal Report view (`src/pages/reports/DealReport.tsx`)
- [ ] Create Partner Report view (`src/pages/reports/PartnerReport.tsx`)
- [ ] Create Territory Report view (`src/pages/reports/TerritoryReport.tsx`)
- [ ] Implement report filter controls (date range, territory, status)
- [ ] Implement data tables for report results
- [ ] Implement chart visualizations for reports
- [ ] Implement export buttons (CSV, Excel, PDF)
- [ ] Implement print-friendly report layout

## API Tasks
- [ ] `GET /api/reports/leads` — Lead report (filterable)
- [ ] `GET /api/reports/deals` — Deal report (filterable)
- [ ] `GET /api/reports/partners` — Partner report (filterable)
- [ ] `GET /api/reports/territory-coverage` — Territory coverage report
- [ ] `GET /api/reports/export/{type}` — Export report (CSV/Excel/PDF)

## Testing Tasks
- [ ] Test lead report generates correct aggregations
- [ ] Test deal report with status filtering
- [ ] Test partner report with type filtering
- [ ] Test territory coverage calculations
- [ ] Test CSV export generates valid file
- [ ] Test Excel export generates valid file
- [ ] Test PDF export generates valid file
- [ ] Test BDM sees only territory-scoped reports
- [ ] Test date range filtering
- [ ] Frontend: Test report filters work correctly

## Acceptance Criteria
- [ ] All 4 report types generate accurate data
- [ ] Reports filterable by date range, territory, status
- [ ] Export to CSV, Excel, PDF works correctly
- [ ] BDM sees territory-scoped reports only
- [ ] Admin sees system-wide reports
- [ ] Report charts visualize data correctly
- [ ] Report generation performs well (< 3s)
- [ ] Print-friendly layout available

## Status
Completed
