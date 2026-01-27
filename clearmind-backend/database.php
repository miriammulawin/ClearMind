<?php
$host = "localhost";    
$db   = "ClearMindWebsite"; 
$user = "root";          
$pass = "liezel11";             
$charset = "utf8mb4";    

try { 
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,      
        PDO::ATTR_EMULATE_PREPARES   => false,                  
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

    echo "Database connected successfully!";
} catch (PDOException $e) {

    echo "Connection failed: " . $e->getMessage();
}
?>
