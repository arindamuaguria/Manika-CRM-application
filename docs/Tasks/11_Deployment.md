# Module: Deployment

## Objective
Deploy the Manika CRM application to cPanel shared hosting with proper configuration, optimization, and monitoring setup.

## Dependencies
- All modules (00-10) must be completed
- All tests must pass

## Database Tables
- No new tables

## Backend Tasks
- [ ] Prepare production `.env` configuration
- [ ] Configure MySQL 8 production database
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Run `php artisan migrate --force` on production
- [ ] Run `php artisan db:seed --force` (roles, permissions, admin user)
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Run `php artisan storage:link`
- [ ] Configure cron job: `* * * * * php artisan schedule:run`
- [ ] Configure queue worker process
- [ ] Set up daily database backup (automated)
- [ ] Set up weekly file backup (automated)
- [ ] Configure SSL certificate (if available)
- [ ] Set up Apache `.htaccess` for Laravel
- [ ] Configure file permissions (storage, bootstrap/cache)

## Frontend Tasks
- [ ] Run `npm run build` for production bundle
- [ ] Verify production build has no errors
- [ ] Upload built assets to server
- [ ] Configure asset versioning/cache busting
- [ ] Verify all routes work with SPA fallback
- [ ] Test Google Maps API key restrictions for production domain

## API Tasks
- [ ] Verify all API endpoints accessible in production
- [ ] Verify CORS configured for production domain
- [ ] Verify Sanctum cookie/token domain settings
- [ ] Test API authentication in production
- [ ] Verify rate limiting works in production

## Testing Tasks
- [ ] Smoke test all critical flows in production:
  - Login/Logout
  - Lead creation with geo capture
  - Deal pipeline
  - Partner conversion
  - Dashboard loading
  - Report generation
- [ ] Verify email sending works in production (SMTP)
- [ ] Verify queue processing works in production
- [ ] Verify cron jobs run on schedule
- [ ] Performance test: API response times < 500ms
- [ ] Performance test: Page load times < 2s
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive layout on mobile devices

## Acceptance Criteria
- [ ] Application accessible at production URL
- [ ] All critical flows work end-to-end in production
- [ ] SSL certificate installed and HTTPS enforced
- [ ] Database backups running daily
- [ ] Queue worker processing jobs
- [ ] Cron jobs running on schedule
- [ ] Email notifications sending correctly
- [ ] Google Maps working with production API key
- [ ] Performance meets targets (API < 500ms, pages < 2s)
- [ ] No console errors in browser
- [ ] Admin user can log in and access all features

## Status
Not Started
