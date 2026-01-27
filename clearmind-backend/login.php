<?php
// CORS CONFIGURATION
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origins = [
        'http://localhost:5173'
    ];

    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(["success" => true]);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");
session_start();
include 'database.php'; 

// =======================
// LOGGING FUNCTION
// =======================
function logLogin($email, $role, $status) {
    $logFile = __DIR__ . '/login.logs';
    $timestamp = date("Y-m-d H:i:s");
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $logEntry = "[$timestamp] EMAIL: $email | ROLE: $role | STATUS: $status | IP: $ip\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// =======================
// GET INPUT
// =======================
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    logLogin($email ?: 'EMPTY', 'UNKNOWN', 'FAILED');
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit();
}

// =======================
// LOGIN FUNCTION (PDO)
// =======================
function loginUser($pdo, $table, $emailColumn, $passwordColumn) {
    global $email, $password;

    $stmt = $pdo->prepare("SELECT * FROM $table WHERE $emailColumn = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user[$passwordColumn])) {
        return $user;
    }
    return false;
}

// =======================
// CHECK ADMIN
// =======================
$user = loginUser($pdo, "admin", "email", "password");
if ($user) {
    $_SESSION['role'] = "Admin";
    $_SESSION['email'] = $user['email'];

    logLogin($email, 'Admin', 'SUCCESS');

    echo json_encode([
        "success" => true,
        "role" => "Admin",
        "user" => $user
    ]);
    exit();
}

// =======================
// CHECK DOCTOR
// =======================
$user = loginUser($pdo, "doctors", "email_address", "password");
if ($user) {
    $_SESSION['role'] = "Doctor";
    $_SESSION['email'] = $user['email_address'];

    logLogin($email, 'Doctor', 'SUCCESS');

    echo json_encode([
        "success" => true,
        "role" => "Doctor",
        "user" => $user
    ]);
    exit();
}

// =======================
// CHECK CLIENT
// =======================
$user = loginUser($pdo, "client", "email_address", "password");
if ($user) {
    $_SESSION['role'] = "Client";
    $_SESSION['email'] = $user['email_address'];

    logLogin($email, 'Client', 'SUCCESS');

    echo json_encode([
        "success" => true,
        "role" => "Client",
        "user" => $user
    ]);
    exit();
}

// =======================
// INVALID CREDENTIALS
// =======================
logLogin($email, 'UNKNOWN', 'FAILED');

echo json_encode([
    "success" => false,
    "message" => "Invalid credentials. Please try again."
]);
exit();
