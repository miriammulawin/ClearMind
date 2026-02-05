<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once __DIR__ . "/database.php";

// Check if POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}

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
    if (!is_dir($dir)) mkdir($dir, 0755, true);
}

// -------------------------------
// FILE VALIDATION FUNCTION
// -------------------------------
function validateImage($file, $maxSize = 5242880) { // 5MB
    $allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    if ($file['size'] > $maxSize) {
        return false;
    }
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowed)) {
        return false;
    }
    
    // Verify it's actually an image
    if (!getimagesize($file['tmp_name'])) {
        return false;
    }
    
    return true;
}

// -------------------------------
// PROFILE PICTURE
// -------------------------------
$profilePicPath = null;
if (!empty($_FILES['profile_pic']['name'])) {
    if (!validateImage($_FILES['profile_pic'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid profile picture. Must be JPG, PNG, or WEBP under 5MB"
        ]);
        exit;
    }
    
    $ext = pathinfo($_FILES['profile_pic']['name'], PATHINFO_EXTENSION);
    $profileName = uniqid("profile_") . "." . $ext;
    $profilePicPath = $profileDir . $profileName;
    
    if (!move_uploaded_file($_FILES['profile_pic']['tmp_name'], $profilePicPath)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to upload profile picture"
        ]);
        exit;
    }
}

// -------------------------------
// CERTIFICATE IMAGE
// -------------------------------
$certImagePath = null;
if (!empty($_FILES['cert_image']['name'])) {
    if (!validateImage($_FILES['cert_image'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid certificate image. Must be JPG, PNG, or WEBP under 5MB"
        ]);
        exit;
    }
    
    $ext = pathinfo($_FILES['cert_image']['name'], PATHINFO_EXTENSION);
    $certName = uniqid("cert_") . "." . $ext;
    $certImagePath = $certDir . $certName;
    
    if (!move_uploaded_file($_FILES['cert_image']['tmp_name'], $certImagePath)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to upload certificate image"
        ]);
        exit;
    }
}

// -------------------------------
// HANDLE ARRAY FIELDS (fields with + button)
// -------------------------------
// These fields can have multiple values from the frontend
// Convert arrays to CSV strings for database storage

// Specialization (can be multiple)
$specialization = null;
if (isset($_POST['specialization'])) {
    if (is_array($_POST['specialization'])) {
        // Filter out empty values and join with comma
        $specs = array_filter($_POST['specialization'], function($val) {
            return !empty(trim($val));
        });
        $specialization = implode(',', array_map('trim', $specs));
    } else {
        $specialization = trim($_POST['specialization']);
    }
}

// Sub-specialization (can be multiple)
$subSpecId = null;
if (isset($_POST['sub_spec_id'])) {
    if (is_array($_POST['sub_spec_id'])) {
        $subSpecs = array_filter($_POST['sub_spec_id'], function($val) {
            return !empty(trim($val));
        });
        $subSpecId = implode(',', array_map('trim', $subSpecs));
    } else {
        $subSpecId = trim($_POST['sub_spec_id']);
    }
}

// Board Certificates (can be multiple)
$boardCertId = null;
if (isset($_POST['board_cert_id'])) {
    if (is_array($_POST['board_cert_id'])) {
        $certs = array_filter($_POST['board_cert_id'], function($val) {
            return !empty(trim($val));
        });
        $boardCertId = implode(',', array_map('trim', $certs));
    } else {
        $boardCertId = trim($_POST['board_cert_id']);
    }
}

// Services (can be multiple)
$serviceId = null;
if (isset($_POST['service_id'])) {
    if (is_array($_POST['service_id'])) {
        $services = array_filter($_POST['service_id'], function($val) {
            return !empty(trim($val));
        });
        $serviceId = implode(',', array_map('trim', $services));
    } else {
        $serviceId = trim($_POST['service_id']);
    }
}

// -------------------------------
// VALIDATE REQUIRED FIELDS
// -------------------------------
$errors = [];

if (empty($_POST['professional_title'])) {
    $errors[] = "Professional title is required";
}

if (empty($_POST['years_of_experience']) || !is_numeric($_POST['years_of_experience'])) {
    $errors[] = "Valid years of experience is required";
}

if (empty($_POST['license_number'])) {
    $errors[] = "License number is required";
}

if (empty($specialization)) {
    $errors[] = "At least one specialization is required";
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Validation failed",
        "errors" => $errors
    ]);
    exit;
}

// -------------------------------
// UPDATE DOCTOR PROFILE
// -------------------------------
try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Get old file paths for deletion
    $stmt = $pdo->prepare("SELECT profile_pic, cert_image FROM doctors WHERE doctors_id = :doctor_id");
    $stmt->execute([":doctor_id" => $doctorId]);
    $oldFiles = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $sql = "UPDATE doctors SET
        description = :description,
        professional_title = :professional_title,
        years_of_experience = :years_of_experience,
        license_number = :license_number,
        specialization = :specialization,
        sub_spec_id = :sub_spec_id,
        board_cert_id = :board_cert_id,
        service_id = :service_id";

    // Only update images if new files were uploaded
    if ($profilePicPath !== null) {
        $sql .= ", profile_pic = :profile_pic";
    }
    if ($certImagePath !== null) {
        $sql .= ", cert_image = :cert_image";
    }

    $sql .= " WHERE doctors_id = :doctor_id";

    $stmt = $pdo->prepare($sql);

    $params = [
        ":description"          => $_POST['description'] ?? null,
        ":professional_title"   => $_POST['professional_title'],
        ":years_of_experience"  => intval($_POST['years_of_experience']),
        ":license_number"       => $_POST['license_number'],
        ":specialization"       => $specialization,
        ":sub_spec_id"          => $subSpecId,
        ":board_cert_id"        => $boardCertId,
        ":service_id"           => $serviceId,
        ":doctor_id"            => $doctorId
    ];

    // Add image params only if uploaded
    if ($profilePicPath !== null) {
        $params[":profile_pic"] = $profilePicPath;
    }
    if ($certImagePath !== null) {
        $params[":cert_image"] = $certImagePath;
    }

    $stmt->execute($params);
    
    // Delete old files if new ones were uploaded
    if ($profilePicPath !== null && !empty($oldFiles['profile_pic']) && file_exists($oldFiles['profile_pic'])) {
        unlink($oldFiles['profile_pic']);
    }
    if ($certImagePath !== null && !empty($oldFiles['cert_image']) && file_exists($oldFiles['cert_image'])) {
        unlink($oldFiles['cert_image']);
    }
    
    // Commit transaction
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Doctor profile updated successfully",
        "data" => [
            "profile_pic_path" => $profilePicPath,
            "certificate_path" => $certImagePath,
            "specializations" => $specialization ? explode(',', $specialization) : [],
            "sub_specializations" => $subSpecId ? explode(',', $subSpecId) : [],
            "board_certificates" => $boardCertId ? explode(',', $boardCertId) : [],
            "services" => $serviceId ? explode(',', $serviceId) : []
        ]
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction
    $pdo->rollBack();
    
    // Delete uploaded files if database update fails
    if ($profilePicPath !== null && file_exists($profilePicPath)) {
        unlink($profilePicPath);
    }
    if ($certImagePath !== null && file_exists($certImagePath)) {
        unlink($certImagePath);
    }
    
    // Log error internally
    error_log("Database error in update_doctor_profile.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update profile. Please try again."
    ]);
}