<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();


if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

$userId = $_SESSION['user_id'];  
$data = json_decode(file_get_contents('php://input'), true);
$password = $data['password'] ?? '';
$receivedUserId = $data['userId'] ?? null;  


error_log("Delete Account: Received userId = " . $receivedUserId . ", password provided = " . ($password ? 'yes' : 'no'));


if (empty($password) || !$receivedUserId) {  
    http_response_code(400);
    echo json_encode(['error' => 'Password and User ID are required']);
    exit;
}

if ($receivedUserId != $userId) { 
    http_response_code(403); 
    echo json_encode(['error' => 'Unauthorized to delete this account']);
    exit;
}

try {
   
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid password']);
        exit;
    }

   
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("DELETE FROM reviews WHERE user_id = ?");
    $stmt->execute([$userId]);

    $stmt = $pdo->prepare("DELETE FROM favorites WHERE user_id = ?");
    $stmt->execute([$userId]);

    $stmt = $pdo->prepare("DELETE FROM followers WHERE follower_id = ? OR following_id = ?");
    $stmt->execute([$userId, $userId]);

    $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);

    $pdo->commit();


    session_unset();
    session_destroy();

    echo json_encode(['message' => 'Account deleted successfully']);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>
