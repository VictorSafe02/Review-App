<?php
   require 'db_connection.php';  
   header('Content-Type: application/json');
   session_start();

  
   if (!isset($_SESSION['user_id'])) {
       http_response_code(401);  
       echo json_encode(['error' => 'Not authenticated']);
       exit;
   }

   $userId = $_SESSION['user_id'];

   
   $data = json_decode(file_get_contents('php://input'), true);
   $newUsername = $data['username'] ?? '';
   $newEmail = $data['email'] ?? '';

   
   if (empty($newUsername) || empty($newEmail)) {
       http_response_code(400);  
       echo json_encode(['error' => 'Username and email are required']);
       exit;
   }

   $newUsername = htmlspecialchars(trim($newUsername));
   $newEmail = filter_var($newEmail, FILTER_SANITIZE_EMAIL);

   if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid email format']);
       exit;
   }

   try {
       
       $stmt = $pdo->prepare("SELECT user_id FROM users WHERE (username = ? OR email = ?) AND user_id != ?");
       $stmt->execute([$newUsername, $newEmail, $userId]);
       if ($stmt->fetch()) {
           http_response_code(409);  
           echo json_encode(['error' => 'Username or email already exists']);
           exit;
       }

       
       $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE user_id = ?");
       $stmt->execute([$newUsername, $newEmail, $userId]);

       echo json_encode(['message' => 'Account updated successfully']);

   } catch (PDOException $e) {
       http_response_code(500);
       echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
   }
?>