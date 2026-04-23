<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    // Find or create a 1-on-1 conversation between two users
    public static function findOrCreateBetween(int $userA, int $userB): self
    {
        $conv = self::whereHas('participants', fn($q) => $q->where('user_id', $userA))
            ->whereHas('participants', fn($q) => $q->where('user_id', $userB))
            ->withCount('participants')
            ->having('participants_count', 2)
            ->first();

        if (!$conv) {
            $conv = self::create();
            $conv->participants()->attach([$userA, $userB]);
        }

        return $conv;
    }
}