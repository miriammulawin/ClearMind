<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DoctorDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminPatientController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminCreateAccountController;
use App\Http\Controllers\DoctorAppointmentController;
use App\Http\Controllers\AnnouncementController; // ← ADD THIS IMPORT

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
    Route::get('/doctor/dashboard',                [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/patients',                 [DoctorDashboardController::class, 'patients']);
    Route::get('/doctor/status-counts',            [DoctorDashboardController::class, 'statusCounts']);
    Route::get('/doctor/monthly-patients',         [DoctorDashboardController::class, 'monthlyPatients']);
    Route::get('/doctor/today-appointments-count', [DoctorDashboardController::class, 'todayAppointmentsCount']);
    Route::post('/doctor/setup',                   [DoctorDashboardController::class, 'setup']);
    Route::put('/doctor/profile',                  [DoctorDashboardController::class, 'updateProfile']);

    // Doctor Appointments
    Route::get('/doctor/appointments',               [DoctorAppointmentController::class, 'index']);
    Route::post('/doctor/appointments',              [DoctorAppointmentController::class, 'store']);
    Route::patch('/doctor/appointments/{id}/status', [DoctorAppointmentController::class, 'updateStatus']);
    Route::delete('/doctor/appointments/{id}',       [DoctorAppointmentController::class, 'destroy']);
    Route::get('/doctor/patients-list',              [DoctorAppointmentController::class, 'patientsList']);

    // ── ANNOUNCEMENT ROUTES (NEW) ──────────────────────────────────
    Route::prefix('announcements')->group(function () {
        // Get all announcements for authenticated doctor
        Route::get('/', [AnnouncementController::class, 'index'])->name('announcements.index');

        // Get clinic-wide announcements
        Route::get('/clinic', [AnnouncementController::class, 'getClinicAnnouncements'])->name('announcements.clinic');

        // Get doctor's own announcements
        Route::get('/doctor', [AnnouncementController::class, 'getDoctorAnnouncements'])->name('announcements.doctor');

        // Create announcement (POST BEFORE {id} routes to avoid conflicts)
        Route::post('/', [AnnouncementController::class, 'store'])->name('announcements.store');

        // Show single announcement
        Route::get('{id}', [AnnouncementController::class, 'show'])->name('announcements.show');

        // Update announcement
        Route::put('{id}', [AnnouncementController::class, 'update'])->name('announcements.update');

        // Delete announcement
        Route::delete('{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        // Toggle pin status
        Route::patch('{id}/toggle-pin', [AnnouncementController::class, 'togglePin'])->name('announcements.togglePin');
    });

    // Admin Dashboard
    Route::get('/admin/dashboard',        [AdminDashboardController::class, 'patients']);
    Route::get('/admin/status-counts',    [AdminDashboardController::class, 'statusCounts']);
    Route::get('/admin/monthly-patients', [AdminDashboardController::class, 'monthlyPatients']);
    Route::get('/admin/total-clients',    [AdminDashboardController::class, 'totalClients']);

    // Admin Patients — specific routes BEFORE {id}
    Route::get('/admin/patients/search',              [AdminPatientController::class, 'search']);
    Route::get('/admin/patients/consultations',       [AdminPatientController::class, 'consultations']);
    Route::get('/admin/patients',                     [AdminPatientController::class, 'index']);
    Route::get('/admin/patients/{id}',                [AdminPatientController::class, 'show']);
    Route::get('/admin/doctors',                      [AdminCreateAccountController::class, 'index']);
    Route::get('/admin/doctors/{id}',                 [AdminCreateAccountController::class, 'show']);
    Route::post('/admin/doctors',                     [AdminCreateAccountController::class, 'store']);
    Route::patch('/admin/doctors/{id}/toggle-status', [AdminCreateAccountController::class, 'toggleStatus']);
    Route::patch('/admin/patients/{id}/confirm',      [AdminPatientController::class, 'confirm']);
    Route::patch('/admin/patients/{id}/complete',     [AdminPatientController::class, 'complete']);

});