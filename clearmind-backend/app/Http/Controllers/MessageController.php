<?php
namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    // GET /conversations — list all conversations for auth user
    public function conversations(): JsonResponse
{
    $userId = Auth::id();

    $conversations = Conversation::whereHas('participants', function($q) use ($userId) {
        $q->where('user_id', $userId);
    })
    ->with([
        'participants' => function($q) use ($userId) {
            $q->select('users.id', 'firstName', 'lastName', 'profilePicture', 'role');
        },
        'latestMessage.sender:id,firstName,lastName',
    ])
    ->get()
    ->map(function($conv) use ($userId) {
        // Count unread manually
        $lastRead = $conv->participants
            ->where('id', $userId)
            ->first()
            ?->pivot->last_read_at;

        $conv->unread_count = $conv->messages()
            ->when($lastRead, fn($q) => $q->where('created_at', '>', $lastRead))
            ->when(!$lastRead, fn($q) => $q)
            ->count();

        return $conv;
    })
    ->sortByDesc(fn($c) => $c->latestMessage?->created_at)
    ->values();

    return response()->json(['data' => $conversations]);
}
    // POST /conversations/start — find or create 1-on-1 conversation
    public function start(Request $request): JsonResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $conv = Conversation::findOrCreateBetween(Auth::id(), $request->user_id);

        return response()->json([
            'data' => $conv->load([
                'participants:id,firstName,lastName,profilePicture,role',
                'latestMessage',
            ]),
        ]);
    }

    // GET /conversations/{id}/messages — paginated message history
    public function messages(int $id): JsonResponse
    {
        $conv = Conversation::findOrFail($id);

        // Only participants can read
        abort_unless($conv->participants()->where('user_id', Auth::id())->exists(), 403);

        $messages = $conv->messages()
            ->with('sender:id,firstName,lastName,profilePicture')
            ->latest()
            ->paginate(30);

        // Mark as read
        $conv->participants()->updateExistingPivot(Auth::id(), ['last_read_at' => now()]);

        return response()->json(['data' => $messages]);
    }

    // POST /conversations/{id}/messages — send message
    public function store(Request $request, int $id): JsonResponse
    {
        $conv = Conversation::findOrFail($id);
        abort_unless($conv->participants()->where('user_id', Auth::id())->exists(), 403);

        $request->validate([
            'body'       => 'required_without:attachment|string|max:5000',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('messages/attachments', 'public');
        }

        $message = Message::create([
            'conversation_id' => $conv->id,
            'sender_id'       => Auth::id(),
            'body'            => $request->body ?? '',
            'attachment_path' => $path,
        ]);

        $message->load('sender:id,firstName,lastName,profilePicture');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json(['data' => $message], 201);
    }

    // GET /users/messageable — list all users you can message
    public function messageableUsers(): JsonResponse
    {
        $users = User::where('id', '!=', Auth::id())
            ->where('is_active', true)
            ->select('id', 'firstName', 'lastName', 'role', 'profilePicture')
            ->get();

        return response()->json(['data' => $users]);
    }
}