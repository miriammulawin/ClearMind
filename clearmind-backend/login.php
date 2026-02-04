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
// STORE CURRENT LOGIN PER ROLE
// =======================
function storeCurrentLogin($userId, $role, $email) {
    $file = __DIR__ . '/current_login.json';
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    
    $data[$role] = [
        'user_id' => $userId,
        'role' => $role,
        'email' => $email,
        'login_time' => date("Y-m-d H:i:s")
    ];

    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
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
function attemptLogin($pdo, $table, $emailColumn, $passwordColumn, $roleName, $idColumn) {
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

    // Correct ID column
    $userId = $user[$idColumn] ?? $user['ad_username']; // fallback for Admin username

    $_SESSION['role'] = $roleName;
    $_SESSION['email'] = $email;
    $_SESSION['user_id'] = $userId;

    logLogin($email, $roleName, 'SUCCESS');
    storeCurrentLogin($userId, $roleName, $email);

    echo json_encode([
        "success" => true,
        "role" => $roleName,
        "user_id" => $userId,
        "email" => $email
    ]);
    exit();
}

// =======================
// ROLE CHECKS
// =======================
// Note: Admin primary key is ad_username, Doctor is doctors_id, Client is client_id
attemptLogin($pdo, "admin", "email", "password", "Admin", "ad_username");
attemptLogin($pdo, "doctors", "email_address", "password", "Doctor", "doctors_id");
attemptLogin($pdo, "client", "email_address", "password", "Client", "client_id");

// =======================
// EMAIL NOT FOUND
// =======================
logLogin($email, 'UNKNOWN', 'FAILED');

echo json_encode([
    "success" => false,
    "message" => "Email does not exist."
]);
exit();
