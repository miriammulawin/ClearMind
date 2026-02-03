<?php
// CORS CONFIGURATION - MUST BE FIRST!
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// Start session AFTER headers
session_start();

// Database connection inline (to avoid include issues)
$host = "localhost";    
$db   = "ClearMindWebsite"; 
$user = "root";          
$pass = "root";             
$charset = "utf8mb4";    

try { 
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,      
        PDO::ATTR_EMULATE_PREPARES   => false,                  
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection error"]);
    exit();
}

// LOGGING FUNCTION
function logLogin($email, $role, $status) {
    $logFile = __DIR__ . '/login.logs';
    $timestamp = date("Y-m-d H:i:s");
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $logEntry = "[$timestamp] EMAIL: $email | ROLE: $role | STATUS: $status | IP: $ip\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// GET INPUT
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

// LOGIN FUNCTION (PDO)
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

// CHECK ADMIN
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

// CHECK DOCTOR
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

// CHECK CLIENT
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

// INVALID CREDENTIALS
logLogin($email, 'UNKNOWN', 'FAILED');

echo json_encode([
    "success" => false,
    "message" => "Invalid credentials. Please try again."
]);
exit();
?>