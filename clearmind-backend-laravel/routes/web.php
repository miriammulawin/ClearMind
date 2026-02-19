<?php

use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Route;
use App\Models\User;

Route::get('/email/verify/{id}/{hash}', function ($id, $hash, EmailVerificationRequest $request) {
    $user = User::findOrFail($id);

    // Verify the signed hash manually
    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid verification link.'
        ], 403);
    }

    $user->markEmailAsVerified();

    return response()->json([
        'success' => true,
        'message' => 'Email verified successfully!'
    ]);
})->middleware('signed')->name('verification.verify');
