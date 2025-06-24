<?php
require 'db_connection.php';
header('Content-Type: application/json');
session_start();  

$data = json_decode(file_get_contents('php://input'), true);


if (!isset($data['item_id'], $data['item_type'], $data['rating'], $data['title'], $data['content'])) { 
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}


$user_id = $_SESSION['user_id'] ?? null;  
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$item_id = $data['item_id'];
$item_type = $data['item_type'];
$rating = $data['rating'];
$title = $data['title'];
$content = $data['content'];
$pros = $data['pros'] ?? null;
$cons = $data['cons'] ?? null;

try {
    
    $sql = "INSERT INTO reviews (user_id, item_id, item_type, rating, title, content, pros, cons) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $item_id, $item_type, $rating, $title, $content, is_array($pros) ? json_encode($pros) : $pros, is_array($cons) ? json_encode($cons) : $cons]);

    
    $sql = "SELECT AVG(rating) AS average_rating FROM reviews WHERE item_id = ? AND item_type = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$item_id, $item_type]);
    $result = $stmt->fetch();
    $average_rating = $result['average_rating'];

    
    if ($item_type === 'Book') {
        $updateSql = "UPDATE books SET average_rating = ? WHERE book_id = ?";
    } else {
        $updateSql = "UPDATE movies_tv SET average_rating = ? WHERE item_id = ?";
    }
    $stmt = $pdo->prepare($updateSql);
    $stmt->execute([$average_rating, $item_id]);

    echo json_encode(['message' => 'Review submitted successfully', 'average_rating' => $average_rating]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>