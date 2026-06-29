<?php

use Illuminate\Support\Facades\Route;

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
    // Auth routes will be added in Module 01
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    // Route::get('/me', ...); // Module 01

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

    // User/Role management routes - Module 02
    Route::prefix('users')->group(function () {
        // User management routes (Admin only)
    });

    Route::prefix('roles')->group(function () {
        // Role management routes (Admin only)
    });

    Route::prefix('permissions')->group(function () {
        // Permission routes (Admin only)
    });
});
