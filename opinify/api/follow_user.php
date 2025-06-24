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
    
    if (basename($_SERVER['PHP_SELF']) == 'follow_user.php') {
        $sqlCheck = "SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute([$followerId, $followingId]);

        if ($stmtCheck->fetchColumn()) {
            echo json_encode(['message' => 'Already following']);
            exit;
        }
    }

    $sql = basename($_SERVER['PHP_SELF']) == 'follow_user.php'
        ? "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)"
        : "DELETE FROM followers WHERE follower_id = ? AND following_id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$followerId, $followingId]);

    echo json_encode(['message' => basename($_SERVER['PHP_SELF']) == 'follow_user.php' ? 'Followed successfully' : 'Unfollowed successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>