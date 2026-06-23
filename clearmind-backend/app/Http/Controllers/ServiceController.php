<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Services allowed per profession.
     */
    private const PROFESSION_SERVICES = [
        'Psychometrician' => [
            'Psychological Assessment',
            'Mental Health Certification',
        ],
        'Psychologist' => [
            'Psychotherapy',
        ],
        'Psychiatrist' => [
            'Psychiatric Evaluation',
        ],
    ];
    // GET /api/admin/services
    // Optional query param: ?profession=Psychologist
    public function index(Request $request): JsonResponse
    {
        $profession = $request->query('profession');

        $query = Service::with('purposes')->orderBy('service_id');

        if ($profession && isset(self::PROFESSION_SERVICES[$profession])) {
            $allowedNames = self::PROFESSION_SERVICES[$profession];
            $query->whereIn('service_name', $allowedNames);
        }

        $services = $query->get();

        // Attach which professions handle each service
        $services->each(function ($service) {
            $service->handled_by = $this->getProfessionsForService($service->service_name);
        });

        return response()->json(['data' => $services]);
    }

    // POST /api/admin/services
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'service_name' => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'price'        => ['nullable', 'numeric', 'min:0'],
        ]);

        $service = Service::create([
            'service_name' => $request->service_name,
            'description'  => $request->description,
            'price'        => $request->price ?? 0,
            'is_available' => true,
        ]);

        return response()->json([
            'message' => 'Service created.',
            'data'    => $service->load('purposes'),
        ], 201);
    }

    // PUT /api/admin/services/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'price'        => ['nullable', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $service->update([
            'price'        => $request->price        ?? $service->price,
            'is_available' => $request->is_available ?? $service->is_available,
        ]);

        return response()->json([
            'message' => 'Service updated.',
            'data'    => $service->fresh()->load('purposes'),
        ]);
    }

    // DELETE /api/admin/services/{id}
    public function destroy(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function getProfessionsForService(string $serviceName): array
    {
        $professions = [];
        foreach (self::PROFESSION_SERVICES as $profession => $names) {
            if (in_array($serviceName, $names, true)) {
                $professions[] = $profession;
            }
        }
        return $professions;
    }
}