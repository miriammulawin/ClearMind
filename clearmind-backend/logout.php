<?php
// Allow your specific frontend origin
header("Access-Control-Allow-Origin: http://localhost:5173");

// Allow credentials (cookies / PHP sessions)
header("Access-Control-Allow-Credentials: true");

// Allow methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Allow headers your request sends
header("Access-Control-Allow-Headers: Content-Type");

// If this is a preflight request (OPTIONS), stop execution
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Destroy the session
session_unset();
session_destroy();

echo json_encode(["message" => "Logged out successfully"]);
?>
