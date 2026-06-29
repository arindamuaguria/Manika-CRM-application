# Module: Testing & QA

## Objective
Comprehensive testing across all modules including unit tests, feature tests, API tests, frontend tests, and user acceptance testing (UAT).

## Dependencies
- All modules (00-09) must be completed

## Database Tables
- No new tables

## Backend Tasks
- [ ] Create test factories for all models:
  - UserFactory, DivisionFactory, TerritoryFactory, LocalityFactory
  - LeadFactory, DealFactory, DealDocumentFactory, PartnerFactory
  - NotificationFactory
- [ ] Create test seeders for consistent test data
- [ ] Write PHPUnit Feature Tests:
  - Auth: Login, Logout, Password Reset (min 10 tests)
  - RBAC: Role permissions, unauthorized access (min 15 tests)
  - Geography: Division/Territory/Locality CRUD (min 20 tests)
  - Lead: CRUD, geo assignment, duplicates, status transitions (min 20 tests)
  - Deal: CRUD, pipeline, documents, approval (min 20 tests)
  - Partner: Conversion, coverage, profile management (min 15 tests)
  - Dashboard: Stats aggregation, scoping (min 10 tests)
  - Notifications: Event triggers, delivery (min 10 tests)
  - Reports: Data accuracy, export (min 10 tests)
- [ ] Write API integration tests for all endpoints
- [ ] Test all authorization policies
- [ ] Test event-listener chains
- [ ] Test queue job processing
- [ ] Run PHPStan static analysis (level 6+)
- [ ] Run Laravel Pint formatting check
- [ ] Achieve minimum 80% code coverage

## Frontend Tasks
- [ ] Write Vitest unit tests for:
  - Auth store and service
  - CRM store and service
  - Permission hooks
  - Utility functions
- [ ] Write component tests for:
  - Login form
  - Lead form with geo capture
  - Data tables
  - Notification dropdown
  - Map components
- [ ] Run ESLint with zero errors
- [ ] Run TypeScript compiler with zero errors
- [ ] Test responsive layouts on multiple breakpoints

## API Tasks
- [ ] Validate all API endpoints return correct HTTP status codes
- [ ] Validate all API responses match expected JSON structure
- [ ] Test API rate limiting
- [ ] Test API authentication/authorization on all endpoints
- [ ] Create Postman/Insomnia collection for manual API testing

## Testing Tasks (UAT)
- [ ] UAT-01: Login with valid/invalid credentials
- [ ] UAT-02: Create lead with geo capture → verify BDM assignment
- [ ] UAT-03: Verify locality mapping (geo point → correct locality)
- [ ] UAT-04: Lead status lifecycle (New → Won/Lost)
- [ ] UAT-05: Deal pipeline (Draft → Approval → Won)
- [ ] UAT-06: Document upload and verification
- [ ] UAT-07: Partner conversion from approved deal
- [ ] UAT-08: BDM can only see assigned data
- [ ] UAT-09: Admin dashboard shows correct KPIs
- [ ] UAT-10: Reports generate and export correctly
- [ ] UAT-11: Notifications trigger on events
- [ ] UAT-12: Territory map displays correctly

## Acceptance Criteria
- [ ] All PHPUnit tests pass (130+ tests)
- [ ] All Vitest tests pass
- [ ] PHPStan level 6+ passes with zero errors
- [ ] ESLint passes with zero errors
- [ ] TypeScript compiles with zero errors
- [ ] Code coverage ≥ 80%
- [ ] All 12 UAT scenarios pass
- [ ] No critical or high-severity bugs open
- [ ] Performance: API responses < 500ms, page load < 2s

## Status
Not Started
