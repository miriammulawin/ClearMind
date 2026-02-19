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
// STORE CURRENT LOGIN (OPTIONAL)
// =======================
function storeCurrentLogin($userId, $role, $email) {
    $file = __DIR__ . '/current_login.json';
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

    $data[$role] = [
        "user_id" => $userId,
        "role" => $role,
        "email" => $email,
        "login_time" => date("Y-m-d H:i:s")
    ];

    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

// =======================
// TOKEN GENERATOR
// =======================
function generateToken() {
    return bin2hex(random_bytes(32));
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
// LOGIN HANDLER
// =======================
function attemptLogin($pdo, $table, $emailColumn, $passwordColumn, $roleName, $idColumn) {
    global $email, $password;

    $stmt = $pdo->prepare("SELECT * FROM $table WHERE $emailColumn = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        return false;
    }

    if (!password_verify($password, $user[$passwordColumn])) {
        logLogin($email, $roleName, "FAILED");
        echo json_encode([
            "success" => false,
            "message" => "Incorrect password."
        ]);
        exit();
    }

    // Generate token
    $token = generateToken();

    // Save token
    $update = $pdo->prepare("UPDATE $table SET api_token = :token WHERE $idColumn = :id");
    $update->execute([
        'token' => $token,
        'id' => $user[$idColumn]
    ]);

    logLogin($email, $roleName, "SUCCESS");
    storeCurrentLogin($user[$idColumn], $roleName, $email);

    echo json_encode([
        "success" => true,
        "token" => $token,
        "role" => $roleName,
        "user_id" => $user[$idColumn],
        "email" => $email
    ]);
    exit();
}

// =======================
// ROLE CHECK ORDER
// =======================
// Admin
attemptLogin($pdo, "admin", "email", "password", "Admin", "ad_username");

// Doctor
attemptLogin($pdo, "doctors", "email_address", "password", "Doctor", "doctors_id");

// Client
attemptLogin($pdo, "client", "email_address", "password", "Client", "client_id");

// =======================
// EMAIL NOT FOUND
// =======================
logLogin($email, "UNKNOWN", "FAILED");

echo json_encode([
    "success" => false,
    "message" => "Email does not exist."
]);
exit();
