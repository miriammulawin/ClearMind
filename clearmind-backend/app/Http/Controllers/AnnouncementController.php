<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    /**
     * Display announcements for the authenticated doctor
     * Includes clinic announcements + doctor's own announcements
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            // Only doctors and admins can view announcements
            if (!in_array($user->role, ['Doctor', 'Admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            // Get doctor record if it's a doctor user
            $doctor = $user->role === 'Doctor' ? Doctor::where('user_id', $user->id)->first() : null;

            if ($user->role === 'Doctor' && !$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Doctor record not found',
                ], 404);
            }

            $type = $request->query('type', 'all'); // all, clinic, or doctor
            $perPage = $request->query('per_page', 15);

            $query = Announcement::query();

            // For doctors: show clinic announcements + their own
            if ($user->role === 'Doctor') {
                $query->forDoctor($doctor->id);
            }
            // For admins: show all
            else if ($user->role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            // Filter by type if specified and user is admin
            if ($type !== 'all' && $user->role === 'Admin') {
                $query->byType($type);
            }

            $announcements = $query->ordered()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $announcements->items(),
                'pagination' => [
                    'total' => $announcements->total(),
                    'per_page' => $announcements->perPage(),
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch announcements',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get clinic announcements only
     */
    public function getClinicAnnouncements(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 15);

            $announcements = Announcement::where('type', 'clinic')
                ->ordered()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $announcements->items(),
                'pagination' => [
                    'total' => $announcements->total(),
                    'per_page' => $announcements->perPage(),
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch clinic announcements',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get doctor's own announcements
     */
    public function getDoctorAnnouncements(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'Doctor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only doctors can view their announcements',
                ], 403);
            }

            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Doctor record not found',
                ], 404);
            }

            $perPage = $request->query('per_page', 15);

            $announcements = Announcement::where('doctor_id', $doctor->id)
                ->where('type', 'doctor')
                ->ordered()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $announcements->items(),
                'pagination' => [
                    'total' => $announcements->total(),
                    'per_page' => $announcements->perPage(),
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch doctor announcements',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single announcement
     */
    public function show($id)
    {
        try {
            $announcement = Announcement::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $announcement,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Create a new announcement
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'Doctor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only doctors can create announcements',
                ], 403);
            }

            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Doctor record not found',
                ], 404);
            }

            // Validate input
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:5000',
                'priority' => 'required|in:normal,urgent',
                'is_pinned' => 'sometimes|boolean',
            ]);

            $announcement = Announcement::create([
                'doctor_id' => $doctor->id,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'priority' => $validated['priority'],
                'type' => 'doctor',
                'is_pinned' => $validated['is_pinned'] ?? false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Announcement created successfully',
                'data' => $announcement,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create announcement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an announcement
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $announcement = Announcement::findOrFail($id);

            // Check authorization: only the creator doctor can edit
            if ($user->role === 'Doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if (!$doctor || $announcement->doctor_id !== $doctor->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to update this announcement',
                    ], 403);
                }
            } elseif ($user->role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            // Validate input
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'message' => 'sometimes|string|max:5000',
                'priority' => 'sometimes|in:normal,urgent',
                'is_pinned' => 'sometimes|boolean',
            ]);

            $announcement->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Announcement updated successfully',
                'data' => $announcement,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update announcement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an announcement
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $announcement = Announcement::findOrFail($id);

            // Check authorization: only the creator doctor or admin can delete
            if ($user->role === 'Doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if (!$doctor || $announcement->doctor_id !== $doctor->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to delete this announcement',
                    ], 403);
                }
            } elseif ($user->role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete announcement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle pin status of an announcement
     */
    public function togglePin($id)
    {
        try {
            $user = Auth::user();
            $announcement = Announcement::findOrFail($id);

            // Check authorization
            if ($user->role === 'Doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if (!$doctor || $announcement->doctor_id !== $doctor->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized',
                    ], 403);
                }
            } elseif ($user->role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $announcement->update([
                'is_pinned' => !$announcement->is_pinned,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pin status updated',
                'data' => $announcement,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle pin status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}