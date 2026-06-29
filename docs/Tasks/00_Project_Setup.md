# Module: Project Setup

## Objective
Initialize the full-stack development environment with Laravel 12 backend, React 19 frontend, MySQL 8 database, and all required tooling, packages, and configurations.

## Dependencies
- None (this is the foundation module)

## Database Tables
- `users` (Laravel default + customizations)
- `jobs` (Laravel queue)
- `failed_jobs` (Laravel queue)
- Spatie permission tables (`roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`)
- Spatie activity log tables (`activity_log`)

## Backend Tasks
- [ ] Initialize Laravel 12 project
- [ ] Configure `.env` for MySQL 8 connection
- [ ] Install and configure Laravel Sanctum (API token auth)
- [ ] Install and configure Spatie Permission package
- [ ] Install and configure Spatie Activity Log package
- [ ] Install and configure Spatie Media Library
- [ ] Install Laravel Pint (code formatter)
- [ ] Install PHPStan (static analysis)
- [ ] Configure CORS for React SPA
- [ ] Set up modular folder structure: `app/Modules/{Auth,Geography,CRM,Partner,Dashboard,Notification,Report}`
- [ ] Set up shared directories: `app/Services`, `app/Repositories`, `app/Events`, `app/Listeners`
- [ ] Configure Laravel Queue with database driver
- [ ] Configure Laravel File Cache
- [ ] Set up API route structure with versioning prefix
- [ ] Create base Controller, Service, Repository abstract classes
- [ ] Configure PHPUnit for feature and API tests
- [ ] Set up database seeder structure

## Frontend Tasks
- [ ] Initialize React 19 project with Vite and TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui component library
- [ ] Install and configure Zustand (state management)
- [ ] Install and configure Axios (HTTP client)
- [ ] Install and configure React Router DOM
- [ ] Set up frontend folder structure: `src/{app,layouts,pages,components,features,services,hooks,store,routes,types,utils}`
- [ ] Set up feature directories: `src/features/{auth,geography,crm,partner,dashboard}`
- [ ] Configure ESLint, Prettier, TypeScript strict mode
- [ ] Set up Vitest for frontend testing
- [ ] Implement design system tokens (colors: Primary #2563EB, Success #16A34A, Warning #D97706, Danger #DC2626)
- [ ] Configure Inter font family (headings: 32/24/20px, body: 14/16px)
- [ ] Create base layout components (AdminLayout, BDMLayout)
- [ ] Set up Axios interceptor for Sanctum token auth

## API Tasks
- [ ] Define API route groups (auth, geography, crm, partners, dashboard, reports, notifications)
- [ ] Configure Sanctum middleware for API protection
- [ ] Set up API response helper (standardized JSON responses)
- [ ] Configure rate limiting

## Testing Tasks
- [ ] Verify Laravel installation and route access
- [ ] Verify React dev server startup
- [ ] Verify database connection and migrations
- [ ] Verify Sanctum token generation
- [ ] Verify CORS configuration (React ↔ Laravel)
- [ ] Verify Spatie Permission seeder runs correctly
- [ ] Run PHPStan analysis (no errors)
- [ ] Run ESLint (no errors)

## Acceptance Criteria
- [ ] Laravel backend serves API at `/api/*`
- [ ] React frontend serves SPA at root URL
- [ ] MySQL database connected with all migrations run
- [ ] Sanctum authentication flow works end-to-end
- [ ] Spatie roles/permissions tables exist and seeded
- [ ] Modular folder structure created for all modules
- [ ] Frontend design system tokens applied
- [ ] All linters and formatters pass with zero errors
- [ ] Queue worker processes jobs from database
- [ ] PHPUnit and Vitest test suites run successfully

## Status
Not Started
