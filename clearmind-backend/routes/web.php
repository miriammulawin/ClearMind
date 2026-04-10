<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
Route::get('/test-mail', function () {
    $testEmail = 'briandelacruz083@gmail.com';
    $otp = 123456;

    Mail::raw("Test OTP: {$otp}", function ($message) use ($testEmail) {
        $message->to($testEmail)
                ->subject('ClearMind Test Email');
    });

    return 'Email sent successfully!';
});