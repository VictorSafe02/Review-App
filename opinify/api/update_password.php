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
   $currentPassword = $data['currentPassword'] ?? '';
   $newPassword = $data['newPassword'] ?? '';

   if (empty($currentPassword) || empty($newPassword)) {
       http_response_code(400); 
       echo json_encode(['error' => 'Current and new passwords are required']);
       exit;
   }

   if (strlen($newPassword) < 8) { 
       http_response_code(400);
       echo json_encode(['error' => 'New password must be at least 8 characters long']);
       exit;
   }

   try {
    
       $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE user_id = ?");
       $stmt->execute([$userId]);
       $user = $stmt->fetch();

       if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
           http_response_code(401); 
           echo json_encode(['error' => 'Invalid current password']);
           exit;
       }

       
       $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    
       $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
       $stmt->execute([$newPasswordHash, $userId]);

       echo json_encode(['message' => 'Password updated successfully']);

   } catch (PDOException $e) {
       http_response_code(500); 
       echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
   }
   ?>