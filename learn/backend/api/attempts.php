<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'start') {
        // Fetch user subscription and limits
        $uStmt = $pdo->prepare("SELECT subscription_tier, tests_taken_today, last_test_date FROM users WHERE uid = ?");
        $uStmt->execute([$data['userId']]);
        $user = $uStmt->fetch();

        if ($user) {
            $today = date('Y-m-d');
            $testsTaken = $user['last_test_date'] === $today ? (int)$user['tests_taken_today'] : 0;
            
            // Freemium Limit Logic: 2 free tests per day
            if ($user['subscription_tier'] === 'free' && $testsTaken >= 2) {
                sendJson(["error" => "Daily limit reached. Please upgrade to Premium.", "limitReached" => true], 403);
            }

            // Check for existing in-progress attempt
            $eStmt = $pdo->prepare("SELECT * FROM test_attempts WHERE user_id = ? AND model_set_id = ? AND status = 'in_progress' LIMIT 1");
            $eStmt->execute([$data['userId'], $data['modelSetId']]);
            $existing = $eStmt->fetch();

            if ($existing) {
                $existing['answers'] = json_decode($existing['answers'], true) ?: [];
                $existing['markedForReview'] = json_decode($existing['marked_for_review'], true) ?: [];
                $existing['resumed'] = true;
                sendJson($existing);
            }

            // Create new attempt
            $id = uniqid();
            $stmt = $pdo->prepare("INSERT INTO test_attempts (id, user_id, model_set_id, status, time_remaining_seconds, answers, marked_for_review, total_questions) VALUES (?, ?, ?, ?, ?, '{}', '[]', ?)");
            $stmt->execute([
                $id,
                $data['userId'],
                $data['modelSetId'],
                'in_progress',
                $data['timeLimitMinutes'] * 60,
                $data['totalQuestions']
            ]);

            // Update user daily test count
            $upUser = $pdo->prepare("UPDATE users SET tests_taken_today = ?, last_test_date = ? WHERE uid = ?");
            $upUser->execute([$testsTaken + 1, $today, $data['userId']]);

            sendJson(["id" => $id, "resumed" => false]);
        }
        sendJson(["error" => "User not found"], 404);
    } elseif ($action === 'saveAnswer') {
        $attemptId = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("SELECT answers FROM test_attempts WHERE id = ?");
        $stmt->execute([$attemptId]);
        $row = $stmt->fetch();
        if($row) {
            $answers = json_decode($row['answers'], true) ?: [];
            $answers[$data['questionId']] = $data['selectedOption'];
            
            $uStmt = $pdo->prepare("UPDATE test_attempts SET answers = ?, time_remaining_seconds = ? WHERE id = ?");
            $uStmt->execute([json_encode($answers), $data['timeRemainingSeconds'], $attemptId]);
        }
        sendJson(["success" => true]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getById') {
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM test_attempts WHERE id = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch();
        if ($data) {
            $data['answers'] = json_decode($data['answers'], true) ?: [];
            $data['markedForReview'] = json_decode($data['marked_for_review'], true) ?: [];
            $data['modelSetId'] = $data['model_set_id'];
        }
        sendJson($data ?: null);
    }
}
sendJson(["error" => "Invalid action"], 400);
?>
