<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Auth\Controllers\UserController;
use App\Modules\Auth\Controllers\RoleController;
use App\Modules\Auth\Controllers\PermissionController;

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
    Route::prefix('divisions')->group(function () {
        // Division CRUD routes
    });

    Route::prefix('territories')->group(function () {
        // Territory CRUD routes
    });

    Route::prefix('localities')->group(function () {
        // Locality CRUD routes
    });

    // CRM routes - Module 04 & 05
    Route::prefix('leads')->group(function () {
        // Lead CRUD routes
    });

    Route::prefix('deals')->group(function () {
        // Deal CRUD routes
    });

    // Partner routes - Module 06
    Route::prefix('partners')->group(function () {
        // Partner routes
    });

    // Dashboard routes - Module 07
    Route::prefix('dashboard')->group(function () {
        // Dashboard routes
    });

    // Notification routes - Module 08
    Route::prefix('notifications')->group(function () {
        // Notification routes
    });

    // Report routes - Module 09
    Route::prefix('reports')->group(function () {
        // Report routes
    });

    // Geo service routes - Module 03
    Route::prefix('geo')->group(function () {
        // Geo service routes
    });

    // User/Role/Permission management routes - Module 02 (Admin only)
    Route::middleware('role:Admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/assign-role', [UserController::class, 'assignRole']);
        Route::apiResource('roles', RoleController::class);
        Route::get('permissions', [PermissionController::class, 'index']);
    });
});
