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
// DATABASE CONNECTION
// ==========================
require 'database.php'; // your PDO connection

// ==========================
// GET POST DATA
// ==========================
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['doctors_id']) || !isset($input['status'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request data"
    ]);
    exit();
}

$doctor_id = intval($input['doctors_id']);
$status = $input['status'] === 'active' ? 'active' : 'inactive'; // sanitize status

try {
    $stmt = $pdo->prepare("UPDATE doctors SET status = :status WHERE doctors_id = :id");
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $doctor_id);
    $stmt->execute();

    echo json_encode([
        "status" => "success",
        "message" => "Doctor status updated successfully",
        "new_status" => $status
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
