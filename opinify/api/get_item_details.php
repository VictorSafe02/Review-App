<?php
   
   $db_connection_path = 'db_connection.php';
   require $db_connection_path;
   header('Content-Type: application/json');

   $mode = $_GET['mode'] ?? 'movies';
   $itemId = intval($_GET['id'] ?? 0);

   if ($mode !== 'books' && $mode !== 'movies') {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid mode']);
       exit;
   }

   if ($itemId <= 0) {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid item ID']);
       exit;
   }

   try {
       if ($mode === 'books') {
           $sql = "SELECT 
                   book_id AS id, 
                   title, 
                   author, 
                   description, 
                   cover_image_url AS image, 
                   publication_year AS year,
                   CAST(average_rating AS DECIMAL(10, 2)) AS rating,  
                   (SELECT COUNT(*) FROM reviews WHERE item_id = ? AND item_type = 'Book') AS reviewCount
               FROM books 
               WHERE book_id = ?";
       } else {
           $sql = "SELECT 
                   item_id AS id, 
                   title, 
                   director, 
                   description, 
                   poster_url AS image, 
                   release_year AS year, 
                   item_type AS type,
                   CAST(average_rating AS DECIMAL(10, 2)) AS rating, 
                   (SELECT COUNT(*) FROM reviews WHERE item_id = ? AND item_type = 'MovieTV') AS reviewCount
               FROM movies_tv 
               WHERE item_id = ?";
       }

       $stmt = $pdo->prepare($sql);
       $stmt->execute([$itemId, $itemId]);
       $item = $stmt->fetch();

       if ($item) {
           echo json_encode($item);
       } else {
           http_response_code(404);
           echo json_encode(['error' => 'Item not found']);
       }

   } catch (PDOException $e) {
       http_response_code(500);
       echo json_encode(['error' => 'DB Error: ' . $e->getMessage()]);
   }
   ?>