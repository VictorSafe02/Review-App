<?php
 require 'db_connection.php';
 header('Content-Type: application/json');
 session_start();

 error_log("get_profile_reviews.php: Start");


 if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Not authenticated']);
  error_log("get_profile_reviews.php: Not authenticated");
  exit;
 }

 $userId = $_GET['user_id'] ?? $_SESSION['user_id']; 
 $mode = $_GET['mode'] ?? 'movies';

 error_log("get_profile_reviews.php: userId = " . $userId . ", mode = " . $mode);

 if ($mode !== 'books' && $mode !== 'movies') {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid mode']);
  error_log("get_profile_reviews.php: Invalid mode");
  exit;
 }

 try {
  if ($mode === 'books') {
  $sql = "SELECT r.rating, r.title, r.content, r.review_date, b.book_id AS item_id, b.title AS item_title,
  u.user_id, u.username, u.profile_picture_url
  FROM reviews r
  JOIN books b ON r.item_id = b.book_id AND r.item_type = 'Book'
  JOIN users u ON r.user_id = u.user_id
  WHERE r.user_id = ?";
  } else {
  $sql = "SELECT r.rating, r.title, r.content, r.review_date, m.item_id, m.title AS item_title,
  u.user_id, u.username, u.profile_picture_url
  FROM reviews r
  JOIN movies_tv m ON r.item_id = m.item_id AND r.item_type = 'MovieTV'
  JOIN users u ON r.user_id = u.user_id
  WHERE r.user_id = ?";
  }

  error_log("get_profile_reviews.php: SQL (before prepare) = " . $sql);

  $stmt = $pdo->prepare($sql);

  error_log("get_profile_reviews.php: SQL (after prepare) = " . $sql);

  $stmt->execute([$userId]);

  error_log("get_profile_reviews.php: execute() successful");

  $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);  

  error_log("get_profile_reviews.php: fetchAll() count = " . count($reviews));
  error_log("get_profile_reviews.php: Results (before formatting) = " . json_encode($reviews));

  
  
  $formattedReviews = array_map(function($review) {
  return [
  'rating' => isset($review['rating']) ? (float)$review['rating'] : 0.0,  
  'title' => $review['title'] ?? '',  
  'content' => $review['content'] ?? '',
  'review_date' => $review['review_date'] ?? null,
  'item_id' => isset($review['item_id']) ? (int)$review['item_id'] : 0,
  'item_title' => $review['item_title'] ?? '',
  'user_id' => isset($review['user_id']) ? (int)$review['user_id'] : 0,
  'username' => $review['username'] ?? '',
  'profile_picture_url' => $review['profile_picture_url'] ?? null,
  ];
  }, $reviews);

  error_log("get_profile_reviews.php: Results (after formatting) = " . json_encode($formattedReviews));

  echo json_encode($formattedReviews);

  error_log("get_profile_reviews.php: End");

 } catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
  error_log("get_profile_reviews.php: DB Error: " . $e->getMessage());
 }
 ?>