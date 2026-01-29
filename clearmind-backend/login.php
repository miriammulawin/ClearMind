<?php
// =======================
// CORS CONFIGURATION
// =======================
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origins = ['http://localhost:5173'];

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
require 'database.php';

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

if (!$email || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit();
}

// =======================
// LOGIN FUNCTION
// =======================
function attemptLogin($pdo, $table, $emailColumn, $passwordColumn, $roleName) {
    global $email, $password;

    $stmt = $pdo->prepare("SELECT * FROM $table WHERE $emailColumn = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user) return null;

    if (!password_verify($password, $user[$passwordColumn])) {
        echo json_encode([
            "success" => false,
            "message" => "Incorrect password."
        ]);
        exit();
    }

    $_SESSION['role'] = $roleName;
    $_SESSION['email'] = $email;

    logLogin($email, $roleName, 'SUCCESS');

    echo json_encode([
        "success" => true,
        "role" => $roleName
    ]);
    exit();
}

// =======================
// ROLE CHECKS
// =======================
attemptLogin($pdo, "admin", "email", "password", "Admin");
attemptLogin($pdo, "doctors", "email_address", "password", "Doctor");
attemptLogin($pdo, "client", "email_address", "password", "Client");

// =======================
// EMAIL NOT FOUND
// =======================
logLogin($email, 'UNKNOWN', 'FAILED');

echo json_encode([
    "success" => false,
    "message" => "Email does not exist."
]);
exit();
