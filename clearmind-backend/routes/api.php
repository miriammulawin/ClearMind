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

// ── Public Auth Routes ────────────────────────────────────────────
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password',  [ResetPasswordController::class, 'reset']);
Route::post('/verify-email',    [AuthController::class, 'verifyEmail']);
// Public: service list for dropdowns (no auth required)
Route::get('/services', [ServiceController::class, 'index']);
// Public: available slots for patient booking (no auth required)
Route::get('/schedules/available', [DoctorScheduleController::class, 'available']);
Route::get('doctors/list',  [DoctorAccountController::class, 'index']);

// ── Protected Routes ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
Route::get('/appointments/booked-slots', [AppointmentController::class, 'bookedSlots']);
// Messages & Conversations
 Route::get('/conversations',            [MessageController::class, 'conversations']);
    Route::post('/conversations/start',     [MessageController::class, 'start']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'store']);
    Route::get('/users/messageable',        [MessageController::class, 'messageableUsers']);

    // ── Auth ──────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get  ('/me',    [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/me', [AuthController::class, 'update']);

    // ── Shared lookup lists ───────────────────────────────────────
    Route::get('patients/list', [PatientController::class, 'all']);

    // ── Client: appointments ──────────────────────────────────────
    Route::post  ('appointments',      [AppointmentController::class, 'store']);
    Route::get   ('appointments',      [AppointmentController::class, 'index']);
    Route::get   ('appointments/{id}', [AppointmentController::class, 'show']);
    Route::delete('appointments/{id}', [AppointmentController::class, 'destroy']);


    Route::get('/doctor/profile',          [DoctorProfileController::class, 'show']);
    Route::post('/doctor/profile/setup',   [DoctorProfileController::class, 'setup']);
    Route::delete('/doctor/profile/files', [DoctorProfileController::class, 'deleteFile']);
    Route::put('/doctor/change-password',  [DoctorController::class, 'changePassword']);
    Route::put('/doctor/update-doctor', [DoctorController::class, 'updateDoctorProfile']);
    Route::put('/doctor/account-security', [DoctorController::class, 'updateAccountSecurity']);
    Route::get('/doctor/patients', [DoctorPatientController::class, 'index']);
    Route::get('/doctor/patients/{patientId}', [DoctorPatientController::class, 'show']);
    // ── Doctor profile ────────────────────────────────────────────
    Route::get   ('/doctor/profile',        [DoctorProfileController::class, 'show']);
    Route::post  ('/doctor/profile/setup',  [DoctorProfileController::class, 'setup']);
    Route::delete('/doctor/profile/files',  [DoctorProfileController::class, 'deleteFile']);
    Route::put   ('/doctor/change-password',[DoctorController::class,        'changePassword']);

    // ── Doctor Schedule Routes ────────────────────────────────────
    // IMPORTANT: /bulk must be registered BEFORE /{id} to avoid
    // Laravel treating "bulk" as an integer schedule ID.
    Route::prefix('doctors/{doctorId}/schedules')->group(function () {

        // GET    /api/doctors/{doctorId}/schedules          → full weekly schedule
        Route::get   ('/',      [DoctorScheduleController::class, 'index']);

        // POST   /api/doctors/{doctorId}/schedules          → add one slot
        Route::post  ('/',      [DoctorScheduleController::class, 'store']);

        // POST   /api/doctors/{doctorId}/schedules/bulk     → replace all slots
        Route::post  ('/bulk',  [DoctorScheduleController::class, 'bulkStore']);

        // GET    /api/doctors/{doctorId}/schedules/{id}     → show one slot
        Route::get   ('/{id}',  [DoctorScheduleController::class, 'show']);

        // PUT    /api/doctors/{doctorId}/schedules/{id}     → update one slot
        Route::put   ('/{id}',  [DoctorScheduleController::class, 'update']);

        // DELETE /api/doctors/{doctorId}/schedules/{id}     → delete one slot
        Route::delete('/{id}',  [DoctorScheduleController::class, 'destroy']);
    });

    // ── Admin Routes ──────────────────────────────────────────────
    Route::prefix('admin')->group(function () {

        // Dashboard
        Route::get('dashboard/stats', [AdminController::class, 'stats']);

        // ── Patients ──────────────────────────────────────────────
        Route::get   ('patients/all',               [PatientController::class, 'all']);
        Route::get   ('patients/stats',             [AdminController::class,   'getPatientStats']);
        Route::get   ('patients/paginated',         [AdminController::class,   'getPaginatedPatients']);
        Route::get   ('patients',                   [PatientController::class, 'index']);
        Route::post  ('patients',                   [PatientController::class, 'store']);
        Route::get   ('patients/{id}',              [PatientController::class, 'show']);
        Route::put   ('patients/{id}',              [PatientController::class, 'update']);
        Route::delete('patients/{id}',              [PatientController::class, 'destroy']);
        Route::get   ('patients/{id}/appointments', [PatientController::class, 'appointments']);

        Route::get('/appointments/booked-slots', [AppointmentController::class, 'bookedSlots']);
        
        // ── Appointments ──────────────────────────────────────────
        Route::get   ('appointments',      [AppointmentController::class, 'index']);
        Route::post  ('appointments',      [AppointmentController::class, 'store']);
        Route::get   ('appointments/{id}', [AppointmentController::class, 'show']);
        Route::put   ('appointments/{id}', [AppointmentController::class, 'update']);
        Route::delete('appointments/{id}', [AppointmentController::class, 'destroy']);

        // ── Announcements ─────────────────────────────────────────
        Route::apiResource('announcements', AnnouncementController::class);

        // ── Doctors (Admin: create + list) ────────────────────────
        Route::get ('doctors',      [DoctorAccountController::class, 'index']);
        Route::post('doctors',      [DoctorAccountController::class, 'store']);
        Route::get ('doctors/{id}', [DoctorAccountController::class, 'show']);
        Route::put ('doctors/{id}', [DoctorAccountController::class, 'update']);

        // ── Admin can also manage doctor schedules ─────────────────
      

        // ── Clinics ───────────────────────────────────────────────
        Route::get   ('clinics',      [ClinicController::class, 'index']);
        Route::post  ('clinics',      [ClinicController::class, 'store']);
        Route::get   ('clinics/{id}', [ClinicController::class, 'show']);
        Route::match (['post', 'put'], 'clinics/{id}', [ClinicController::class, 'update']);
        Route::delete('clinics/{id}', [ClinicController::class, 'destroy']);

        // ── Services ──────────────────────────────────────────────
        Route::get   ('services',      [ServiceController::class, 'index']);
        Route::post  ('services',      [ServiceController::class, 'store']);
        Route::put   ('services/{id}', [ServiceController::class, 'update']);
        Route::delete('services/{id}', [ServiceController::class, 'destroy']);

        // ── Assessment Purposes ───────────────────────────────────
        Route::post  ('assessment-purposes',      [AssessmentPurposeController::class, 'store']);
        Route::put   ('assessment-purposes/{id}', [AssessmentPurposeController::class, 'update']);
        Route::delete('assessment-purposes/{id}', [AssessmentPurposeController::class, 'destroy']);
    });


          // These mirror the doctor-facing routes above but sit under /admin
        Route::prefix('doctors/{doctorId}/schedules')->group(function () {
            Route::get   ('/',     [DoctorScheduleController::class, 'index']);
            Route::post  ('/',     [DoctorScheduleController::class, 'store']);
            Route::post  ('/bulk', [DoctorScheduleController::class, 'bulkStore']);
            Route::get   ('/{id}', [DoctorScheduleController::class, 'show']);
            Route::put   ('/{id}', [DoctorScheduleController::class, 'update']);
            Route::delete('/{id}', [DoctorScheduleController::class, 'destroy']);
        });
    
});