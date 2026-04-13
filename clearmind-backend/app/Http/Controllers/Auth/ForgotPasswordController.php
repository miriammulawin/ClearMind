<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'If that email exists, a reset code has been sent.',
            ]);
        }

        $otp = rand(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token'      => $otp,
                'created_at' => now(),
            ]
        );

        try {
            Mail::raw(
                "Hello {$user->firstName},\n\nYour ClearMind password reset OTP is: {$otp}\n\nThis code expires in 15 minutes.\n\nIf you did not request a password reset, please ignore this email.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('ClearMind Password Reset OTP');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Reset mail failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset email. Please try again.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset OTP has been sent to your email.',
        ]);
    }
}