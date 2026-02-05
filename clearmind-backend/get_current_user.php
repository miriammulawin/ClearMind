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
    error_log("Unauthorized: No session - Role: " . ($_SESSION['role'] ?? 'not set') . ", User ID: " . ($_SESSION['user_id'] ?? 'not set'));
    echo json_encode(["error" => "Unauthorized - No session found"]);
    exit;
}

$role = $_SESSION['role'];
$user_id = $_SESSION['user_id'];

// Debug: log what we have in session
error_log("=== GET CURRENT USER DEBUG ===");
error_log("Session role: " . $role);
error_log("Session user_id: " . $user_id);

// =======================
// Fetch full user info from DB using PDO
// =======================
try {
    $user = null;
    
    switch ($role) {
        case 'Admin':
            $sql = "SELECT ad_username, first_name, last_name, email, phone, profile_pic FROM admin WHERE ad_username = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id' => $user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Admin query executed for ID: " . $user_id);
            break;

        case 'Doctor':
            // For doctors, get the license number instead of email/phone
            // CHANGED: license_no -> license_number (to match your database)
            $sql = "SELECT doctors_id, first_name, last_name, license_number, profile_pic FROM doctors WHERE doctors_id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id' => $user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Doctor query executed for ID: " . $user_id);
            error_log("Doctor query result: " . ($user ? json_encode($user) : 'NULL'));
            break;

        case 'Client':
            $sql = "SELECT client_id, first_name, last_name, email_address, phone, profile_pic FROM client WHERE client_id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id' => $user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Client query executed for ID: " . $user_id);
            break;

        default:
            throw new Exception("Invalid role: " . $role);
    }

    if (!$user) {
        error_log("ERROR: No user found in database for role: " . $role . " with ID: " . $user_id);
        http_response_code(404);
        echo json_encode(["error" => "User not found in database"]);
        exit;
    }

    // Combine first_name + last_name for display
    $firstName = $user['first_name'] ?? '';
    $lastName = $user['last_name'] ?? '';
    $fullName = trim($firstName . ' ' . $lastName);
    
    if (empty($fullName)) {
        $fullName = "User"; // Fallback if no name
    }
    
    // Add "Doc." prefix for doctors
    if ($role === 'Doctor') {
        $fullName = "Doc. " . $fullName;
    }

    // Handle profile picture
    $profilePicPath = $user['profile_pic'] ?? '';
    if (empty($profilePicPath)) {
        $profilePicture = "http://localhost/Clearmind/clearmind-backend/default-profile-pic.png";
    } else {
        // Check if it's already a full URL
        if (strpos($profilePicPath, 'http://') === 0 || strpos($profilePicPath, 'https://') === 0) {
            $profilePicture = $profilePicPath;
        } else {
            $profilePicture = "http://localhost/Clearmind/clearmind-backend/" . $profilePicPath;
        }
    }

    // Build response based on role
    $response = [
        "name" => $fullName,
        "profile_picture" => $profilePicture,
        "role" => $role
    ];

    if ($role === 'Admin') {
        // For Admin: show email and phone
        $response["email"] = $user['email'] ?? '';
        $response["contact"] = $user['phone'] ?? '';
        $response["display_type"] = "contact"; // Flag for frontend
    } elseif ($role === 'Doctor') {
        // For Doctor: show license number only
        // CHANGED: license_no -> license_number (to match your database)
        $response["license"] = $user['license_number'] ?? '';
        $response["display_type"] = "license"; // Flag for frontend
    } elseif ($role === 'Client') {
        // For Client: show email and phone
        $response["email"] = $user['email_address'] ?? '';
        $response["contact"] = $user['phone'] ?? '';
        $response["display_type"] = "contact"; // Flag for frontend
    }

    error_log("SUCCESS: Sending response: " . json_encode($response));
    echo json_encode($response);

} catch (Exception $e) {
    error_log("EXCEPTION in get_current_user.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>