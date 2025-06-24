<?php
require 'db_connection.php';
header('Content-Type: application/json');

$mode = $_GET['mode'] ?? 'movies';
$grouped = $_GET['grouped'] ?? false;

if ($mode !== 'books' && $mode !== 'movies') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid mode']);
    exit;
}

try {
    if ($mode === 'books') {
        $sql = "SELECT book_id AS id, title, author, genre, cover_image_url AS image_url FROM books";
    } else {
        $sql = "SELECT item_id AS id, title, director, genre, poster_url AS image_url FROM movies_tv";
    }

    $stmt = $pdo->query($sql);
    $items = $stmt->fetchAll();

    if ($grouped === 'true') {
        $groupedItems = [];
        foreach ($items as $item) {
            $genre = $item['genre'];
            if ($genre !== null) {
                $category = trim(strtolower($genre)); 
            } else {
                $category = 'uncategorized';
            }
            if (!isset($groupedItems[$category])) {
                $groupedItems[$category] = [];
            }
            
            $newItem = array_diff_key($item, array('genre' => 1));
            $groupedItems[$category][] = $newItem;
        }
        echo json_encode($groupedItems);
    } else {
        echo json_encode($items);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
}
?>