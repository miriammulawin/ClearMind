<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']); 
});

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        // You can also return nice HTML error page here if wanted
        return response()->json([
            'success' => false,
            'message' => 'Invalid verification link.'
        ], 403);
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    // ────────────────────────────────────────────────
    // Decide what to return based on request type
    // ────────────────────────────────────────────────

    if ($request->wantsJson() || $request->header('Accept') === 'application/json') {
        // API client (mobile app, Postman, frontend fetch/axios with json header)
        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully! You can now log in.'
        ]);
    }

    // Browser → show beautiful success page
    return view('auth.verification-success');

})->name('verification.verify')
  ->middleware(['signed', 'throttle:6,1']);  