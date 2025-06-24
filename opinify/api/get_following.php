<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

try {
    $sql = "SELECT
            u.user_id,
            u.username,
            u.profile_picture_url,
            (SELECT COUNT(*) FROM followers WHERE following_id = u.user_id) AS followerCount,
            (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) AS followingCount,
            EXISTS(SELECT 1 FROM followers WHERE follower_id = {$_SESSION['user_id']} AND following_id = u.user_id) AS isFollowing
        FROM
            users u
        JOIN
            followers f ON u.user_id = f.following_id
        WHERE
            f.follower_id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $following = $stmt->fetchAll(PDO::FETCH_ASSOC); 

    echo json_encode($following);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>