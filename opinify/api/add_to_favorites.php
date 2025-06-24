<?php
 error_log("add_to_favorites.php: Start");

 require 'db_connection.php';
 header('Content-Type: application/json');
 session_start();

 error_log("add_to_favorites.php: Session started. user_id: " . ($_SESSION['user_id'] ?? 'NULL'));


 if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Not authenticated']);
  error_log("add_to_favorites.php: Not authenticated");
  exit;
 }

 $data = json_decode(file_get_contents('php://input'), true);

 error_log("add_to_favorites.php: Received data: " . json_encode($data));

 if (!isset($data['item_id'], $data['item_type'], $data['user_id'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing required fields']);
  error_log("add_to_favorites.php: Missing required fields");
  exit;
 }

 $user_id = $data['user_id'];
 $item_id = $data['item_id'];
 $item_type = $data['item_type'];

 try {

  $sql_check = "SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?";
  $stmt_check = $pdo->prepare($sql_check);
  error_log("add_to_favorites.php: SQL (check): " . $sql_check);
  $stmt_check->execute([$user_id, $item_id, $item_type]);
  $is_favorite = $stmt_check->fetchColumn();

  if ($is_favorite) {
  echo json_encode(['message' => 'Already in favorites']);
  error_log("add_to_favorites.php: Already in favorites");
  exit;
  }

  $sql = "INSERT INTO favorites (user_id, item_id, item_type) VALUES (?, ?, ?)";
  $stmt = $pdo->prepare($sql);
  error_log("add_to_favorites.php: SQL (insert): " . $sql);
  $stmt->execute([$user_id, $item_id, $item_type]);

  echo json_encode(['success' => true, 'message' => 'Added to favorites']);
  error_log("add_to_favorites.php: Added to favorites");

 } catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
  error_log("add_to_favorites.php: DB Error: " . $e->getMessage());
 }

 error_log("add_to_favorites.php: End");
 ?>