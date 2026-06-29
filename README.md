# Manika CRM — Enterprise CRM & Partner Management Platform

Manika CRM is a premium, state-of-the-art Enterprise CRM and Partner Management platform built to orchestrate leads, deals, partners, and geographical territories. It features a robust 6-layer architecture with a React 19 frontend and a Laravel 12 backend.

---

## 🌟 Key Features

1. **Token-Based Authentication & RBAC**:
   - Secure authentication via **Laravel Sanctum** with login rate limiting.
   - Role-Based Access Control (RBAC) utilizing **Spatie Permission** supporting 4 roles: *Admin*, *BDM*, *Seller*, and *Service Person*.
   - Dynamic UI rendering based on granular permission checks.

2. **3-Level Geography Hierarchy**:
   - Structured division, territory, and locality management.
   - Interactive boundary drawing using **Google Maps Drawing Manager** with polygon editing capabilities.

3. **Intelligent Lead Lifecycle**:
   - Leads capture with duplicate detection based on mobile numbers.
   - **Point-in-Polygon Geo-Matching**: Using a high-performance Ray-Casting algorithm, leads are automatically matched to the correct locality, territory, division, and assigned BDM in real-time based on GPS coordinates.
   - Data scoping ensures Business Development Managers (BDMs) only see and manage their own leads.

4. **Deal Pipeline & Document Verification**:
   - Qualify leads and convert them into deals.
   - Document upload section for partnership agreements and ID proofs.
   - **Verification Workflow**: Admins verify or reject uploaded documents, automatically transitioning the deal's status. Once verified, Admins can approve or reject the deal.

5. **Automated Partner Onboarding**:
   - Automatically converts approved deals into partner profiles.
   - Spawns a new user account with default credentials and syncs service coverage localities for *Service Persons*.

6. **Role-Specific Dashboards**:
   - **Admin Dashboard**: Aggregates company KPIs (leads, conversion rates, active partners, total revenue, pipeline value) with recent activity timelines powered by **Spatie Activitylog**.
   - **BDM Dashboard**: Displays personal stats (leads, open deals, won deals, revenue) and assigned territories.
   - Features a custom, interactive **SVG Area Chart** illustrating monthly revenue trends.

7. **Event-Driven In-App Notifications**:
   - Dynamic notifications triggered by system events (e.g., lead assignment, document upload, verification updates, deal approval).
   - Modern header notification bell dropdown with unread count badge, mark-as-read actions, and deep-linking redirects.

8. **Analytical Reports & CSV Exports**:
   - Tabular preview grids for Leads, Deals, and Partners reports with filters (date range, status, territory).
   - Authenticated, memory-efficient streamed CSV exports using PHP's `php://output`.

---

## 🛠️ Technology Stack

### Frontend
- **Core**: React 19, Vite 8, TypeScript 6
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **HTTP Client**: Axios
- **Charts**: Recharts (Custom SVG)
- **Testing**: Vitest, React Testing Library

### Backend
- **Core**: Laravel 12, PHP 8.2+
- **Database**: MySQL 8 (MySQL/SQLite hybrid support for testing)
- **Packages**:
  - `laravel/sanctum` (API tokens)
  - `spatie/laravel-permission` (RBAC)
  - `spatie/laravel-activitylog` (Audit trails)
  - `spatie/laravel-medialibrary` (Media management)
- **Static Analysis**: PHPStan (Level 6)
- **Code Style**: Laravel Pint

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8.0

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Configure the environment:
   - Copy `.env.example` to `.env`.
   - Update database credentials (`DB_DATABASE=manika_crm`, `DB_USERNAME`, `DB_PASSWORD`).
4. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
5. Symlink storage:
   ```bash
   php artisan storage:link
   ```
6. Start the backend server:
   ```bash
   php artisan serve --port=8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Configure the environment:
   - Create a `.env` file in `frontend/`.
   - Add your Google Maps API Key:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
     ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Testing & Verification

Comprehensive checks are implemented across both projects to ensure 100% type-safety, clean formatting, and code correctness.

### Backend Tests (PHPUnit)
Run the backend test suite:
```bash
cd backend
php artisan test
```

### Backend Code Quality
- **Static Analysis (PHPStan Level 6)**:
  ```bash
  ./vendor/bin/phpstan analyse
  ```
- **Code Styling (Laravel Pint)**:
  ```bash
  ./vendor/bin/pint --test
  ```

### Frontend Tests (Vitest)
Run the frontend unit tests:
```bash
cd frontend
npx vitest run
```

### Frontend Code Quality
- **TypeScript Compiler**:
  ```bash
  npx tsc --noEmit
  ```
- **ESLint Linting**:
  ```bash
  npx eslint src
  ```
