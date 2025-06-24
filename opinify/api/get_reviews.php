<?php
require 'db_connection.php';
header('Content-Type: application/json');

$mode = $_GET['mode'] ?? 'movies';
$itemId = intval($_GET['id'] ?? 0);

if ($mode !== 'books' && $mode !== 'movies') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid mode']);
    exit;
}

try {
    $itemType = ($mode === 'books' ? 'Book' : 'MovieTV');
    error_log("get_reviews.php: mode = " . $mode . ", itemId = " . $itemId . ", item_type = " . $itemType);

    $sql = "SELECT u.user_id, u.username, r.rating, r.title, r.content, r.pros, r.cons, r.review_date 
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.item_id = ? AND r.item_type = ?
            ORDER BY r.review_date DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$itemId, $itemType]);
    $reviews = $stmt->fetchAll();

    error_log("get_reviews.php: SQL = " . $sql);
    error_log("get_reviews.php: Results = " . json_encode($reviews));

    echo json_encode($reviews);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>