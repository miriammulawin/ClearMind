<?php
namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];

        // Also notify every participant's personal channel, so navbars/badges
        // update instantly even for conversations they haven't opened yet.
        foreach ($this->message->conversation->participants as $participant) {
            $channels[] = new PrivateChannel('user.' . $participant->id);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->message->id,
            'body'            => $this->message->body,
            'sender_id'       => $this->message->sender_id,
            'conversation_id' => $this->message->conversation_id,
            'created_at'      => $this->message->created_at->toISOString(),
            'sender' => [
                'id'        => $this->message->sender->id,
                'firstName' => $this->message->sender->firstName,
                'lastName'  => $this->message->sender->lastName,
            ],
        ];
    }
}