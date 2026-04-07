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
        $query = Announcement::where('is_active', true)->latest();

        if ($request->filled('audience') && $request->audience !== 'all') {
            $query->whereIn('audience', [$request->audience, 'all']);
        }

        $announcements = $query->get()->map(fn(Announcement $a) => $this->format($a));

        return response()->json([
            'success' => true,
            'data'    => $announcements,
        ]);
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