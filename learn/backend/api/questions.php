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
    if ($action === 'getAll') {
        $categoryId = $_GET['categoryId'] ?? '';
        $sql = "SELECT * FROM questions";
        $params = [];
        if ($categoryId) {
            $sql .= " WHERE category_id = ?";
            $params[] = $categoryId;
        }
        $sql .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $questions = $stmt->fetchAll();
        
        // Decode JSON options
        foreach ($questions as &$q) {
            $q['options'] = json_decode($q['options'], true);
            $q['categoryId'] = $q['category_id'];
            $q['subjectId'] = $q['subject_id'];
            $q['questionText'] = $q['question_text'];
            $q['correctOption'] = $q['correct_option'];
            $q['negativeMarks'] = (float)$q['negative_marks'];
            $q['marks'] = (float)$q['marks'];
        }
        sendJson($questions);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'create') {
        if (!isAdmin($pdo, $uid)) sendJson(["error" => "Unauthorized"], 403);
        
        $data = getJsonInput();
        $qId = 'q_' . uniqid();
        $stmt = $pdo->prepare("INSERT INTO questions (id, category_id, subject_id, question_text, options, correct_option, explanation, difficulty, marks, negative_marks, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $qId,
            $data['categoryId'],
            $data['subjectId'] ?? null,
            $data['questionText'],
            json_encode($data['options']),
            $data['correctOption'],
            $data['explanation'] ?? '',
            $data['difficulty'] ?? 'medium',
            $data['marks'] ?? 1.0,
            $data['negativeMarks'] ?? 0.25,
            $data['status'] ?? 'published'
        ]);
        sendJson(["success" => true, "id" => $qId]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($action === 'update') {
        if (!isAdmin($pdo, $uid)) sendJson(["error" => "Unauthorized"], 403);
        
        $id = $_GET['id'] ?? '';
        if (!$id) sendJson(["error" => "ID required"], 400);
        $data = getJsonInput();
        
        $stmt = $pdo->prepare("UPDATE questions SET category_id=?, subject_id=?, question_text=?, options=?, correct_option=?, explanation=?, difficulty=?, marks=?, negative_marks=?, status=? WHERE id=?");
        $stmt->execute([
            $data['categoryId'],
            $data['subjectId'] ?? null,
            $data['questionText'],
            json_encode($data['options']),
            $data['correctOption'],
            $data['explanation'] ?? '',
            $data['difficulty'] ?? 'medium',
            $data['marks'] ?? 1.0,
            $data['negativeMarks'] ?? 0.25,
            $data['status'] ?? 'published',
            $id
        ]);
        sendJson(["success" => true]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($action === 'delete') {
        if (!isAdmin($pdo, $uid)) sendJson(["error" => "Unauthorized"], 403);
        
        $id = $_GET['id'] ?? '';
        if (!$id) sendJson(["error" => "ID required"], 400);
        
        $stmt = $pdo->prepare("DELETE FROM questions WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(["success" => true]);
    }
}
sendJson(["error" => "Invalid action"], 400);
?>
