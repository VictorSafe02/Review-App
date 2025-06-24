<?php
  require 'db_connection.php'; 
  header('Content-Type: application/json');

  $username = $_POST['username'] ?? '';
  $email = $_POST['email'] ?? '';
  $password = $_POST['password'] ?? '';

  
  if (empty($username) || empty($email) || empty($password)) {
      http_response_code(400);
      echo json_encode(['error' => 'All fields are required']);
      exit;
  }


  $username = htmlspecialchars(trim($username));
  $email = filter_var($email, FILTER_SANITIZE_EMAIL);

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      echo json_encode(['error' => 'Invalid email']);
      exit;
  }

  try {
      
      $stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
      $stmt->execute([$username, $email]);
      if ($stmt->fetch()) {
          http_response_code(409);
          echo json_encode(['error' => 'Username or email already exists']);
          exit;
      }

      $password_hash = password_hash($password, PASSWORD_DEFAULT);

    
      $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
      $stmt->execute([$username, $email, $password_hash]);

      echo json_encode(['message' => 'Registration successful']);

  } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
  }
  ?>