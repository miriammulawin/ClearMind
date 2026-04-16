<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

    class AnnouncementController extends Controller
{
    /* ────────────────────────────────────────────────
     * GET /api/admin/announcements
     * ──────────────────────────────────────────────── */
  public function index(Request $request)
{
    $user = $request->user();

    $announcements = Announcement::where('is_active', true)
        ->where(function ($q) use ($user) {
            $q->where('audience', 'all');
            if ($user->role === 'Doctor') {
                $q->orWhere('audience', 'doctors');
            }
            if ($user->role === 'Client') {
                $q->orWhere('audience', 'clients');
            }
            if ($user->role === 'Admin') {
                $q->orWhere('audience', 'doctors')->orWhere('audience', 'clients');
            }
        })
        ->latest()
        ->get();

    return response()->json(['data' => $announcements]);
}

    /* ────────────────────────────────────────────────
     * POST /api/admin/announcements
     * ──────────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'message'  => 'required|string',
            'priority' => 'required|in:normal,high',
            'audience' => 'required|in:all,clients,doctors',
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'created_by' => Auth::id(),
            'is_active'  => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully.',
            'data'    => $this->format($announcement),
        ], 201);
    }

    /* ────────────────────────────────────────────────
     * GET /api/admin/announcements/{announcement}
     * ──────────────────────────────────────────────── */
    public function show(Announcement $announcement)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->format($announcement),
        ]);
    }

    /* ────────────────────────────────────────────────
     * PUT /api/admin/announcements/{announcement}
     * ──────────────────────────────────────────────── */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title'     => 'sometimes|required|string|max:255',
            'message'   => 'sometimes|required|string',
            'priority'  => 'sometimes|required|in:normal,high',
            'audience'  => 'sometimes|required|in:all,clients,doctors',
            'is_active' => 'sometimes|boolean',
        ]);

        $announcement->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully.',
            'data'    => $this->format($announcement),
        ]);
    }

    /* ────────────────────────────────────────────────
     * DELETE /api/admin/announcements/{announcement}
     * ──────────────────────────────────────────────── */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully.',
        ]);
    }

    /* ── Format response ── */
    private function format(Announcement $a): array
    {
        return [
            'id'        => $a->id,
            'title'     => $a->title,
            'message'   => $a->message,
            'priority'  => $a->priority,
            'audience'  => $a->audience,
            'is_active' => $a->is_active,
            'date'      => $a->created_at->format('M d, Y'),
        ];
    }
}