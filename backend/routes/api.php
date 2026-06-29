<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Auth\Controllers\UserController;
use App\Modules\Auth\Controllers\RoleController;
use App\Modules\Auth\Controllers\PermissionController;
use App\Modules\Geography\Division\Controllers\DivisionController;
use App\Modules\Geography\Territory\Controllers\TerritoryController;
use App\Modules\Geography\Locality\Controllers\LocalityController;
use App\Modules\Geography\Locality\Controllers\GeoController;
use App\Modules\CRM\Lead\Controllers\LeadController;
use App\Modules\CRM\Deal\Controllers\DealController;
use App\Modules\Partner\Controllers\PartnerController;
use App\Modules\Dashboard\Controllers\DashboardController;
use App\Modules\Notification\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Manika CRM API Routes - Phase 1 MVP
| All routes are prefixed with /api
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Geography routes - Module 03
    Route::apiResource('divisions', DivisionController::class);
    Route::apiResource('territories', TerritoryController::class);
    Route::post('territories/{id}/assign-bdm', [TerritoryController::class, 'assignBdm']);
    Route::apiResource('localities', LocalityController::class);
    Route::post('geo/identify', [GeoController::class, 'identify']);

    // CRM routes - Module 04 & 05
    Route::apiResource('leads', LeadController::class);
    
    Route::apiResource('deals', DealController::class);
    Route::post('deals/{id}/documents', [DealController::class, 'uploadDocument']);
    Route::post('deals/{id}/documents/{docId}/verify', [DealController::class, 'verifyDocument']);
    Route::post('deals/{id}/approve', [DealController::class, 'approve']);

    // Partner routes - Module 06
    Route::apiResource('partners', PartnerController::class);
    Route::post('partners/{id}/coverage', [PartnerController::class, 'syncCoverage']);

    // Dashboard routes - Module 07
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Notification routes - Module 08
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Report routes - Module 09
    Route::prefix('reports')->group(function () {
        // Report routes
    });

    // User/Role/Permission management routes - Module 02 (Admin only)
    Route::middleware('role:Admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/assign-role', [UserController::class, 'assignRole']);
        Route::apiResource('roles', RoleController::class);
        Route::get('permissions', [PermissionController::class, 'index']);
    });
});
