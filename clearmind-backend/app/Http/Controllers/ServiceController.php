<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // GET /api/admin/services
    public function index(): JsonResponse
    {
        $services = Service::with('purposes')->orderBy('service_id')->get();

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

        // Load purposes so the response shape matches index()
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
        // Also deletes purposes via cascade (set in migration)
        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }
}