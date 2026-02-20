<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DoctorDashboardController;
/*
|--------------------------------------------------------------------------
| ClearMind API Routes
|--------------------------------------------------------------------------
|
| Public routes (no token required): register, login
| Protected routes (Bearer token required): logout, profile, change-password
|
*/

// ── Public Routes ──────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected Routes (Sanctum Auth Required) ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',          [AuthController::class, 'logout']);

    // User profile
    Route::get('/profile',          [AuthController::class, 'profile']);
    Route::put('/profile',          [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Doctor SIDE
    Route::get('/doctor/dashboard', [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/patients', [DoctorDashboardController::class, 'patientList']);
    Route::get('/doctor/status-counts',   [DoctorDashboardController::class, 'statusCounts']); 
    Route::get('/doctor/monthly-patients', [DoctorDashboardController::class, 'monthlyPatients']);

});