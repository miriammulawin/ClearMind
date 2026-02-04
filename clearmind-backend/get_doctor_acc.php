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
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================
// DATABASE CONNECTION
// ==========================
require 'database.php'; // your PDO connection

try {
    // ==========================
    // FETCH DOCTORS WITH STATUS
    // ==========================
    $stmt = $pdo->prepare("
        SELECT 
            doctors_id,
            first_name,
            middle_initial,
            last_name,
            specialization,
            email_address,
            phone,
            status
        FROM doctors
        ORDER BY last_name ASC
    ");

    $stmt->execute();
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ==========================
    // RETURN JSON
    // ==========================
    echo json_encode([
        "status" => "success",
        "data" => $doctors
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
