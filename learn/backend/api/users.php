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
            $data['avatarUrl'] = $data['avatar_url'];
            $data['phoneNumber'] = $data['phone_number'];
        }
        sendJson($data ?: null);
    } elseif ($action === 'getLeaderboard') {
        $stmt = $pdo->prepare("SELECT name, photo_url as photoUrl, total_points as totalPoints, current_streak as currentStreak FROM users ORDER BY total_points DESC LIMIT 10");
        $stmt->execute();
        sendJson($stmt->fetchAll());
    } elseif ($action === 'getAnalytics') {
        $uid = $_GET['uid'] ?? '';
        if (!$uid) sendJson(["error" => "UID required"], 400);

        // Fetch last 7 test scores for trend chart
        $stmt = $pdo->prepare("SELECT score_percentage, completed_at FROM test_results WHERE user_id = ? ORDER BY completed_at ASC LIMIT 10");
        $stmt->execute([$uid]);
        $recentScores = $stmt->fetchAll();

        // Fetch all question reviews from recent 10 tests to determine weak/strong subjects
        $stmt2 = $pdo->prepare("SELECT question_review FROM test_results WHERE user_id = ? ORDER BY completed_at DESC LIMIT 10");
        $stmt2->execute([$uid]);
        $results = $stmt2->fetchAll();

        $subjectStats = [];
        $totalTestsCount = count($results);

        foreach ($results as $row) {
            $reviews = json_decode($row['question_review'], true);
            if (!is_array($reviews)) continue;

            foreach ($reviews as $q) {
                $subId = $q['subjectId'] ?? 'General';
                if (!isset($subjectStats[$subId])) {
                    $subjectStats[$subId] = ['correct' => 0, 'total' => 0, 'subjectId' => $subId];
                }
                $subjectStats[$subId]['total']++;
                if ($q['status'] === 'correct') {
                    $subjectStats[$subId]['correct']++;
                }
            }
        }

        // Calculate accuracy per subject
        foreach ($subjectStats as &$stat) {
            $stat['accuracy'] = $stat['total'] > 0 ? round(($stat['correct'] / $stat['total']) * 100, 1) : 0;
        }

        // Fetch subject names
        if (count($subjectStats) > 0) {
            $subIds = array_keys($subjectStats);
            $inQuery = implode(',', array_fill(0, count($subIds), '?'));
            $stmt3 = $pdo->prepare("SELECT id, name FROM subjects WHERE id IN ($inQuery)");
            $stmt3->execute($subIds);
            $subNames = $stmt3->fetchAll(PDO::FETCH_KEY_PAIR);

            foreach ($subjectStats as &$stat) {
                $stat['subjectName'] = $subNames[$stat['subjectId']] ?? 'General Knowledge';
            }
        }

        usort($subjectStats, fn($a, $b) => $a['accuracy'] <=> $b['accuracy']);

        $weakSubjects = array_slice($subjectStats, 0, 3); // Lowest accuracy
        $strongSubjects = array_slice(array_reverse($subjectStats), 0, 3); // Highest accuracy

        // Calculate average score overall
        $stmt4 = $pdo->prepare("SELECT AVG(score_percentage) as avg_score FROM test_results WHERE user_id = ?");
        $stmt4->execute([$uid]);
        $avgScore = round($stmt4->fetch()['avg_score'] ?? 0, 1);

        sendJson([
            "recentScores" => $recentScores,
            "weakSubjects" => $weakSubjects,
            "strongSubjects" => $strongSubjects,
            "averageScore" => $avgScore,
            "totalTests" => $totalTestsCount
        ]);
    } elseif ($action === 'getAllUsers') {
        $uid = requireAuth();
        $uStmt = $pdo->prepare("SELECT email FROM users WHERE uid = ?");
        $uStmt->execute([$uid]);
        $user = $uStmt->fetch();
        if (!$user || !in_array($user['email'], ADMIN_EMAILS)) {
            sendJson(["error" => "Unauthorized. Admin only."], 403);
        }

        $stmt = $pdo->prepare("SELECT uid, name, email, subscription_tier, total_tests_completed, total_points, created_at FROM users ORDER BY created_at DESC");
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

        $stmt = $pdo->prepare("INSERT IGNORE INTO users (uid, name, email, photo_url, role) VALUES (?, ?, ?, ?, ?)");
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
        
        // Check if profile is completed
        $cStmt = $pdo->prepare("SELECT nickname, phone_number, gender FROM users WHERE uid = ?");
        $cStmt->execute([$uid]);
        $uInfo = $cStmt->fetch();
        $profileCompleted = !empty($uInfo['nickname']) && !empty($uInfo['phone_number']) && !empty($uInfo['gender']);
        
        sendJson(["success" => true, "profileCompleted" => $profileCompleted]);
    } elseif ($action === 'completeProfile') {
        $uid = requireAuth();
        $data = getJsonInput();
        $nickname = trim($data['nickname'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $gender = trim($data['gender'] ?? '');
        $avatarUrl = trim($data['avatarUrl'] ?? '');
        
        if (empty($nickname) || empty($phone) || empty($gender)) {
            sendJson(["error" => "Nickname, phone number, and gender are required"], 400);
        }
        
        $stmt = $pdo->prepare("UPDATE users SET nickname = ?, phone_number = ?, gender = ?, avatar_url = ? WHERE uid = ?");
        $stmt->execute([$nickname, $phone, $gender, $avatarUrl, $uid]);
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
    } elseif ($action === 'updateSubscription') {
        $uid = requireAuth();
        $uStmt = $pdo->prepare("SELECT email FROM users WHERE uid = ?");
        $uStmt->execute([$uid]);
        $adminUser = $uStmt->fetch();
        if (!$adminUser || !in_array($adminUser['email'], ADMIN_EMAILS)) {
            sendJson(["error" => "Unauthorized. Admin only."], 403);
        }

        $data = getJsonInput();
        $targetUid = $data['targetUid'] ?? '';
        $tier = $data['tier'] ?? 'free';

        if (!$targetUid || !in_array($tier, ['free', 'premium'])) {
            sendJson(["error" => "Invalid payload"], 400);
        }

        $stmt = $pdo->prepare("UPDATE users SET subscription_tier = ? WHERE uid = ?");
        $stmt->execute([$tier, $targetUid]);
        sendJson(["success" => true, "tier" => $tier]);
    }
}
sendJson(["error" => "Invalid action"], 400);
?>
