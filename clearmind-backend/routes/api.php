<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DoctorDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminPatientController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminCreateAccountController;

// ── Public Routes ──────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected Routes (Sanctum Auth Required) ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',          [AuthController::class, 'logout']);

    // User profile
    Route::get('/profile',          [ProfileController::class, 'show']);
    Route::get('/lookup',           [ProfileController::class, 'lookup']);
    Route::put('/profile',          [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Doctor SIDE
    Route::get('/doctor/dashboard',        [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/patients',         [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/status-counts',    [DoctorDashboardController::class, 'statusCounts']);
    Route::get('/doctor/monthly-patients', [DoctorDashboardController::class, 'monthlyPatients']);
    Route::post('/doctor/setup',           [DoctorDashboardController::class, 'setup']);
    Route::put('/doctor/profile',          [DoctorDashboardController::class, 'updateProfile']);

    // Admin Dashboard
    Route::get('/admin/dashboard',        [AdminDashboardController::class, 'patients']);
    Route::get('/admin/status-counts',    [AdminDashboardController::class, 'statusCounts']);
    Route::get('/admin/monthly-patients', [AdminDashboardController::class, 'monthlyPatients']);
    Route::get('/admin/total-clients',    [AdminDashboardController::class, 'totalClients']);

    // Admin Patients — specific routes BEFORE {id} ──────────────
    Route::get('/admin/patients/search',              [AdminPatientController::class, 'search']);      
    Route::get('/admin/patients/consultations',       [AdminPatientController::class, 'consultations']); 
    Route::get('/admin/patients',                     [AdminPatientController::class, 'index']);       
    Route::get('/admin/patients/{id}',                [AdminPatientController::class, 'show']);     
    Route::get('/admin/doctors',              [AdminCreateAccountController::class, 'index']);
    Route::get('/admin/doctors/{id}',         [AdminCreateAccountController::class, 'show']);
    Route::post('/admin/doctors',             [AdminCreateAccountController::class, 'store']);  
    Route::patch('/admin/doctors/{id}/toggle-status', [AdminCreateAccountController::class, 'toggleStatus']);
    Route::patch('/admin/patients/{id}/confirm',      [AdminPatientController::class, 'confirm']);
    Route::patch('/admin/patients/{id}/complete',     [AdminPatientController::class, 'complete']);

    

});