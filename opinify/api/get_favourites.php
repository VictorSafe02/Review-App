<?php
 require 'db_connection.php';
 header('Content-Type: application/json');
 session_start();


 if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Not authenticated']);
  exit;
 }

 $userId = $_GET['user_id'] ?? $_SESSION['user_id'];
 $mode = $_GET['mode'] ?? 'movies';

 if ($mode !== 'books' && $mode !== 'movies') {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid mode']);
  exit;
 }

 try {
  if ($mode === 'books') {
  $sql = "SELECT b.book_id AS id, b.title, b.author, b.cover_image_url AS image, CAST(b.average_rating AS DECIMAL(10, 2)) AS rating, 'book' AS type
  FROM favorites f
  JOIN books b ON f.item_id = b.book_id AND f.item_type = 'Book'
  WHERE f.user_id = ?";
  } else {
  $sql = "SELECT m.item_id AS id, m.title, m.director AS author, m.poster_url AS image, CAST(m.average_rating AS DECIMAL(10, 2)) AS rating, m.item_type AS type
  FROM favorites f
  JOIN movies_tv m ON f.item_id = m.item_id AND f.item_type = 'MovieTV'
  WHERE f.user_id = ?";
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$userId]);
  $favorites = $stmt->fetchAll();

  echo json_encode($favorites);

 } catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
 }
 ?>