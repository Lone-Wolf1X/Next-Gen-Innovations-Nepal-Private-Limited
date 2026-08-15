<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getByUser') {
        $userId = $_GET['userId'] ?? '';
        $limit = (int)($_GET['limit'] ?? 20);
        $stmt = $pdo->prepare("SELECT * FROM test_results WHERE user_id = ? ORDER BY completed_at DESC LIMIT ?");
        $stmt->bindValue(1, $userId, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll();
        foreach($results as &$r) {
            $r['questionReview'] = json_decode($r['question_review']);
            // Convert snake_case back to camelCase for JS if needed
            $r['scorePercentage'] = $r['score_percentage'];
            $r['modelSetId'] = $r['model_set_id'];
        }
        sendJson($results);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'submit') {
        $data = getJsonInput();
        $attemptId = $data['attemptId'];
        $userId = $data['userId'];
        $modelSetId = $data['modelSetId'];
        $attempt = $data['attempt'];
        $set = $data['set'];
        $questionList = $data['questionList'];

        // Calculate score
        $correct = 0; $incorrect = 0; $unattempted = 0;
        $marksObtained = 0; $negativeMarks = 0;
        $questionReview = [];

        foreach($questionList as $q) {
            $userAnswer = $attempt['answers'][$q['id']] ?? null;
            $isCorrect = $userAnswer === $q['correctOption'];
            $qMarks = $q['marks'] ?? 1;
            $qNeg = isset($set['negativeMarking']) && $set['negativeMarking'] ? ($q['negativeMarks'] ?? $set['negativeMarkValue'] ?? 0.25) : 0;

            if (!$userAnswer) {
                $status = 'unattempted'; $unattempted++;
            } elseif ($isCorrect) {
                $status = 'correct'; $correct++; $marksObtained += $qMarks;
            } else {
                $status = 'incorrect'; $incorrect++; $negativeMarks += $qNeg;
            }

            $questionReview[] = [
                'questionId' => $q['id'],
                'categoryId' => $q['categoryId'] ?? null,
                'subjectId' => $q['subjectId'] ?? null,
                'questionText' => $q['questionText'],
                'options' => $q['options'],
                'correctOption' => $q['correctOption'],
                'explanation' => $q['explanation'] ?? '',
                'userAnswer' => $userAnswer,
                'status' => $status,
                'marks' => $qMarks
            ];
        }

        $finalScore = max(0, $marksObtained - $negativeMarks);
        $totalMarks = $set['totalMarks'] ?? count($questionList);
        $scorePercentage = round(($finalScore / $totalMarks) * 100, 1);
        $accuracy = ($correct + $incorrect) > 0 ? round(($correct / ($correct + $incorrect)) * 100, 1) : 0;
        $timeTaken = ($set['timeLimitMinutes'] * 60) - ($attempt['timeRemainingSeconds'] ?? 0);

        // Points logic: 10 points for taking test, +1 point for each correct % 
        $pointsEarned = 10 + round($scorePercentage);

        // Update User
        $uStmt = $pdo->prepare("SELECT best_score, total_points, total_tests_completed, daily_points, points_last_updated FROM users WHERE uid = ?");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch();

        $isPersonalBest = $user && $scorePercentage > $user['best_score'];
        $newBest = $isPersonalBest ? $scorePercentage : ($user['best_score'] ?? 0);
        $newPoints = ($user['total_points'] ?? 0) + $pointsEarned;
        
        $today = date('Y-m-d');
        $newDailyPoints = ($user && $user['points_last_updated'] === $today) ? (($user['daily_points'] ?? 0) + $pointsEarned) : $pointsEarned;
        $newCompleted = ($user['total_tests_completed'] ?? 0) + 1;

        $pdo->prepare("UPDATE users SET best_score = ?, total_points = ?, daily_points = ?, points_last_updated = ?, total_tests_completed = ? WHERE uid = ?")->execute([$newBest, $newPoints, $newDailyPoints, $today, $newCompleted, $userId]);

        // Insert Result
        $id = uniqid();
        $pdo->prepare("INSERT INTO test_results (id, attempt_id, user_id, model_set_id, total_questions, correct_answers, incorrect_answers, unattempted_questions, marks_obtained, negative_marks, final_score, total_marks, score_percentage, accuracy, time_taken_seconds, is_personal_best, question_review) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([$id, $attemptId, $userId, $modelSetId, count($questionList), $correct, $incorrect, $unattempted, $marksObtained, $negativeMarks, $finalScore, $totalMarks, $scorePercentage, $accuracy, $timeTaken, $isPersonalBest ? 'true' : 'false', json_encode($questionReview)]);

        // Update Attempt
        $pdo->prepare("UPDATE test_attempts SET status = 'completed', submitted_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$attemptId]);

        sendJson([
            "resultId" => $id, "scorePercentage" => $scorePercentage, "correct" => $correct, "incorrect" => $incorrect,
            "unattempted" => $unattempted, "finalScore" => $finalScore, "totalMarks" => $totalMarks, "accuracy" => $accuracy,
            "timeTaken" => $timeTaken, "isPersonalBest" => $isPersonalBest, "pointsEarned" => $pointsEarned
        ]);
    }
}
sendJson(["error" => "Invalid action"], 400);
?>
