<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcements;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    // GET /admin/announcements
    public function index()
    {
        $announcements = Announcements::with('creator:id,firstName,lastName')
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($a) => [
                'id'         => $a->id,
                'title'      => $a->title,
                'message'    => $a->message,
                'priority'   => $a->priority,
                'date'       => $a->created_at->format('M d, Y'),
                'created_by' => $a->creator
                    ? $a->creator->firstName . ' ' . $a->creator->lastName
                    : 'Admin',
            ]);

        return response()->json(['success' => true, 'data' => $announcements]);
    }

    // POST /admin/announcements
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'message'  => 'required|string',
            'priority' => 'required|in:normal,high',
        ]);

        $announcement = Announcements::create([
            ...$validated,
            'created_by' => Auth::id(),
            'is_active'  => true,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'         => $announcement->id,
                'title'      => $announcement->title,
                'message'    => $announcement->message,
                'priority'   => $announcement->priority,
                'date'       => $announcement->created_at->format('M d, Y'),
                'created_by' => Auth::user()->firstName . ' ' . Auth::user()->lastName,
            ],
        ], 201);
    }

    // PUT /admin/announcements/{id}
    public function update(Request $request, $id)
    {
        $announcement = Announcements::findOrFail($id);

        $validated = $request->validate([
            'title'    => 'sometimes|required|string|max:255',
            'message'  => 'sometimes|required|string',
            'priority' => 'sometimes|required|in:normal,high',
        ]);

        $announcement->update($validated);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'       => $announcement->id,
                'title'    => $announcement->title,
                'message'  => $announcement->message,
                'priority' => $announcement->priority,
                'date'     => $announcement->created_at->format('M d, Y'),
            ],
        ]);
    }

    public function destroy($id)
    {
        $announcement = Announcements::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully.'
        ]);
    }
};