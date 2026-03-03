<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
public function show(Request $request)
{
    $user   = $request->user();
    $doctor = $user->doctor; // pulls from doctors table

    return response()->json([
        'user' => [
            'id'            => $user->id,
            'firstName'     => $user->first_name,
            'lastName'      => $user->last_name,
            'middleInitial' => $user->middle_initial ?? '',
            'email'         => $user->email,
            'address'       => $user->address ?? '',
            'contactNo'     => $user->contact_no,
            'dob'           => $user->dob,
            'sex'           => $user->sex,
            'role'          => $user->role,
        ],
        'profile' => $doctor ? [
            'professional_title'  => $doctor->professional_title,
            'description'         => $doctor->description,
            'years_of_experience' => $doctor->years_of_experience,
            'license_number'      => $doctor->license_number,
            'prc_number'          => $doctor->prc_number,
            'practicing_since'    => $doctor->practicing_since,
            'specializations'     => $doctor->specializations     ?? [],
            'sub_specializations' => $doctor->sub_specializations ?? [],
            'board_certificates'  => $doctor->board_certificates  ?? [],
            'services'            => $doctor->services            ?? [],
            'profile_picture'     => $doctor->profile_picture
                ? asset('storage/' . $doctor->profile_picture)
                : null,
            'certificate_image'   => $doctor->certificate_image
                ? asset('storage/' . $doctor->certificate_image)
                : null,
        ] : (object)[],
    ]);
}
}
