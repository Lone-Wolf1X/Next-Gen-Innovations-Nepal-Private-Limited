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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getStatus') {
        $invite = $_GET['invite'] ?? '';
        if (!$invite) sendJson(["error" => "Missing invite code"], 400);

        $stmt = $pdo->prepare("SELECT * FROM daily_sprints WHERE invite_code = ?");
        $stmt->execute([$invite]);
        $sprint = $stmt->fetch();
        if (!$sprint) sendJson(["error" => "Invalid invite code"], 404);

        $pStmt = $pdo->prepare("SELECT COUNT(*) as count FROM sprint_participants WHERE sprint_id = ?");
        $pStmt->execute([$sprint['id']]);
        $count = (int)$pStmt->fetch()['count'];

        // Get Model Set Title
        $mStmt = $pdo->prepare("SELECT title FROM model_sets WHERE id = ?");
        $mStmt->execute([$sprint['model_set_id']]);
        $ms = $mStmt->fetch();

        // Check if user is enrolled
        $isEnrolled = false;
        if ($uid) {
            $eStmt = $pdo->prepare("SELECT id FROM sprint_participants WHERE sprint_id = ? AND user_id = ?");
            $eStmt->execute([$sprint['id'], $uid]);
            $isEnrolled = $eStmt->fetch() ? true : false;
        }

        sendJson([
            "sprintId" => $sprint['id'],
            "modelSetId" => $sprint['model_set_id'],
            "title" => $ms['title'] ?? 'Daily Sprint',
            "sprintDate" => $sprint['sprint_date'],
            "isUnlocked" => (bool)$sprint['is_unlocked'],
            "threshold" => (int)$sprint['unlock_threshold'],
            "participants" => $count,
            "isEnrolled" => $isEnrolled
        ]);
    } elseif ($action === 'getLeaderboard') {
        $sprintId = $_GET['sprint_id'] ?? '';
        if (!$sprintId) sendJson(["error" => "Missing sprint_id"], 400);

        // Get the model set associated with this sprint
        $sStmt = $pdo->prepare("SELECT model_set_id, time_limit_minutes FROM daily_sprints ms JOIN model_sets m ON ms.model_set_id = m.id WHERE ms.id = ?");
        $sStmt->execute([$sprintId]);
        $sprintData = $sStmt->fetch();
        if (!$sprintData) sendJson(["error" => "Sprint not found"], 404);

        $msId = $sprintData['model_set_id'];
        $maxTimeSec = (int)$sprintData['time_limit_minutes'] * 60;
        
        // Get results for sprint participants on this model set
        $sql = "SELECT u.name, tr.correct_answers, tr.incorrect_answers, tr.accuracy, tr.time_taken_seconds
                FROM test_results tr
                JOIN sprint_participants sp ON tr.user_id = sp.user_id AND sp.sprint_id = ?
                JOIN users u ON tr.user_id = u.uid
                WHERE tr.model_set_id = ?
                ORDER BY tr.completed_at DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$sprintId, $msId]);
        $results = $stmt->fetchAll();

        // Calculate Gamified Score for each and group by user
        $userBestScores = [];
        foreach($results as $r) {
            $correct = (int)$r['correct_answers'];
            $wrong = (int)$r['incorrect_answers'];
            $timeTaken = (int)$r['time_taken_seconds'];
            
            // Sprint Score Logic: (Correct * 10) - (Wrong * 2) + Speed Bonus (0.1 points per sec saved)
            $timeSaved = max(0, $maxTimeSec - $timeTaken);
            $speedBonus = $timeSaved * 0.1;
            
            $score = ($correct * 10) - ($wrong * 2) + $speedBonus;
            
            $uidName = $r['name'];
            if (!isset($userBestScores[$uidName]) || $score > $userBestScores[$uidName]['sprint_score']) {
                $userBestScores[$uidName] = [
                    'name' => $uidName,
                    'correct' => $correct,
                    'wrong' => $wrong,
                    'accuracy' => (float)$r['accuracy'],
                    'time_taken' => $timeTaken,
                    'sprint_score' => round($score, 2)
                ];
            }
        }
        
        $leaderboard = array_values($userBestScores);

        // Sort by sprint_score DESC
        usort($leaderboard, function($a, $b) {
            return $b['sprint_score'] <=> $a['sprint_score'];
        });

        sendJson($leaderboard);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'joinSprint') {
        if (!$uid) sendJson(["error" => "Unauthorized. Please login."], 403);
        
        $invite = $data['invite'] ?? '';
        if (!$invite) sendJson(["error" => "Missing invite code"], 400);

        $stmt = $pdo->prepare("SELECT * FROM daily_sprints WHERE invite_code = ?");
        $stmt->execute([$invite]);
        $sprint = $stmt->fetch();
        
        if (!$sprint) sendJson(["error" => "Invalid invite code"], 404);

        $sprintId = $sprint['id'];

        // Insert participant
        try {
            $pId = uniqid('sp-');
            $insert = $pdo->prepare("INSERT IGNORE INTO sprint_participants (id, sprint_id, user_id) VALUES (?, ?, ?)");
            $insert->execute([$pId, $sprintId, $uid]);
        } catch(PDOException $e) {
            // Might already be enrolled (caught by IGNORE anyway)
        }

        // Check threshold
        $pStmt = $pdo->prepare("SELECT COUNT(*) as count FROM sprint_participants WHERE sprint_id = ?");
        $pStmt->execute([$sprintId]);
        $count = (int)$pStmt->fetch()['count'];

        $threshold = (int)$sprint['unlock_threshold'];
        $unlocked = false;

        if ($count >= $threshold && $sprint['is_unlocked'] == 0) {
            $uStmt = $pdo->prepare("UPDATE daily_sprints SET is_unlocked = 1 WHERE id = ?");
            $uStmt->execute([$sprintId]);
            $unlocked = true;
        } else {
            $unlocked = (bool)$sprint['is_unlocked'];
        }

        sendJson([
            "success" => true,
            "sprintId" => $sprintId,
            "modelSetId" => $sprint['model_set_id'],
            "participants" => $count,
            "threshold" => $threshold,
            "isUnlocked" => $unlocked
        ]);
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
