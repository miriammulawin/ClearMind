<?php

namespace App\Http\Controllers;

use App\Models\AssessmentPurpose;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentPurposeController extends Controller
{
    // POST /api/admin/assessment-purposes
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'service_id'   => ['required', 'exists:services,service_id'],
            'purpose_name' => ['required', 'string', 'max:255'],
            'price'        => ['nullable', 'numeric', 'min:0'],
        ]);

        // Only allow purposes for Psychological Assessment
        $service = Service::findOrFail($request->service_id);
        if (! $service->isPsychologicalAssessment()) {
            return response()->json([
                'message' => 'Purposes can only be added to Psychological Assessment & Evaluation.',
            ], 422);
        }

        $purpose = AssessmentPurpose::create([
            'service_id'   => $request->service_id,
            'purpose_name' => $request->purpose_name,
            'price'        => $request->price ?? 0,
            'is_active'    => true,
        ]);

        return response()->json([
            'message' => 'Purpose added.',
            'data'    => $purpose,
        ], 201);
    }

    // PUT /api/admin/assessment-purposes/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $purpose = AssessmentPurpose::findOrFail($id);

        $request->validate([
            'price'     => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $purpose->update([
            'price'     => $request->price     ?? $purpose->price,
            'is_active' => $request->is_active ?? $purpose->is_active,
        ]);

        return response()->json([
            'message' => 'Purpose updated.',
            'data'    => $purpose->fresh(),
        ]);
    }

    // DELETE /api/admin/assessment-purposes/{id}
    public function destroy(int $id): JsonResponse
    {
        AssessmentPurpose::findOrFail($id)->delete();

        return response()->json(['message' => 'Purpose deleted.']);
    }
}