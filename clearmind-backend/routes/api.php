<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ConsultationRequestController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DoctorAccountController;

// ── Public Auth Routes ──
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected Routes ──
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Patient-facing: submit a consultation request
    Route::post('consultation-requests', [ConsultationRequestController::class, 'store']);


 
   
 



    // ── Admin Routes (with admin role check in controller) ──
    Route::prefix('admin')->group(function () {

        // Dashboard stats
        Route::get('dashboard/stats', [AdminController::class, 'stats']);
      

        // Patients
        Route::get('patients',           [AdminController::class, 'getPatients']);
        Route::get('patients/paginated', [AdminController::class, 'getPaginatedPatients']);
        Route::get('patients/stats',     [AdminController::class, 'getPatientStats']);
        Route::get('patients/{id}',      [AdminController::class, 'getPatient']);

        // Appointments CRUD
        Route::apiResource('appointments', AppointmentController::class);
         Route::apiResource('announcements', AnnouncementController::class);

        // Consultation Requests CRUD (admin manages all verbs except POST /store — handled above)
        Route::apiResource('consultation-requests', ConsultationRequestController::class)
             ->except(['store']);

          Route::post('doctors', [DoctorAccountController::class, 'store']);
          Route::get('doctors', [DoctorAccountController::class, 'index']);
    });
});