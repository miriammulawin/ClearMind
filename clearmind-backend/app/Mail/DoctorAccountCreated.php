<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DoctorAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User   $user,
        public string $password,
        public bool   $isExisting = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isExisting
                ? 'Your ClearMind Account Credentials'
                : 'Welcome to ClearMind — Your Account is Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.doctor-account-created',
        );
    }
}