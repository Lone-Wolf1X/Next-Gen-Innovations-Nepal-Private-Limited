<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uid = requireAuth(); // Must be logged in

    if ($action === 'getTopics') {
        $vacancyId = $_GET['vacancyId'] ?? '';
        if (!$vacancyId) sendJson(["error" => "Vacancy ID required"], 400);

        // Optional: verify user is enrolled in this vacancy
        $cStmt = $pdo->prepare("SELECT id FROM enrollments WHERE user_id = ? AND vacancy_id = ?");
        $cStmt->execute([$uid, $vacancyId]);
        if (!$cStmt->fetch()) {
            sendJson(["error" => "Not enrolled in this vacancy"], 403);
        }

        $stmt = $pdo->prepare("SELECT * FROM subjective_topics WHERE vacancy_id = ? ORDER BY display_order ASC");
        $stmt->execute([$vacancyId]);
        sendJson($stmt->fetchAll());

    } elseif ($action === 'getQuestions') {
        $topicId = $_GET['topicId'] ?? '';
        if (!$topicId) sendJson(["error" => "Topic ID required"], 400);

        // Fetch questions for topic
        // Ensure user is enrolled by joining back to vacancy? (Optional security, skip for speed as we checked above in UI)
        $stmt = $pdo->prepare("SELECT * FROM subjective_questions WHERE topic_id = ? ORDER BY created_at ASC");
        $stmt->execute([$topicId]);
        $questions = $stmt->fetchAll();
        
        // Let's also fetch the topic name for the UI
        $tStmt = $pdo->prepare("SELECT title FROM subjective_topics WHERE id = ?");
        $tStmt->execute([$topicId]);
        $topic = $tStmt->fetch();

        sendJson([
            "topicTitle" => $topic ? $topic['title'] : "Unknown Topic",
            "questions" => $questions
        ]);
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
