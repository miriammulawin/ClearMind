<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body        { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container  { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header     { background: #6a49a9; padding: 30px; text-align: center; }
        .header h1  { color: #fff; margin: 0; font-size: 24px; }
        .body       { padding: 30px; }
        .body p     { color: #555; line-height: 1.6; }
        .creds      { background: #f0ebff; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .creds p    { margin: 6px 0; color: #333; }
        .creds span { font-weight: bold; color: #6a49a9; }
        .footer     { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        .btn        { display: inline-block; background: #6a49a9; color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ClearMind</h1>
        </div>
        <div class="body">
            @if($isExisting)
                <p>Hi <strong>Dr. {{ $user->firstName }} {{ $user->lastName }}</strong>,</p>
                <p>An admin has re-sent your account credentials. You already have an existing account with us.</p>
            @else
                <p>Hi <strong>Dr. {{ $user->firstName }} {{ $user->lastName }}</strong>,</p>
                <p>Welcome to ClearMind! Your doctor account has been created by an admin. Here are your login credentials:</p>
            @endif

            <div class="creds">
                <p>Email: <span>{{ $user->email }}</span></p>
                <p>Password: <span>{{ $password }}</span></p>
            </div>

            <p>For security, please change your password after your first login.</p>

            <p style="color: #999; font-size: 13px;">
                Note: Your temporary password is based on your date of birth (format: YYYY-MM-DD).
                Please update it immediately after logging in.
            </p>

            <a href="http://localhost:5173/login" class="btn">Login to Your Account</a>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} ClearMind. All rights reserved.</p>
            <p>If you did not expect this email, please ignore it.</p>
        </div>
    </div>
</body>
</html>