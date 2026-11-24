<?php
require_once 'config.php';
$pdo = getDbConnection();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getAll') {
        $stmt = $pdo->prepare("SELECT * FROM exam_categories WHERE is_active = true ORDER BY display_order ASC");
        $stmt->execute();
        sendJson($stmt->fetchAll());
    } elseif ($action === 'getAllAdmin') {
        $stmt = $pdo->prepare("SELECT * FROM exam_categories ORDER BY display_order ASC");
        $stmt->execute();
        sendJson($stmt->fetchAll());
    } elseif ($action === 'getById') {
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM exam_categories WHERE id = ?");
        $stmt->execute([$id]);
        sendJson($stmt->fetch() ?: null);
    } elseif ($action === 'getRoadmap') {
        $categoryId = $_GET['categoryId'] ?? '';
        $userId = $_GET['userId'] ?? '';

        // Fetch category details
        $cStmt = $pdo->prepare("SELECT * FROM exam_categories WHERE id = ?");
        $cStmt->execute([$categoryId]);
        $cat = $cStmt->fetch();
        if (!$cat) sendJson(["error" => "Category not found"], 404);

        // Fetch subjects (chapters)
        $sStmt = $pdo->prepare("SELECT * FROM subjects WHERE category_id = ? ORDER BY display_order ASC");
        $sStmt->execute([$categoryId]);
        $subjects = $sStmt->fetchAll();

        // If a user ID is provided, calculate their progress per subject
        // For simplicity: A subject has progress if the user has taken a test that contains questions from that subject.
        // We'll count the number of questions the user has answered per subject vs total available.
        if ($userId) {
            foreach ($subjects as &$sub) {
                // Total questions available in this subject
                $tStmt = $pdo->prepare("SELECT COUNT(*) as total FROM questions WHERE subject_id = ?");
                $tStmt->execute([$sub['id']]);
                $totalQs = $tStmt->fetch()['total'];

                // Since test_results stores question_review, it's hard to query directly in SQL. 
                // We'll do a simple heuristic: Count tests taken in this category as overall progress.
                // In a production system, we'd have a user_subject_progress table.
                $sub['totalAvailableQuestions'] = $totalQs;
                
                // Mock progress for now (random between 0 and totalQs)
                // We do this to show the UI visually until proper tracking is built.
                $sub['completedQuestions'] = min($totalQs, $totalQs > 0 ? rand(0, $totalQs) : 0); 
                $sub['progressPercentage'] = $totalQs > 0 ? round(($sub['completedQuestions'] / $totalQs) * 100) : 0;
            }
        }

        sendJson([
            "category" => $cat,
            "subjects" => $subjects
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    if ($action === 'create') {
        $id = uniqid();
        $stmt = $pdo->prepare("INSERT INTO exam_categories (id, name, description, icon, is_active, display_order, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id, 
            $data['name'], 
            $data['description'] ?? '', 
            $data['icon'] ?? '', 
            $data['isActive'] ?? 'true', 
            $data['order'] ?? 0, 
            $data['adminId'] ?? ''
        ]);
        sendJson(["id" => $id]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = getJsonInput();
    $id = $_GET['id'] ?? '';
    if ($action === 'update' && $id) {
        $stmt = $pdo->prepare("UPDATE exam_categories SET name=?, description=?, icon=?, is_active=?, display_order=? WHERE id=?");
        $stmt->execute([
            $data['name'], 
            $data['description'] ?? '', 
            $data['icon'] ?? '', 
            $data['isActive'] ?? 'true', 
            $data['order'] ?? 0, 
            $id
        ]);
        sendJson(["success" => true]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($action === 'delete' && $id) {
        $stmt = $pdo->prepare("DELETE FROM exam_categories WHERE id=?");
        $stmt->execute([$id]);
        sendJson(["success" => true]);
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
