<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DoctorAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'firstName'     => ['required', 'string', 'max:100'],
            'lastName'      => ['required', 'string', 'max:100'],
            'middleInitial' => ['nullable', 'string', 'max:5'],
            'sex'           => ['nullable', 'in:male,female,other'],
            'dob'           => ['nullable', 'date', 'before:today'],
            'email'         => ['required', 'email', 'unique:users,email'],
            'contactNo'     => ['nullable', 'string', 'max:20'],
            'address'       => ['nullable', 'string', 'max:255'],
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'firstName'     => $request->firstName,
                'lastName'      => $request->lastName,
                'middleInitial' => $request->middleInitial,
                'sex'           => $request->sex,
                'dob'           => $request->dob,
                'email'         => $request->email,
                'contactNo'     => $request->contactNo,
                'address'       => $request->address,
                'role'          => 'Doctor',
                'is_active'     => true,
                'password'      => Hash::make(Str::random(16)),
            ]);

            $user->doctor()->create([
                'profile_completed' => false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Doctor account created successfully.',
                'data'    => $user->load('doctor'),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create account.',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ], 500);
        }
    }
}