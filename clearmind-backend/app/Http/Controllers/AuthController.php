<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName'        => 'required|string|max:100',
            'lastName'         => 'required|string|max:100',
            'middleInitial'    => 'required|string|max:5',
            'dob'              => 'required|date|before:today',
            'sex'              => 'required|in:male,female,other',
            'genderIdentity'   => 'nullable|in:female,male,transgender,trans_woman,trans_man,non_binary,genderqueer,gender_fluid,agender,bigender,two_spirit,intersex,pangender,prefer_not',
            'preferredPronoun' => 'nullable|in:he_him,she_her,they_them,other',
            'customPronoun'    => 'nullable|required_if:preferredPronoun,other|string|max:100',
            'contactNo'        => 'required|string|max:20',       
            'email'            => 'required|email|unique:users,email',
            'password'         => ['required', 'confirmed', Password::min(6)],
            'address'          => 'nullable|string|max:255',
        ]);

        $otp = rand(100000, 999999);

        $user = User::create([
            'firstName'               => $validated['firstName'],
            'lastName'                => $validated['lastName'],
            'middleInitial'           => $validated['middleInitial'],
            'dob'                     => $validated['dob'],
            'sex'                     => $validated['sex'],
            'genderIdentity'          => $validated['genderIdentity'] ?? null,
            'preferredPronoun'        => $validated['preferredPronoun'] ?? null,
            'customPronoun'           => $validated['customPronoun'] ?? null,
            'contactNo'               => $validated['contactNo'],
            'email'                   => $validated['email'],
            'password'                => Hash::make($validated['password']),
            'address'                 => $validated['address'] ?? null,
            'role'                    => User::ROLE_CLIENT,
            'is_active'               => true,
            'email_verification_code' => $otp,
            'email_verified_at'       => null,
        ]);

        // Send OTP email
        try {
            Mail::raw(
                "Hello {$user->firstName},\n\nYour ClearMind verification OTP is: {$otp}\n\nThis code expires in 15 minutes.\n\nIf you did not register, please ignore this email.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Verify your ClearMind account');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Mail send failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please check your email for the OTP verification code.',
            'data'    => [
                'user' => $this->userPayload($user),
            ],
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        if ($user->email_verification_code != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP.',
            ], 400);
        }

        // Direct assignment — more reliable than update()
        $user->email_verified_at = now();
        $user->email_verification_code = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully. You can now log in.',
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

    if (!$user->email_verified_at && $user->role === 'Client') {
    return response()->json([
        'success' => false,
        'message' => 'Your account has not been verified. Please check your email for the OTP.',
    ], 403);
}
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'token' => $token,
                'role'  => $user->role,
                'user'  => $this->userPayload($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->userPayload($request->user()),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'                => $user->id,
            'firstName'         => $user->firstName,
            'lastName'          => $user->lastName,
            'middleInitial'     => $user->middleInitial,
            'fullName'          => $user->full_name,
            'dob'               => $user->dob,
            'sex'               => $user->sex,
            'genderIdentity'    => $user->genderIdentity,
            'preferredPronoun'  => $user->preferredPronoun,
            'displayPronoun'    => $user->display_pronoun,
            'contactNo'         => $user->contactNo,
            'email'             => $user->email,
            'address'           => $user->address,
            'role'              => $user->role,
            'is_active'         => $user->is_active,
            'email_verified_at' => $user->email_verified_at,
            'created_at'        => $user->created_at,
        ];
    }
}