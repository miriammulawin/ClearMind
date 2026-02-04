<?php
// ==========================
// CORS CONFIGURATION
// ==========================
$allowed_origins = [
    'http://localhost:5173',
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================
// DATABASE (PDO)
// ==========================
require 'database.php';

// ==========================
// PHPMailer
// ==========================
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

// ==========================
// REQUEST METHOD CHECK
// ==========================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit();
}

// ==========================
// INPUT VALIDATION
// ==========================
$data = json_decode(file_get_contents("php://input"), true);

$requiredFields = [
    'firstName',
    'lastName',
    'middleInitial',
    'sex',
    'birthdate',
    'email',
    'contactNumber',
    'specialization'  // Added as required
];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing required field: $field"
        ]);
        exit();
    }
}

// ==========================
// SANITIZE INPUT
// ==========================
$fname          = trim($data['firstName']);
$lname          = trim($data['lastName']);
$mi             = trim($data['middleInitial']);
$sex            = trim($data['sex']);
$birth          = trim($data['birthdate']);
$email          = trim($data['email']);
$phone          = trim($data['contactNumber']);
$specialization = trim($data['specialization']);

$age = date_diff(date_create($birth), date_create('today'))->y;

// ==========================
// TEMP PASSWORD (DOB)
// ==========================
$tempPassword = $birth;
$passwordHash = password_hash($tempPassword, PASSWORD_DEFAULT);

// ==========================
// VALIDATION
// ==========================
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "invalid_email"]);
    exit();
}

if (!preg_match("/^09\d{9}$/", $phone)) {
    echo json_encode(["status" => "invalid_contact"]);
    exit();
}

// ==========================
// CHECK EMAIL DUPLICATE
// ==========================
$checkStmt = $pdo->prepare(
    "SELECT doctors_id FROM doctors WHERE email_address = ?"
);
$checkStmt->execute([$email]);

if ($checkStmt->fetch()) {
    echo json_encode(["status" => "email_exists"]);
    exit();
}

// ==========================
// INSERT DOCTOR (OTHER FIELDS = NULL)
// ==========================
$insertStmt = $pdo->prepare("
    INSERT INTO doctors (
        first_name,
        last_name,
        middle_initial,
        sex,
        date_of_birth,
        age,
        email_address,
        phone,
        specialization,
        description,
        professional_title,
        years_of_experience,
        license_number,
        sub_spec_id,
        board_cert_id,
        service_id,
        cert_image,
        password,
        profile_pic
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL,
        ?, NULL
    )
");

$insertStmt->execute([
    $fname,
    $lname,
    $mi,
    $sex,
    $birth,
    $age,
    $email,
    $phone,
    $specialization,   // <-- Added specialization here
    $passwordHash
]);

// ==========================
// EMAIL SETUP
// ==========================
$title = ($sex === 'Male') ? 'Mr.' : 'Ms.';
$adminName = "ClearMind System Administrator";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contactenvirocool@gmail.com';
    $mail->Password   = 'mfsshdvmycycofgn';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    // FROM ADMIN
    $mail->setFrom(
        'pacienteliezel04@gmail.com',
        'Admin – ClearMind Psychologist Services'
    );

    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'ClearMind Doctor Account Created';

$mail->Body = "
<p>Dear <strong>{$title} {$lname}</strong>,</p>

<p>
We are pleased to inform you that your account with
<strong>ClearMind Psychologist Services</strong> has been successfully created.
</p>

<p>Please use the credentials below to access your account:</p>

<table border='1' cellpadding='6' style='border-collapse: collapse;'>
    <tr>
        <td><strong>Login Email</strong></td>
        <td>{$email}</td>
    </tr>
    <tr>
        <td><strong>Temporary Password</strong></td>
        <td>{$tempPassword}</td>
    </tr>
</table>

<p>
Kindly use these credentials to open your account and complete your profile.
For security purposes, you will be required to change your password after logging in.
</p>

<br>

<p>Sincerely,</p>
<p><strong>{$adminName}</strong></p>
<p><em>Admin – ClearMind Psychologist Services</em></p>
";

    $mail->send();

    echo json_encode([
        "status" => "success",
        "message" => "Doctor account created and email sent successfully."
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "email_failed",
        "message" => $mail->ErrorInfo
    ]);
}