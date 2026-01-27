<?php
require 'db_con.php';

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data['email_address']);
$password = $data['password'];

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

// Fetch client
$stmt = $pdo->prepare("SELECT * FROM clients WHERE email_address = ?");
$stmt->execute([$email]);
$client = $stmt->fetch();

if (!$client || !password_verify($password, $client['password'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// Generate simple token
$token = bin2hex(random_bytes(32));

echo json_encode([
    "status" => "success",
    "message" => "Login successful",
    "token" => $token,
    "client" => [
        "client_id" => $client['client_id'],
        "name" => $client['first_name'] . " " . $client['last_name'],
        "email" => $client['email_address']
    ]
]);
