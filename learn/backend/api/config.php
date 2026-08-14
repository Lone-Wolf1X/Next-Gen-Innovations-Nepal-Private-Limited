<?php
// backend/api/config.php

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'next_gen_user');
define('DB_PASS', 'NextGen123!@#');
define('DB_NAME', 'next_gen_db');

// Admin Configuration
define('ADMIN_EMAILS', ['abhi.pwn2020@gmail.com']);

function getDbConnection() {
    try {
        $dsn = "pgsql:host=" . DB_HOST . ";dbname=" . DB_NAME;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed"]);
        exit;
    }
}

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function getJsonInput() {
    $raw = file_get_contents("php://input");
    return json_decode($raw, true);
}

// Basic Authentication helper (since full Firebase Admin SDK is not installed)
// For now, we trust the 'uid' passed in headers or body. In production, verify the Firebase ID Token.
function requireAuth() {
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? '';
    
    // Simple bearer extraction
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        // Here you would normally decode and verify the JWT.
        // For simple pass-through, we just assume the token is the UID for now, 
        // OR the frontend sends { uid: "..." } in the body.
        return $matches[1];
    }
    
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
?>
