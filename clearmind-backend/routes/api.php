<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;

// ── Authentication Routes ──
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ── Protected Routes ──
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ── Admin Routes ──
    Route::prefix('admin')->group(function () {
        // Get all patients
        Route::get('/patients', [AdminController::class, 'getPatients']);
        
        // Get paginated patients
        Route::get('/patients/paginated', [AdminController::class, 'getPaginatedPatients']);
        
        // Get patient statistics
        Route::get('/patients/stats', [AdminController::class, 'getPatientStats']);
        
        // Get single patient
        Route::get('/patients/{id}', [AdminController::class, 'getPatient']);
    });
});