<?php

namespace App\Http\Controllers\Auth;
use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $status = \Password::sendResetLink(
            $request->only('email')
        );

        if ($status === \Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent.']);
        } else {
            return response()->json(['message' => 'Unable to send password reset link.'], 500);
        }
    }
}
