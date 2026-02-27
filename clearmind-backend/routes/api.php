<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DoctorDashboardController;
use App\Http\Controllers\AdminDashboardController;  // ← add this
use App\Http\Controllers\ProfileController;

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
    Route::get('/doctor/dashboard',        [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/patients',         [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/status-counts',    [DoctorDashboardController::class, 'statusCounts']);
    Route::get('/doctor/monthly-patients', [DoctorDashboardController::class, 'monthlyPatients']);
    Route::post('/doctor/setup',           [DoctorDashboardController::class, 'setup']);
    Route::put('/doctor/profile',          [DoctorDashboardController::class, 'updateProfile']);
    Route::get('/profile',                 [ProfileController::class, 'show']);

    // Admin SIDE  
    Route::get('/admin/dashboard',         [AdminDashboardController::class, 'patients']);
    Route::get('/admin/status-counts',     [AdminDashboardController::class, 'statusCounts']);
    Route::get('/admin/monthly-patients',  [AdminDashboardController::class, 'monthlyPatients']);
    Route::get('/admin/total-clients', [AdminDashboardController::class, 'totalClients']);

});