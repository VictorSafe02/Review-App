<?php
require 'db_connection.php';
header('Content-Type: application/json');

$mode = $_GET['mode'] ?? 'movies';
$itemId = intval($_GET['id'] ?? 0);

if ($mode !== 'books' && $mode !== 'movies' || $itemId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

try {
    if ($mode === 'books') {
        $sql = "SELECT book_id AS id, title, author, cover_image_url AS image_url
                FROM books
                WHERE genre = (SELECT genre FROM books WHERE book_id = ?)
                AND book_id != ?
                LIMIT 10"; 
    } else {
        $sql = "SELECT item_id AS id, title, director, poster_url AS image_url
                FROM movies_tv
                WHERE genre = (SELECT genre FROM movies_tv WHERE item_id = ?)
                AND item_id != ?
                LIMIT 10";  
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$itemId, $itemId]);
    $similarItems = $stmt->fetchAll();

    echo json_encode($similarItems);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>