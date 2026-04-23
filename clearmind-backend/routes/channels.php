<?php
use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return Conversation::findOrFail($conversationId)
        ->participants()
        ->where('user_id', $user->id)
        ->exists();
});