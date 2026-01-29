<?php
require 'database.php';

// =======================
// CORS HEADERS (MUST BE FIRST)
// =======================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$first_name = trim($data['first_name']);
$last_name  = trim($data['last_name']);
$middle     = $data['middle_initial'] ?? null;
$sex        = $data['sex'] ?? null;
$dob        = $data['date_of_birth'] ?? null;
$email      = trim($data['email_address']);
$phone      = $data['phone'] ?? null;
$address    = $data['address'] ?? null;
$password   = password_hash($data['password'], PASSWORD_DEFAULT);

// Auto-calculate age
$age = null;
if ($dob) {
    $age = date_diff(date_create($dob), date_create('today'))->y;
}

// Check if email exists
$stmt = $pdo->prepare("SELECT client_id FROM client WHERE email_address = ?");
$stmt->execute([$email]);

if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

// Insert client
$insert = $pdo->prepare("
    INSERT INTO client
    (first_name, last_name, middle_initial, sex, date_of_birth, age, email_address, phone, address, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$insert->execute([
    $first_name,
    $last_name,
    $middle,
    $sex,
    $dob,
    $age,
    $email,
    $phone,
    $address,
    $password
]);

echo json_encode([
    "status" => "success",
    "message" => "Client registered successfully"
]);
