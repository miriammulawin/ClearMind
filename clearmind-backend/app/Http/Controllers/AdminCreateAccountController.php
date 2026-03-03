<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminCreateAccountController extends Controller
{
    // ── GET /admin/doctors ──────────────────────────────────────
    public function index()
    {
        $doctors = User::where('role', 'Doctor')
            ->with('doctor')
            ->latest()
            ->paginate(10);

        $doctors->getCollection()->transform(function ($user) {
            $profile = $user->doctor;
            return [
                'id'             => $user->id,
                'name'           => $user->first_name . ' ' . $user->last_name,
                'email'          => $user->email,
                'contact'        => $user->contact_no ?? '—',
                'specialization' => $profile?->specializations
                    ? (is_array($profile->specializations)
                        ? $profile->specializations[0]
                        : json_decode($profile->specializations, true)[0] ?? '—')
                    : '—',
                'is_active'      => $user->is_active ?? true,
                'profile_picture'=> $profile?->profile_picture
                    ? asset('storage/' . $profile->profile_picture)
                    : null,
            ];
        });

        return response()->json($doctors);
    }

    // ── GET /admin/doctors/{id} ─────────────────────────────────
    public function show($id)
    {
        $user    = User::with('doctor')->findOrFail($id);
        $profile = $user->doctor;

        return response()->json([
            'id'             => $user->id,
            'first_name'     => $user->first_name,
            'last_name'      => $user->last_name,
            'middle_initial' => $user->middle_initial ?? '',
            'email'          => $user->email,
            'contact'        => $user->contact_no  ?? '',
            'address'        => $user->address      ?? '',
            'sex'            => $user->sex           ?? '',
            'dob'            => $user->dob           ?? '',
            'is_active'      => $user->is_active     ?? true,
            'specialization' => $profile?->specializations
                ? (is_array($profile->specializations)
                    ? $profile->specializations[0]
                    : json_decode($profile->specializations, true)[0] ?? '—')
                : '—',
            'profile_picture'=> $profile?->profile_picture
                ? asset('storage/' . $profile->profile_picture)
                : null,
        ]);
    }

    // ── POST /admin/doctors ─────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'first_name'  => 'required|string|max:100',
            'last_name'   => 'required|string|max:100',
            'email'       => 'required|email|unique:users,email',
            'contact_no'  => 'nullable|string|max:20',
            'sex'         => 'nullable|string',
            'dob'         => 'nullable|date',
            'address'     => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'first_name'     => $request->first_name,
            'last_name'      => $request->last_name,
            'middle_initial' => $request->middle_initial ?? null,
            'email'          => $request->email,
            'password'       => Hash::make('doctor123'), 
            'role'           => 'Doctor',
            'contact_no'     => $request->contact_no,
            'sex'            => $request->sex,
            'dob'            => $request->dob,
            'address'        => $request->address,
            'is_active'      => true,
        ]);

        return response()->json([
            'message' => 'Doctor account created successfully.',
            'default_password' => 'Doctor@1234',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
            ],
        ], 201);
    }

    // ── PATCH /admin/doctors/{id}/toggle-status ─────────────────
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Doctor is now Active.' : 'Doctor is now Inactive.',
            'is_active' => $user->is_active,
        ]);
    }
}