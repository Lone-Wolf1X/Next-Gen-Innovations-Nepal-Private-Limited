<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getById') {
        $uid = $_GET['uid'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM users WHERE uid = ?");
        $stmt->execute([$uid]);
        $data = $stmt->fetch();
        if ($data) {
            // Map to JS camelCase
            $data['totalTestsCompleted'] = (int)$data['total_tests_completed'];
            $data['averageScore'] = (float)$data['average_score'];
            $data['bestScore'] = (float)$data['best_score'];
            $data['currentStreak'] = (int)$data['current_streak'];
            $data['totalPoints'] = (int)$data['total_points'];
            $data['subscriptionTier'] = $data['subscription_tier'];
            $data['testsTakenToday'] = (int)$data['tests_taken_today'];
            $data['role'] = $data['role'];
        }
        sendJson($data ?: null);
    } elseif ($action === 'getLeaderboard') {
        $stmt = $pdo->prepare("SELECT name, photo_url as photoUrl, total_points as totalPoints, current_streak as currentStreak FROM users ORDER BY total_points DESC LIMIT 10");
        $stmt->execute();
        sendJson($stmt->fetchAll());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'sync') {
        // Sync Firebase user to SQL if not exists
        $data = getJsonInput();
        $uid = $data['uid'] ?? '';
        $email = $data['email'] ?? '';
        if (!$uid) sendJson(["error" => "UID required"], 400);
        
        $role = in_array($email, ADMIN_EMAILS) ? 'admin' : 'user';

        $stmt = $pdo->prepare("INSERT INTO users (uid, name, email, photo_url, role) VALUES (?, ?, ?, ?, ?) ON CONFLICT (uid) DO NOTHING");
        $stmt->execute([
            $uid,
            $data['name'] ?? 'User',
            $email,
            $data['photoUrl'] ?? '',
            $role
        ]);
        
        // Also update role if they were already inserted but just became admin
        if ($role === 'admin') {
            $uStmt = $pdo->prepare("UPDATE users SET role = 'admin' WHERE uid = ?");
            $uStmt->execute([$uid]);
        }
        
        sendJson(["success" => true]);
    } elseif ($action === 'recordLogin') {
        $data = getJsonInput();
        $uid = $data['uid'] ?? '';
        if (!$uid) sendJson(["error" => "UID required"], 400);

        // Fetch user to check last login date
        $stmt = $pdo->prepare("SELECT last_login_date, current_streak FROM users WHERE uid = ?");
        $stmt->execute([$uid]);
        $user = $stmt->fetch();
        
        if ($user) {
            $today = date('Y-m-d');
            $yesterday = date('Y-m-d', strtotime('-1 days'));
            $lastLogin = $user['last_login_date'];
            $streak = (int)$user['current_streak'];

            if ($lastLogin === $yesterday) {
                $streak++; // Consecutive day
            } elseif ($lastLogin !== $today) {
                $streak = 1; // Streak broken or first login
            }
            // If $lastLogin === $today, do nothing to streak

            $uStmt = $pdo->prepare("UPDATE users SET last_login_date = ?, current_streak = ? WHERE uid = ?");
            $uStmt->execute([$today, $streak, $uid]);
            sendJson(["success" => true, "streak" => $streak]);
        }
        sendJson(["error" => "User not found"], 404);
    }
}
sendJson(["error" => "Invalid action"], 400);
?>
