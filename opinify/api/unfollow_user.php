<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();


if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$followerId = $_SESSION['user_id'];
$followingId = $_GET['following_id'] ?? null;

if (!$followingId) {
    http_response_code(400);
    echo json_encode(['error' => 'Following ID required']);
    exit;
}

if ($followerId == $followingId) {
    http_response_code(400);
    echo json_encode(['error' => 'Cannot follow yourself']);
    exit;
}

try {

    $sqlCheck = "SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?";
    $stmtCheck = $pdo->prepare($sqlCheck);
    $stmtCheck->execute([$followerId, $followingId]);

    if (!$stmtCheck->fetchColumn()) {  
        echo json_encode(['message' => 'Not following']);
        exit;
    }

    $sql = "DELETE FROM followers WHERE follower_id = ? AND following_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$followerId, $followingId]);

    echo json_encode(['message' => 'Unfollowed successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>