<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();


if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$target_dir = "uploads/";
if (!file_exists($target_dir) && !mkdir($target_dir, 0777, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create upload directory']);
    exit;
}

$max_file_size = 2 * 1024 * 1024;
$allowed_types = ['image/jpeg', 'image/png'];

if (!isset($_FILES['profile_picture'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$uploaded_file = $_FILES['profile_picture'];

if ($uploaded_file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    error_log("Upload error: " . print_r($_FILES['profile_picture']['error'], true));
    echo json_encode(['error' => 'File upload error']);
    exit;
}

if (!in_array($uploaded_file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

if ($uploaded_file['size'] > $max_file_size) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large']);
    exit;
}

$file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
$new_filename = uniqid() . '.' . $file_ext;
$target_file = $target_dir . $new_filename;

if (!move_uploaded_file($uploaded_file['tmp_name'], $target_file)) {
    http_response_code(500);
    error_log("Move_uploaded_file error: " . error_get_last()['message']);
    echo json_encode(['error' => 'Failed to save uploaded file']);
    exit;
}


$upload_url_base = "/opinify/api/uploads/"; 
$profile_picture_url = $upload_url_base . $new_filename;

$user_id = $_SESSION['user_id'];
try {
    $stmt = $pdo->prepare("UPDATE users SET profile_picture_url = ? WHERE user_id = ?");
    $stmt->execute([$profile_picture_url, $user_id]);

    echo json_encode(['success' => true, 'profile_picture_url' => $profile_picture_url]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>