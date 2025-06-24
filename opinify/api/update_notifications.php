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
   $emailNotifications = $data['emailNotifications'] ?? 0;
   $followerNotifications = $data['followerNotifications'] ?? 0;
   $likeNotifications = $data['likeNotifications'] ?? 0;
   $recommendationNotifications = $data['recommendationNotifications'] ?? 0;

   
   $emailNotifications = (int) $emailNotifications;
   $followerNotifications = (int) $followerNotifications;
   $likeNotifications = (int) $likeNotifications;
   $recommendationNotifications = (int) $recommendationNotifications;

   
   if ($emailNotifications !== 0 && $emailNotifications !== 1 ||
       $followerNotifications !== 0 && $followerNotifications !== 1 ||
       $likeNotifications !== 0 && $likeNotifications !== 1 ||
       $recommendationNotifications !== 0 && $recommendationNotifications !== 1) {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid value for notification setting']);
       exit;
   }

   try {
       
       $stmt = $pdo->prepare("UPDATE users SET email_notifications = ?, follower_notifications = ?, like_notifications = ?, recommendation_notifications = ? WHERE user_id = ?");
       $stmt->execute([$emailNotifications, $followerNotifications, $likeNotifications, $recommendationNotifications, $userId]);

       echo json_encode(['message' => 'Notification preferences updated successfully']);

   } catch (PDOException $e) {
       http_response_code(500);
       echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
   }
   ?>