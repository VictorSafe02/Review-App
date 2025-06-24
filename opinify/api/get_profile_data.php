<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    if (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        exit;
    }
}

error_log("get_profile_data.php: START - Received user_id = " . $userId);

try {
    $sql = "SELECT u.user_id AS id, u.username, u.email, u.profile_picture_url AS profilePicture, u.join_date, u.is_public AS publicProfile, u.activity_status AS showActivity, u.allow_followers,
            u.email_notifications, u.follower_notifications, u.like_notifications, u.recommendation_notifications,
            COUNT(DISTINCT r.review_id) AS reviewCount,
            COUNT(DISTINCT f1.follower_id) AS followerCount,
            COUNT(DISTINCT f2.following_id) AS followingCount,
            EXISTS(SELECT 1 FROM followers WHERE follower_id = {$_SESSION['user_id']} AND following_id = u.user_id) AS isFollowing
            FROM users u
            LEFT JOIN reviews r ON u.user_id = r.user_id
            LEFT JOIN followers f1 ON u.user_id = f1.following_id
            LEFT JOIN followers f2 ON u.user_id = f2.follower_id
            WHERE u.user_id = ?
            GROUP BY u.user_id";

    error_log("get_profile_data.php: SQL Query = " . $sql);

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    error_log("get_profile_data.php: Result of fetch(): " . print_r($user, true));

    if ($user) {
        error_log("get_profile_data.php: About to encode and send: " . json_encode($user));
        echo json_encode($user);
    } else {
        error_log("get_profile_data.php: User not found!");
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }

    error_log("get_profile_data.php: END");

} catch (PDOException $e) {
    error_log("get_profile_data.php: PDOException: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>