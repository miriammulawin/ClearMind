<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClearMind – Doctor Account Created</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', Arial, Helvetica, sans-serif;
            background-color: #f5f3ff;
            color: #1f2937;
            line-height: 1.6;
        }
        .email-wrapper {
            background-color: #f5f3ff;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(124, 58, 237, 0.15);
        }
        .header {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
            padding: 50px 40px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.5;
        }
        .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
            background: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            margin: 0;
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .content {
            padding: 50px 40px;
        }
        .success-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        .success-badge::before {
            content: '✓';
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            font-weight: bold;
        }
        h2 {
            color: #5b21b6;
            font-size: 26px;
            margin: 0 0 30px;
            font-weight: 700;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        p {
            font-size: 16px;
            margin: 0 0 20px;
            color: #6b7280;
            line-height: 1.7;
        }
        .info-card {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            border: 2px solid #d8b4fe;
            border-radius: 16px;
            padding: 24px;
            margin: 30px 0;
            text-align: center;
        }
        .info-card-label {
            font-size: 14px;
            color: #7c3aed;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .password-display {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            color: #5b21b6;
            font-weight: 700;
            letter-spacing: 2px;
            margin-top: 8px;
        }
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            border-radius: 8px;
            margin: 24px 0;
            display: flex;
            align-items: start;
            gap: 12px;
        }
        .warning-box::before {
            content: '⚠️';
            font-size: 20px;
            flex-shrink: 0;
        }
        .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            color: white !important;
            padding: 18px 50px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 17px;
            font-weight: 600;
            margin: 30px 0;
            box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(124, 58, 237, 0.4);
        }
        .link-fallback {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-top: 20px;
        }
        .link-fallback p {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .link-fallback a {
            color: #7c3aed;
            text-decoration: none;
            word-break: break-all;
            font-size: 13px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 40px 0;
        }
        .features {
            display: table;
            width: 100%;
            margin: 30px 0;
        }
        .feature-item {
            display: table;
            width: 100%;
            margin-bottom: 16px;
        }
        .feature-icon {
            display: table-cell;
            width: 40px;
            vertical-align: top;
            padding-right: 16px;
        }
        .feature-icon span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
            border-radius: 10px;
            font-size: 18px;
        }
        .feature-content {
            display: table-cell;
            vertical-align: top;
        }
        .feature-content h3 {
            color: #1f2937;
            font-size: 16px;
            margin: 0 0 4px;
            font-weight: 600;
        }
        .feature-content p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }
        .footer {
            padding: 40px;
            background: #faf8ff;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e9d5ff;
        }
        .footer-brand {
            color: #5b21b6;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 16px;
        }
        .footer p {
            font-size: 13px;
            line-height: 1.6;
        }
        .footer a {
            color: #7c3aed;
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #7c3aed;
            text-decoration: none;
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
            body { 
                background: #0f172a; 
                color: #e2e8f0; 
            }
            .email-wrapper {
                background-color: #0f172a;
            }
            .container { 
                background: #1e293b;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .content p { 
                color: #cbd5e1; 
            }
            h2 { 
                color: #c4b5fd; 
            }
            .greeting {
                color: #f1f5f9;
            }
            .info-card { 
                background: linear-gradient(135deg, #2d1b47 0%, #3b1e5f 100%);
                border-color: #7c3aed;
            }
            .link-fallback {
                background: #1e293b;
                border-color: #334155;
            }
            .footer {
                background: #1e293b;
                border-top-color: #334155;
            }
            .footer p {
                color: #cbd5e1;
            }
            .feature-content h3 {
                color: #f1f5f9;
            }
            .feature-content p {
                color: #cbd5e1;
            }
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            .header {
                padding: 40px 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .logo {
                max-width: 160px;
                padding: 12px 20px;
            }
            .header h1 {
                font-size: 22px;
            }
            h2 {
                font-size: 22px;
            }
            .btn {
                padding: 16px 40px;
                font-size: 16px;
            }
            .footer {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>

<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <img src="{{ $message->embed(public_path('images/clearmind-logo.png')) }}" alt="ClearMind Logo" class="logo">
            <h1>Welcome to ClearMind</h1>
        </div>

        <div class="content">
            <center>
                <span class="success-badge">Account Created</span>
            </center>
            
            <h2>Doctor Account Created Successfully!</h2>

            <p class="greeting">Hi {{ $name }},</p>

            <p>We're excited to welcome you to the ClearMind platform! Your professional psychologist/doctor account has been successfully created and is ready to use.</p>

            <div class="info-card">
                <div class="info-card-label">Your Temporary Password</div>
                <div class="password-display">{{ $temporaryPassword }}</div>
            </div>

            <div class="warning-box">
                <p><strong>Important:</strong> Please change this temporary password immediately after your first login to ensure your account security.</p>
            </div>

            <div class="divider"></div>

            <p style="text-align: center; color: #1f2937; font-weight: 500;">To get started, please verify your email address:</p>

            <center>
                <a href="{{ $verificationUrl }}" class="btn">
                    Verify Email & Activate Account
                </a>
            </center>

            <p style="text-align: center; font-size: 14px; color: #9ca3af;">
                This verification link will expire in 24 hours
            </p>

            <div class="link-fallback">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
            </div>

            <div class="divider"></div>

            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">
                        <span>👤</span>
                    </div>
                    <div class="feature-content">
                        <h3>Complete Your Profile</h3>
                        <p>Add your credentials, specializations, and professional information to help patients find you.</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">
                        <span>📅</span>
                    </div>
                    <div class="feature-content">
                        <h3>Manage Appointments</h3>
                        <p>Set your availability and start accepting patient appointments through our platform.</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">
                        <span>💬</span>
                    </div>
                    <div class="feature-content">
                        <h3>Connect With Patients</h3>
                        <p>Provide quality mental health care through secure video sessions and messaging.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-brand">ClearMind Psychological Services</div>
            
            <p>
                If you did not request this account or have any questions,<br>
                please contact us at <a href="mailto:support@clearmind.ph">support@clearmind.ph</a>
            </p>

            <div class="divider" style="margin: 24px auto; max-width: 200px;"></div>

            <p style="font-size: 12px; color: #9ca3af;">
                © {{ date('Y') }} ClearMind. All rights reserved.<br>
                Professional Mental Health Services Platform
            </p>
        </div>
    </div>
</div>

</body>
</html>