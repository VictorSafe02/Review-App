<?php
 require 'db_connection.php';
 header('Content-Type: application/json');
 session_start();

 $username_or_email = $_POST['username_or_email'] ?? '';
 $password = $_POST['password'] ?? '';

 if (empty($username_or_email) || empty($password)) {
  http_response_code(400);
  echo json_encode(['error' => 'Username/email and password are required']);
  exit;
 }

 try {
  $stmt = $pdo->prepare("SELECT user_id, username, email, password_hash FROM users WHERE username = ? OR email = ?");
  $stmt->execute([$username_or_email, $username_or_email]);
  $user = $stmt->fetch();

  if ($user && password_verify($password, $user['password_hash'])) {

  $_SESSION['user_id'] = $user['user_id'];
  $_SESSION['username'] = $user['username'];
  session_regenerate_id(true);

  $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
  $updateStmt->execute([$user['user_id']]);

 
  echo json_encode(['message' => 'Login successful', 'user_id' => $user['user_id']]);
  } else {
  http_response_code(401);
  echo json_encode(['error' => 'Invalid credentials']);
  }

 } catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
 }
 ?>