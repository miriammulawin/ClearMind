<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorProfileController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DoctorAccountController;
use App\Http\Controllers\ClinicController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AssessmentPurposeController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;

// ── Public Auth Routes ────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password',  [ResetPasswordController::class, 'reset']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

// ── Protected Routes ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Shared lookup lists (Client + Admin both need these) ──────
    Route::get('patients/list', [PatientController::class, 'all']);     // dropdown for appointment modal
    Route::get('doctors/list',  [DoctorAccountController::class, 'index']); // dropdown for doctor assignment

    // ── Client: book & view own appointments ─────────────────────
    Route::post  ('appointments',      [AppointmentController::class, 'store']);
    Route::get   ('appointments',      [AppointmentController::class, 'index']);
    Route::get   ('appointments/{id}', [AppointmentController::class, 'show']);
    Route::delete('appointments/{id}', [AppointmentController::class, 'destroy']);


    Route::get('/doctor/profile',          [DoctorProfileController::class, 'show']);
    Route::post('/doctor/profile/setup',   [DoctorProfileController::class, 'setup']);
    Route::delete('/doctor/profile/files', [DoctorProfileController::class, 'deleteFile']);
     Route::put('/doctor/change-password',  [DoctorController::class, 'changePassword']);

     
    // ── Admin Routes ──────────────────────────────────────────────
    Route::prefix('admin')->group(function () {

        // Dashboard
        Route::get('dashboard/stats', [AdminController::class, 'stats']);

        // ── Patients ─────────────────────────────────────────────
        // NOTE: specific sub-routes MUST come before {id} wildcard
        Route::get ('patients/all',               [PatientController::class, 'all']);           // full list for dropdowns
        Route::get ('patients/stats',             [AdminController::class,   'getPatientStats']);
        Route::get ('patients/paginated',         [AdminController::class,   'getPaginatedPatients']);
        Route::get ('patients',                   [PatientController::class, 'index']);          // paginated + search
        Route::post('patients',                   [PatientController::class, 'store']);          // manually create patient
        Route::get ('patients/{id}',              [PatientController::class, 'show']);           // detail (replaces AdminController::getPatient)
        Route::put ('patients/{id}',              [PatientController::class, 'update']);         // edit patient
        Route::delete('patients/{id}',            [PatientController::class, 'destroy']);        // soft deactivate
        Route::get ('patients/{id}/appointments', [PatientController::class, 'appointments']);   // appointment history

        // ── Appointments ─────────────────────────────────────────
        Route::get   ('appointments',      [AppointmentController::class, 'index']);
        Route::post  ('appointments',      [AppointmentController::class, 'store']);
        Route::get   ('appointments/{id}', [AppointmentController::class, 'show']);
        Route::put   ('appointments/{id}', [AppointmentController::class, 'update']);
        Route::delete('appointments/{id}', [AppointmentController::class, 'destroy']);

        // ── Announcements ─────────────────────────────────────────
        Route::apiResource('announcements', AnnouncementController::class);

      

        // ── Doctors ───────────────────────────────────────────────
        Route::get ('doctors', [DoctorAccountController::class, 'index']);
        Route::post('doctors', [DoctorAccountController::class, 'store']);

        // ── Clinics ───────────────────────────────────────────────
        Route::get   ('clinics',      [ClinicController::class, 'index']);
        Route::post  ('clinics',      [ClinicController::class, 'store']);
        Route::get   ('clinics/{id}', [ClinicController::class, 'show']);
        Route::match (['post', 'put'], 'clinics/{id}', [ClinicController::class, 'update']); 
        Route::delete('clinics/{id}', [ClinicController::class, 'destroy']);
 // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    // Assessment Purposes
    Route::post('/assessment-purposes', [AssessmentPurposeController::class, 'store']);
    Route::put('/assessment-purposes/{id}', [AssessmentPurposeController::class, 'update']);
    Route::delete('/assessment-purposes/{id}', [AssessmentPurposeController::class, 'destroy']);
    });
});