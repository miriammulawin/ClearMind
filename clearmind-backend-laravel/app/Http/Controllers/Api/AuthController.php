<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\DoctorAccountCreated;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class AuthController extends Controller
{
    // =========================
    // REGISTER
    // =========================
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'dob' => 'required|date',
                'sex' => ['required', Rule::in(['male', 'female'])],
                'contactNo' => 'required|string|max:20',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|confirmed|min:6',
                'role' => ['nullable', Rule::in(['Admin','Doctor','Client'])],
            ]);

            $role = $validated['role'] ?? 'Client';
            $fullName = $validated['firstName'] . ' ' . $validated['lastName'];

            $user = User::create([
                'first_name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'name' => $fullName,
                'dob' => $validated['dob'],
                'sex' => $validated['sex'],
                'contact_no' => $validated['contactNo'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
                'email_verified_at' => $role === 'Doctor' ? null : now(),
            ]);

            // If Doctor, send account info + verification link
          
            if ($role === 'Doctor') {
                // Generate signed verification link
                $verificationUrl = URL::temporarySignedRoute(
                    'verification.verify',        // route name
                    now()->addHours(24),          // link expires in 24 hours
                    ['id' => $user->id, 'hash' => sha1($user->email)]
                );

                // Send email to doctor including the verification link
                Mail::to($user->email)->send(
                    new DoctorAccountCreated(
                        $user->name,
                        $user->email,
                        $validated['password'],
                        $verificationUrl // pass link to mailable
                    )
                );
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => $role === 'Doctor'
                    ? 'Doctor registered successfully. Check your email for verification link.'
                    : 'User registered successfully.',
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'token' => $token
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ], 500);
        }
    }

    // =========================
    // LOGIN
    // =========================
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if ($user->role === 'Doctor' && !$user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please verify your email before logging in.'
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'token' => $token
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // LOGOUT
    // =========================
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
