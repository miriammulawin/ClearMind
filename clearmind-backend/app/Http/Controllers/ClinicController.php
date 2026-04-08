<?php
// app/Http/Controllers/ClinicController.php
namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ClinicController extends Controller
{
    /**
     * List all clinics (latest first).
     */
    public function index(): JsonResponse
    {
        try {
            $clinics = Clinic::latest()->get();
            return response()->json(['data' => $clinics]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch clinics.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new clinic.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'clinic_name'          => ['required', 'string', 'max:100'],
            'clinic_type'          => ['required', Rule::in(['Physical', 'Online'])],
            'clinic_paymentMethod' => ['required', 'string', 'max:50'],
            'clinic_fee'           => ['nullable', 'string', 'max:100'],
            'clinic_description'   => ['nullable', 'string'],
            'blk'                  => ['nullable', 'string', 'max:150'],
            'barangay'             => ['nullable', 'string', 'max:100'],
            'city'                 => ['nullable', 'string', 'max:100'],
            'province'             => ['nullable', 'string', 'max:100'],
            'region'               => ['nullable', 'string', 'max:100'],
            'zip_code'             => ['nullable', 'string', 'max:20'],
            'clinic_image'         => ['nullable', 'file', 'image', 'max:5120'],
            'qr_image'             => ['nullable', 'file', 'image', 'max:5120'],
            // Accept clinic_schedule as a plain string (JSON-encoded from FormData)
            'clinic_schedule'      => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $imagePath = null;
            if ($request->hasFile('clinic_image')) {
                $imagePath = $request->file('clinic_image')->store('clinics/images', 'public');
            }

            $qrPath = null;
            if ($request->hasFile('qr_image')) {
                $qrPath = $request->file('qr_image')->store('clinics/qr', 'public');
            }

            // Build full address string
            $parts = array_filter([
                $request->input('blk'),
                $request->input('barangay'),
                $request->input('city'),
                $request->input('province'),
                $request->input('region'),
                $request->input('zip_code'),
            ]);
            $fullAddress = implode(', ', $parts);

            // Decode schedule from JSON string
            $schedule = null;
            if ($request->filled('clinic_schedule')) {
                $decoded = json_decode($request->input('clinic_schedule'), true);
                $schedule = (json_last_error() === JSON_ERROR_NONE) ? $decoded : null;
            }

            $clinic = Clinic::create([
                'clinic_name'          => $request->input('clinic_name'),
                'clinic_type'          => $request->input('clinic_type'),
                'clinic_address'       => $fullAddress ?: null,
                'blk'                  => $request->input('blk'),
                'barangay'             => $request->input('barangay'),
                'city'                 => $request->input('city'),
                'province'             => $request->input('province'),
                'region'               => $request->input('region'),
                'zip_code'             => $request->input('zip_code'),
                'clinic_image'         => $imagePath,
                'clinic_description'   => $request->input('clinic_description'),
                'clinic_schedule'      => $schedule,
                'clinic_paymentMethod' => $request->input('clinic_paymentMethod'),
                'clinic_fee'           => $request->input('clinic_fee'),
                'qr_image'             => $qrPath,
            ]);

            return response()->json([
                'message' => 'Clinic created successfully.',
                'data'    => $clinic->fresh(),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create clinic.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single clinic.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $clinic = Clinic::findOrFail($id);
            return response()->json(['data' => $clinic]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Clinic not found.'], 404);
        }
    }

    /**
     * Update an existing clinic.
     * Called via POST with _method=PUT (for file upload support).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $clinic = Clinic::find($id);
        if (!$clinic) {
            return response()->json(['message' => 'Clinic not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'clinic_name'          => ['required', 'string', 'max:100'],
            'clinic_type'          => ['required', Rule::in(['Physical', 'Online'])],
            'clinic_paymentMethod' => ['required', 'string', 'max:50'],
            'clinic_fee'           => ['nullable', 'string', 'max:100'],
            'clinic_description'   => ['nullable', 'string'],
            'blk'                  => ['nullable', 'string', 'max:150'],
            'barangay'             => ['nullable', 'string', 'max:100'],
            'city'                 => ['nullable', 'string', 'max:100'],
            'province'             => ['nullable', 'string', 'max:100'],
            'region'               => ['nullable', 'string', 'max:100'],
            'zip_code'             => ['nullable', 'string', 'max:20'],
            'clinic_image'         => ['nullable', 'file', 'image', 'max:5120'],
            'qr_image'             => ['nullable', 'file', 'image', 'max:5120'],
            'clinic_schedule'      => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            // Handle clinic image replacement
            if ($request->hasFile('clinic_image')) {
                if ($clinic->clinic_image) {
                    Storage::disk('public')->delete($clinic->clinic_image);
                }
                $clinic->clinic_image = $request->file('clinic_image')->store('clinics/images', 'public');
            }

            // Handle QR image replacement
            if ($request->hasFile('qr_image')) {
                if ($clinic->qr_image) {
                    Storage::disk('public')->delete($clinic->qr_image);
                }
                $clinic->qr_image = $request->file('qr_image')->store('clinics/qr', 'public');
            }

            // Build full address
            $parts = array_filter([
                $request->input('blk'),
                $request->input('barangay'),
                $request->input('city'),
                $request->input('province'),
                $request->input('region'),
                $request->input('zip_code'),
            ]);

            // Decode schedule
            $schedule = $clinic->clinic_schedule; // keep existing if not sent
            if ($request->filled('clinic_schedule')) {
                $decoded = json_decode($request->input('clinic_schedule'), true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $schedule = $decoded;
                }
            }

            $clinic->clinic_name          = $request->input('clinic_name');
            $clinic->clinic_type          = $request->input('clinic_type');
            $clinic->clinic_address       = implode(', ', $parts) ?: null;
            $clinic->blk                  = $request->input('blk');
            $clinic->barangay             = $request->input('barangay');
            $clinic->city                 = $request->input('city');
            $clinic->province             = $request->input('province');
            $clinic->region               = $request->input('region');
            $clinic->zip_code             = $request->input('zip_code');
            $clinic->clinic_description   = $request->input('clinic_description');
            $clinic->clinic_schedule      = $schedule;
            $clinic->clinic_paymentMethod = $request->input('clinic_paymentMethod');
            $clinic->clinic_fee           = $request->input('clinic_fee');
            $clinic->save();

            return response()->json([
                'message' => 'Clinic updated successfully.',
                'data'    => $clinic->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update clinic.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Soft-delete a clinic.
     */
    public function destroy(int $id): JsonResponse
    {
        $clinic = Clinic::find($id);
        if (!$clinic) {
            return response()->json(['message' => 'Clinic not found.'], 404);
        }

        try {
            if ($clinic->clinic_image) {
                Storage::disk('public')->delete($clinic->clinic_image);
            }
            if ($clinic->qr_image) {
                Storage::disk('public')->delete($clinic->qr_image);
            }
            $clinic->delete();

            return response()->json(['message' => 'Clinic deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete clinic.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}