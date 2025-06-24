<?php
require 'db_connection.php';
header('Content-Type: application/json');

$mode = $_GET['mode'] ?? 'movies';
$searchTerm = $_GET['term'] ?? '';

if ($mode !== 'books' && $mode !== 'movies') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid mode']);
    exit;
}

if (empty($searchTerm)) {
    echo json_encode([]);
    exit;
}

$likeTerm = '%' . $searchTerm . '%';

try {
    if ($mode === 'books') {
        $sql = "SELECT book_id AS id, title, author, cover_image_url AS image_url FROM books WHERE title LIKE ? OR author LIKE ? LIMIT 20";
    } else {
        $sql = "SELECT item_id AS id, title, director, poster_url AS image_url FROM movies_tv WHERE title LIKE ? OR director LIKE ? LIMIT 20";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$likeTerm, $likeTerm]);
    $results = $stmt->fetchAll();


    error_log("Search Results from API:");
    error_log(print_r($results, true));

    echo json_encode($results);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>