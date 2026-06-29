# Module: Authentication

## Objective
Implement secure token-based authentication using Laravel Sanctum with login, logout, password reset, and authenticated user profile retrieval.

## Dependencies
- 00_Project_Setup (must be completed)

## Database Tables
- `users` — id, name, email, password, phone, role_id, is_active, email_verified_at, remember_token, created_at, updated_at
- `personal_access_tokens` (Sanctum default)
- `password_reset_tokens` (Laravel default)

## Backend Tasks
- [ ] Create User model with fillable fields and relationships
- [ ] Create `Modules/Auth/Controllers/AuthController.php`
- [ ] Implement `login()` — validate credentials, issue Sanctum token
- [ ] Implement `logout()` — revoke current token
- [ ] Implement `me()` — return authenticated user with roles/permissions
- [ ] Implement `forgotPassword()` — send password reset email
- [ ] Implement `resetPassword()` — validate token and update password
- [ ] Create `Modules/Auth/Requests/LoginRequest.php` (validation)
- [ ] Create `Modules/Auth/Requests/ForgotPasswordRequest.php`
- [ ] Create `Modules/Auth/Requests/ResetPasswordRequest.php`
- [ ] Create `Modules/Auth/Services/AuthService.php` (business logic)
- [ ] Configure Sanctum token expiration
- [ ] Implement login attempt rate limiting
- [ ] Log authentication events via Spatie Activity Log

## Frontend Tasks
- [ ] Create Login page (`src/pages/auth/Login.tsx`)
- [ ] Create Forgot Password page (`src/pages/auth/ForgotPassword.tsx`)
- [ ] Create Reset Password page (`src/pages/auth/ResetPassword.tsx`)
- [ ] Create auth store with Zustand (`src/store/authStore.ts`)
- [ ] Implement Axios interceptor for token attachment
- [ ] Implement Axios interceptor for 401 redirect to login
- [ ] Create ProtectedRoute component for route guarding
- [ ] Create RoleBasedRoute component for role-specific access
- [ ] Implement auto-logout on token expiry
- [ ] Create auth service (`src/services/authService.ts`)
- [ ] Implement remember me functionality
- [ ] Design login page with premium UI (Inter font, #2563EB primary, glassmorphism card)

## API Tasks
- [ ] `POST /api/login` — Authenticate user, return token + user data
- [ ] `POST /api/logout` — Revoke current token (requires auth)
- [ ] `GET /api/me` — Get authenticated user profile (requires auth)
- [ ] `POST /api/forgot-password` — Send password reset link
- [ ] `POST /api/reset-password` — Reset password with token

## Testing Tasks
- [ ] Test successful login with valid credentials
- [ ] Test login failure with invalid credentials
- [ ] Test login rate limiting (lockout after N attempts)
- [ ] Test logout revokes token
- [ ] Test `/api/me` returns correct user data
- [ ] Test `/api/me` returns 401 without token
- [ ] Test password reset flow end-to-end
- [ ] Test token expiry behavior
- [ ] Frontend: Test login form validation
- [ ] Frontend: Test redirect after login based on role

## Acceptance Criteria
- [ ] Users can log in with email/password and receive a Sanctum token
- [ ] Authenticated requests include Bearer token in headers
- [ ] Unauthenticated requests to protected routes return 401
- [ ] Users can log out (token revoked)
- [ ] Password reset flow sends email and allows password change
- [ ] Login page renders with premium design
- [ ] Failed login attempts are rate-limited
- [ ] All auth events are logged in activity_log
- [ ] Role-based redirect works (Admin → Admin Dashboard, BDM → BDM Dashboard)

## Status
Completed
