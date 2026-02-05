<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once __DIR__ . "/database.php";

// -------------------------------
// Get current logged-in doctor
// -------------------------------
$loginFile = __DIR__ . "/current_login.json";
if (!file_exists($loginFile)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Login file not found"
    ]);
    exit;
}

$loginData = json_decode(file_get_contents($loginFile), true);
if (empty($loginData['Doctor']['user_id'])) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "No doctor currently logged in"
    ]);
    exit;
}

$doctorId = $loginData['Doctor']['user_id'];

// -------------------------------
// UPLOAD DIRECTORIES
// -------------------------------
$uploadBase = "uploads/";
$profileDir = $uploadBase . "profiles/";
$certDir    = $uploadBase . "certificates/";

// Create folders if not exist
foreach ([$profileDir, $certDir] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
}

// -------------------------------
// PROFILE PICTURE
// -------------------------------
$profilePicPath = null;
if (!empty($_FILES['profile_pic']['name'])) {
    $profileName = uniqid("profile_") . "_" . basename($_FILES['profile_pic']['name']);
    $profilePicPath = $profileDir . $profileName;
    move_uploaded_file($_FILES['profile_pic']['tmp_name'], $profilePicPath);
}

// -------------------------------
// CERTIFICATE IMAGE
// -------------------------------
$certImagePath = null;
if (!empty($_FILES['cert_image']['name'])) {
    $certName = uniqid("cert_") . "_" . basename($_FILES['cert_image']['name']);
    $certImagePath = $certDir . $certName;
    move_uploaded_file($_FILES['cert_image']['tmp_name'], $certImagePath);
}

// -------------------------------
// UPDATE DOCTOR PROFILE
// -------------------------------
$sql = "UPDATE doctors SET
    description = :description,
    professional_title = :professional_title,
    years_of_experience = :years_of_experience,
    license_number = :license_number,
    specialization = :specialization,
    sub_spec_id = :sub_spec_id,
    board_cert_id = :board_cert_id,
    service_id = :service_id,
    profile_pic = :profile_pic,
    cert_image = :cert_image
WHERE doctors_id = :doctor_id";

$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([
        ":description"          => $_POST['description'] ?? null,
        ":professional_title"   => $_POST['professional_title'] ?? null,
        ":years_of_experience"  => $_POST['years_of_experience'] ?? null,
        ":license_number"       => $_POST['license_number'] ?? null,
        ":specialization"       => $_POST['specialization'] ?? null,  // CSV string if multiple
        ":sub_spec_id"          => $_POST['sub_spec_id'] ?? null,      // CSV string if multiple
        ":board_cert_id"        => $_POST['board_cert_id'] ?? null,    // CSV string if multiple
        ":service_id"           => $_POST['service_id'] ?? null,       // CSV string if multiple
        ":profile_pic"          => $profilePicPath,
        ":cert_image"           => $certImagePath,
        ":doctor_id"            => $doctorId
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Doctor profile updated successfully",
        "profile_pic_path" => $profilePicPath,
        "certificate_path" => $certImagePath
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
