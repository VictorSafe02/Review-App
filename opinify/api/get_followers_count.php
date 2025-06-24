<?php
require 'db_connection.php';
header('Content-Type: application/json');

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

try {
    $sql = "SELECT COUNT(*) AS count FROM followers WHERE following_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $result = $stmt->fetch();

    echo json_encode(['count' => intval($result['count'])]); 

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>