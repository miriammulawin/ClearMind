<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();
require 'database.php'; // $pdo connection

// =======================
// CORS
// =======================
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origins = ['http://localhost:5173'];
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(["success" => true]);
    exit();
}

// =======================
// Check session
// =======================
if (!isset($_SESSION['role']) || !isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$role = $_SESSION['role'];
$user_id = $_SESSION['user_id'];

// =======================
// Read current_login.json
// =======================
$currentLoginFile = __DIR__ . '/current_login.json';
if (!file_exists($currentLoginFile)) {
    echo json_encode(["error" => "No current login found"]);
    exit;
}

$currentLogins = json_decode(file_get_contents($currentLoginFile), true);

if (!isset($currentLogins[$role])) {
    echo json_encode(["error" => "No login for this role"]);
    exit;
}

// =======================
// Fetch full user info from DB using PDO
// =======================
try {
    switch ($role) {
        case 'Admin':
            $sql = "SELECT ad_username, first_name, last_name, email, phone, profile_pic FROM admin WHERE ad_username = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id' => $user_id]);
            break;

        case 'Doctor':
            $sql = "SELECT doctors_id, first_name, last_name, email_address AS email, phone AS contact, profile_pic FROM doctors WHERE doctors_id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id' => $user_id]);
            break;

        case 'Client':
            $sql = "SELECT client_id, first_name, last_name, email_address AS email, phone AS contact, profile_pic FROM client WHERE client_id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id' => $user_id]);
            break;

        default:
            throw new Exception("Invalid role");
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    // Combine first_name + last_name for display
    $user['name'] = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));

if (empty($user['profile_pic'])) {
    $user['profile_pic'] = "http://localhost/clearmind-backend/default-profile-pic.png";
} else {
    $user['profile_pic'] = "http://localhost/clearmind-backend/" . $user['profile_pic'];
}


    echo json_encode([
        "name" => $user['name'],
        "email" => $user['email'] ?? '',
        "contact" => $user['phone'] ?? $user['contact'] ?? '',
        "profile_picture" => $user['profile_pic']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
