# Deployment & DevOps Guide

## Environment
- PHP 8.2
- Laravel 12
- MySQL 8
- Node.js LTS

## Deployment Steps

1. Upload code.
2. Run composer install.
3. Configure .env.
4. Run migrations.
5. Build frontend assets.
6. Run storage:link.
7. Cache config and routes.

## Cron Jobs

* * * * * php artisan schedule:run

## Backup
- Daily DB Backup
- Weekly File Backup
