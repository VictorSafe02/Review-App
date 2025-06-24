<?php


$db_host = 'localhost';     
$db_name = 'opinify_db';
$db_user = 'root'; 
$db_pass = 'root'; 
$charset = 'utf8mb4';

$mysql_port = '8888';
$dsn = "mysql:host=$db_host;port=$mysql_port;dbname=$db_name;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       
    PDO::ATTR_EMULATE_PREPARES   => false,                  
];

try {
     $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    
     http_response_code(500);
     header('Content-Type: application/json'); 
     echo json_encode(['error' => 'Database Connection Error: ' . $e->getMessage()]);
     exit; 
}


?>