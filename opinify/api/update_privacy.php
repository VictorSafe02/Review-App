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
   $publicProfile = $data['publicProfile'] ?? 0;  
   $showActivity = $data['showActivity'] ?? 0;
   $allowFollowers = $data['allowFollowers'] ?? 0;


   $publicProfile = (int) $publicProfile;  
   $showActivity = (int) $showActivity;
   $allowFollowers = (int) $allowFollowers;

   if ($publicProfile !== 0 && $publicProfile !== 1 ||
       $showActivity !== 0 && $showActivity !== 1 ||
       $allowFollowers !== 0 && $allowFollowers !== 1) {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid value for privacy setting']);
       exit;
   }

   try {
       $stmt = $pdo->prepare("UPDATE users SET is_public = ?, activity_status = ?, allow_followers = ? WHERE user_id = ?");
       $stmt->execute([$publicProfile, $showActivity, $allowFollowers, $userId]);

       echo json_encode(['message' => 'Privacy settings updated successfully']);

   } catch (PDOException $e) {
       http_response_code(500);
       echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
   }
   ?>