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
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\DoctorPatientController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AssessmentRequirementController;

// ── Public Auth Routes ────────────────────────────────────────────
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password',  [ResetPasswordController::class, 'reset']);
Route::post('/verify-email',    [AuthController::class, 'verifyEmail']);
Route::get('/services',         [ServiceController::class, 'index']);
Route::get('/schedules/available', [DoctorScheduleController::class, 'available']);

// ── Protected Routes ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get  ('/me',    [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/me', [AuthController::class, 'update']);
    Route::post('/assessment-requirements', [AssessmentRequirementController::class, 'store']);
    Route::get('/assessment-requirements/{appointmentId}', [AssessmentRequirementController::class, 'show']);
    Route::put('/assessment-requirements/{appointmentId}', [AssessmentRequirementController::class, 'update']);


    // ── Messages & Conversations ──────────────────────────────────
    Route::get   ('/conversations',               [MessageController::class, 'conversations']);
    Route::post  ('/conversations/start',         [MessageController::class, 'start']);
    Route::get   ('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post  ('/conversations/{id}/messages', [MessageController::class, 'store']);
    Route::get   ('/users/messageable',           [MessageController::class, 'messageableUsers']);
    Route::patch ('/messages/{id}',               [MessageController::class, 'update']);  // edit
    Route::delete('/messages/{id}',               [MessageController::class, 'unsend']); // unsend

    // ── Shared lookup lists ───────────────────────────────────────
    Route::get('patients/list', [PatientController::class, 'all']);
    Route::get('doctors/list',  [DoctorAccountController::class, 'index']);

    // ── Client: Appointments ──────────────────────────────────────
    Route::get   ('appointments/booked-slots', [AppointmentController::class, 'bookedSlots']);
    Route::post  ('appointments',              [AppointmentController::class, 'store']);
    Route::get   ('appointments',              [AppointmentController::class, 'index']);
    Route::get   ('appointments/{id}',         [AppointmentController::class, 'show']);
    Route::delete('appointments/{id}',         [AppointmentController::class, 'destroy']);

    // ── Doctor Profile ────────────────────────────────────────────
    Route::get   ('/doctor/profile',          [DoctorProfileController::class, 'show']);
    Route::post  ('/doctor/profile/setup',    [DoctorProfileController::class, 'setup']);
    Route::delete('/doctor/profile/files',    [DoctorProfileController::class, 'deleteFile']);
    Route::put   ('/doctor/change-password',  [DoctorController::class, 'changePassword']);
    Route::put   ('/doctor/update-doctor',    [DoctorController::class, 'updateDoctorProfile']);
    Route::put   ('/doctor/account-security', [DoctorController::class, 'updateAccountSecurity']);
    Route::get   ('/doctor/patients',         [DoctorPatientController::class, 'index']);
    Route::get   ('/doctor/patients/{patientId}', [DoctorPatientController::class, 'show']);
    Route::post('/doctor/profile-picture', [DoctorController::class, 'updateProfilePicture']);
    Route::post('/doctor/upload-documents', [DoctorController::class, 'uploadDocuments']);
    // ── Doctor Schedule Routes ────────────────────────────────────
    Route::prefix('doctors/{doctorId}/schedules')->group(function () {
        Route::get   ('/',      [DoctorScheduleController::class, 'index']);
        Route::post  ('/bulk',  [DoctorScheduleController::class, 'bulkStore']);
        Route::post  ('/',      [DoctorScheduleController::class, 'store']);
        Route::get   ('/{id}',  [DoctorScheduleController::class, 'show']);
        Route::put   ('/{id}',  [DoctorScheduleController::class, 'update']);
        Route::delete('/{id}',  [DoctorScheduleController::class, 'destroy']);
    });

    // ── Admin Routes ──────────────────────────────────────────────
    Route::prefix('admin')->group(function () {

        // Dashboard
        Route::get('dashboard/stats', [AdminController::class, 'stats']);

        // Patients
        Route::get   ('patients/all',               [PatientController::class, 'all']);
        Route::get   ('patients/stats',             [AdminController::class,   'getPatientStats']);
        Route::get   ('patients/paginated',         [AdminController::class,   'getPaginatedPatients']);
        Route::get   ('patients',                   [PatientController::class, 'index']);
        Route::post  ('patients',                   [PatientController::class, 'store']);
        Route::get   ('patients/{id}',              [PatientController::class, 'show']);
        Route::put   ('patients/{id}',              [PatientController::class, 'update']);
        Route::delete('patients/{id}',              [PatientController::class, 'destroy']);
        Route::get   ('patients/{id}/appointments', [PatientController::class, 'appointments']);

        // Appointments
        Route::get   ('appointments/booked-slots', [AppointmentController::class, 'bookedSlots']);
        Route::get   ('appointments',              [AppointmentController::class, 'index']);
        Route::post  ('appointments',              [AppointmentController::class, 'store']);
        Route::get   ('appointments/{id}',         [AppointmentController::class, 'show']);
        Route::put   ('appointments/{id}',         [AppointmentController::class, 'update']);
        Route::delete('appointments/{id}',         [AppointmentController::class, 'destroy']);

        // Announcements
        Route::apiResource('announcements', AnnouncementController::class);

        // Doctors
        Route::get ('doctors',      [DoctorAccountController::class, 'index']);
        Route::post('doctors',      [DoctorAccountController::class, 'store']);
        Route::get ('doctors/{id}', [DoctorAccountController::class, 'show']);
        Route::put ('doctors/{id}', [DoctorAccountController::class, 'update']);

        // Clinics
        Route::get   ('clinics',      [ClinicController::class, 'index']);
        Route::post  ('clinics',      [ClinicController::class, 'store']);
        Route::get   ('clinics/{id}', [ClinicController::class, 'show']);
        Route::match (['post', 'put'], 'clinics/{id}', [ClinicController::class, 'update']);
        Route::delete('clinics/{id}', [ClinicController::class, 'destroy']);

        // Services
        Route::get   ('services',      [ServiceController::class, 'index']);
        Route::post  ('services',      [ServiceController::class, 'store']);
        Route::put   ('services/{id}', [ServiceController::class, 'update']);
        Route::delete('services/{id}', [ServiceController::class, 'destroy']);

        // Assessment Purposes
        Route::post  ('assessment-purposes',      [AssessmentPurposeController::class, 'store']);
        Route::put   ('assessment-purposes/{id}', [AssessmentPurposeController::class, 'update']);
        Route::delete('assessment-purposes/{id}', [AssessmentPurposeController::class, 'destroy']);

        // Admin: Doctor Schedule Management
        Route::prefix('doctors/{doctorId}/schedules')->group(function () {
            Route::get   ('/',      [DoctorScheduleController::class, 'index']);
            Route::post  ('/bulk',  [DoctorScheduleController::class, 'bulkStore']);
            Route::post  ('/',      [DoctorScheduleController::class, 'store']);
            Route::get   ('/{id}',  [DoctorScheduleController::class, 'show']);
            Route::put   ('/{id}',  [DoctorScheduleController::class, 'update']);
            Route::delete('/{id}',  [DoctorScheduleController::class, 'destroy']);
        });
    });
});