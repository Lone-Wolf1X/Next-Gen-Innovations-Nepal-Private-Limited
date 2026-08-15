<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

// Check Auth Header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$uid = '';
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $uid = $matches[1];
}

// Function to verify if user is admin
function isAdmin($pdo, $uid) {
    if (!$uid) return false;
    $stmt = $pdo->prepare("SELECT role FROM users WHERE uid = ?");
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    return $user && $user['role'] === 'admin';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getStats') {
        if (!isAdmin($pdo, $uid)) sendJson(["error" => "Unauthorized"], 403);
        
        $stats = [
            'totalUsers' => 0,
            'totalModelSets' => 0,
            'totalQuestions' => 0,
            'totalTestsCompleted' => 0
        ];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $stats['totalUsers'] = (int)$stmt->fetch()['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM model_sets");
        $stats['totalModelSets'] = (int)$stmt->fetch()['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM questions");
        $stats['totalQuestions'] = (int)$stmt->fetch()['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM test_results");
        $stats['totalTestsCompleted'] = (int)$stmt->fetch()['count'];
        
        sendJson($stats);
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
