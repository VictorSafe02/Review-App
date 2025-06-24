<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();


if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NULL WHERE user_id = ?");
    $updateStmt->execute([$userId]);
}

session_unset();
session_destroy();

echo json_encode(['message' => 'Logged out successfully']);
?>