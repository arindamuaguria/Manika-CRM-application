# Database Migration Plan

## Order
1. users
2. roles/permissions
3. divisions
4. territories
5. localities
6. territory_bdm_assignments
7. leads
8. deals
9. deal_documents
10. partners
11. partner_service_coverage_localities
12. notifications
13. activity_logs

Run:
php artisan migrate
php artisan db:seed
