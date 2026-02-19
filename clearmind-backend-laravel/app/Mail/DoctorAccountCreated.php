<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DoctorAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $email;
    public $temporaryPassword;
    public $verificationUrl;

    public function __construct($name, $email, $temporaryPassword, $verificationUrl)
    {
        $this->name = $name;
        $this->email = $email;
        $this->temporaryPassword = $temporaryPassword;
        $this->verificationUrl = $verificationUrl;
    }

    public function build()
    {
        return $this->subject('ClearMind Doctor Account Created')
                    ->view('emails.doctor_account_created')
                    ->with([
                        'name' => $this->name,
                        'email' => $this->email,
                        'temporaryPassword' => $this->temporaryPassword,
                        'verificationUrl' => $this->verificationUrl,
                    ]);
    }
}
