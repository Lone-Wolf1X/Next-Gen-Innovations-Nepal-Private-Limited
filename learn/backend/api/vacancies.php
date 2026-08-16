<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        // List all available vacancies
        $stmt = $pdo->prepare("SELECT v.*, c.name as category_name FROM vacancies v JOIN exam_categories c ON v.category_id = c.id ORDER BY v.created_at DESC");
        $stmt->execute();
        $vacancies = $stmt->fetchAll();
        sendJson($vacancies);
    } elseif ($action === 'getAllAdmin') {
        $stmt = $pdo->prepare("SELECT v.*, c.name as category_name FROM vacancies v LEFT JOIN exam_categories c ON v.category_id = c.id ORDER BY v.created_at DESC");
        $stmt->execute();
        $vacancies = $stmt->fetchAll();
        sendJson($vacancies);
    } elseif ($action === 'myEnrollments') {
        $uid = requireAuth();
        $stmt = $pdo->prepare("
            SELECT v.*, e.enrolled_at, c.name as category_name 
            FROM enrollments e 
            JOIN vacancies v ON e.vacancy_id = v.id 
            JOIN exam_categories c ON v.category_id = c.id
            WHERE e.user_id = ? 
            ORDER BY e.enrolled_at DESC
        ");
        $stmt->execute([$uid]);
        $enrollments = $stmt->fetchAll();
        sendJson($enrollments);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'enroll') {
        $uid = requireAuth();
        $data = getJsonInput();
        $vacancyId = $data['vacancyId'] ?? '';
        
        if (!$vacancyId) sendJson(["error" => "Vacancy ID required"], 400);

        // Check if vacancy exists
        $vStmt = $pdo->prepare("SELECT id FROM vacancies WHERE id = ?");
        $vStmt->execute([$vacancyId]);
        if (!$vStmt->fetch()) sendJson(["error" => "Vacancy not found"], 404);

        // Check if already enrolled
        $cStmt = $pdo->prepare("SELECT id FROM enrollments WHERE user_id = ? AND vacancy_id = ?");
        $cStmt->execute([$uid, $vacancyId]);
        if ($cStmt->fetch()) sendJson(["error" => "Already enrolled"], 400);

        $id = uniqid();
        $stmt = $pdo->prepare("INSERT INTO enrollments (id, user_id, vacancy_id) VALUES (?, ?, ?)");
        $stmt->execute([$id, $uid, $vacancyId]);
        
        sendJson(["success" => true, "enrollmentId" => $id]);
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
