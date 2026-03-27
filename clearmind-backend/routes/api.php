<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DoctorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ClearMind API Routes
|--------------------------------------------------------------------------
|
| Auth:      POST /api/register  |  POST /api/login  |  POST /api/logout
| Admin:     /api/admin/*        (role: Admin)
| Doctor:    /api/doctor/*       (role: Doctor)
| Client:    /api/client/*       (role: Client)
|
*/

// ── Public routes ──────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Authenticated (any role) ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
});

// ── Admin routes ────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:Admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard',               [AdminController::class, 'dashboard']);

        // User management
        Route::get('/users',                   [AdminController::class, 'listUsers']);
        Route::post('/users',                  [AdminController::class, 'createUser']);
        Route::get('/users/{id}',              [AdminController::class, 'showUser']);
        Route::put('/users/{id}',              [AdminController::class, 'updateUser']);
        Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleStatus']);
        Route::delete('/users/{id}',           [AdminController::class, 'deleteUser']);
    });

// ── Doctor routes ───────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:Doctor'])
    ->prefix('doctor')
    ->group(function () {
        Route::get('/profile',             [DoctorController::class, 'profile']);
        Route::put('/profile',             [DoctorController::class, 'updateProfile']);
        Route::put('/change-password',     [DoctorController::class, 'changePassword']);

        // Clients visible to Doctor
        Route::get('/clients',             [DoctorController::class, 'listClients']);
        Route::get('/clients/{id}',        [DoctorController::class, 'showClient']);
    });

// ── Client routes ────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:Client'])
    ->prefix('client')
    ->group(function () {
        Route::get('/profile',         [ClientController::class, 'profile']);
        Route::put('/profile',         [ClientController::class, 'updateProfile']);
        Route::put('/change-password', [ClientController::class, 'changePassword']);
    });