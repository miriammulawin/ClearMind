<?php
// Allow CORS from your frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require 'database.php';

// =======================
// GET INPUT DATA
// =======================
$data = json_decode(file_get_contents("php://input"), true);

// Sanitize & assign
$first_name = trim($data['first_name'] ?? '');
$last_name  = trim($data['last_name'] ?? '');
$dob        = $data['date_of_birth'] ?? null;
$sex        = $data['sex'] ?? null;
$phone      = trim($data['phone'] ?? '');
$email      = trim($data['email'] ?? '');
$password   = $data['password'] ?? '';

// =======================
// BASIC VALIDATION
// =======================
if (!$first_name || !$last_name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Required fields are missing"]);
    exit;
}

// =======================
// HASH PASSWORD
// =======================
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// =======================
// AUTO CALCULATE AGE
// =======================
$age = null;
if ($dob) {
    $dob_date = date_create($dob);
    $today = date_create('today');
    $age = date_diff($dob_date, $today)->y;
}

// =======================
// CHECK IF EMAIL EXISTS
// =======================
$stmt = $pdo->prepare("SELECT client_id FROM clients WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(["status" => "error", "message" => "Email already registered"]);
    exit;
}

// =======================
// INSERT CLIENT INTO DATABASE
// =======================
$insert = $pdo->prepare("
    INSERT INTO clients
    (first_name, last_name, date_of_birth, sex, age, phone, email, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

try {
    $insert->execute([
        $first_name,
        $last_name,
        $dob,
        $sex,
        $age,
        $phone,
        $email,
        $hashed_password
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Client registered successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
