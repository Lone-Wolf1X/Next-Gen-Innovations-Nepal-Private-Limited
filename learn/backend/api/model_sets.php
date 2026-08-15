<?php
require_once 'config.php';
$pdo = getDbConnection();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getPublished') {
        $categoryId = $_GET['categoryId'] ?? null;
        $sql = "SELECT * FROM model_sets WHERE status = 'published'";
        $params = [];
        if ($categoryId) {
            $sql .= " AND category_id = ?";
            $params[] = $categoryId;
        }
        $sql .= " ORDER BY published_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $sets = $stmt->fetchAll();
        // Parse JSON and map to camelCase
        foreach($sets as &$s) { 
            $s['questionIds'] = json_decode($s['question_ids']); 
            $s['timeLimitMinutes'] = (int)$s['time_limit_minutes'];
            $s['totalMarks'] = (int)$s['total_marks'];
            $s['totalQuestions'] = $s['questionIds'] ? count($s['questionIds']) : 0;
            $s['categoryId'] = $s['category_id'];
        }
        sendJson($sets);
    } elseif ($action === 'getAll') {
        $stmt = $pdo->prepare("SELECT * FROM model_sets ORDER BY created_at DESC");
        $stmt->execute();
        $sets = $stmt->fetchAll();
        foreach($sets as &$s) { 
            $s['questionIds'] = json_decode($s['question_ids']); 
            $s['timeLimitMinutes'] = (int)$s['time_limit_minutes'];
            $s['totalMarks'] = (int)$s['total_marks'];
            $s['totalQuestions'] = $s['questionIds'] ? count($s['questionIds']) : 0;
            $s['categoryId'] = $s['category_id'];
        }
        sendJson($sets);
    } elseif ($action === 'getById') {
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM model_sets WHERE id = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch();
        if ($data) {
            $data['questionIds'] = json_decode($data['question_ids']);
            $data['timeLimitMinutes'] = (int)$data['time_limit_minutes'];
            $data['totalMarks'] = (int)$data['total_marks'];
            $data['totalQuestions'] = $data['questionIds'] ? count($data['questionIds']) : 0;
            $data['categoryId'] = $data['category_id'];
        }
        sendJson($data ?: null);
    } elseif ($action === 'getWithQuestions') {
        $id = $_GET['id'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM model_sets WHERE id = ?");
        $stmt->execute([$id]);
        $set = $stmt->fetch();
        if (!$set) sendJson(null);
        
        $qIds = json_decode($set['question_ids'], true) ?: [];
        $questions = [];
        if (!empty($qIds)) {
            $placeholders = str_repeat('?,', count($qIds) - 1) . '?';
            $qStmt = $pdo->prepare("SELECT * FROM questions WHERE id IN ($placeholders)");
            $qStmt->execute($qIds);
            $dbQuestions = $qStmt->fetchAll();
            
            // Map snake_case to camelCase
            foreach($dbQuestions as $q) {
                $questions[] = [
                    'id' => $q['id'],
                    'categoryId' => $q['category_id'],
                    'subjectId' => $q['subject_id'],
                    'questionText' => $q['question_text'],
                    'options' => json_decode($q['options'], true),
                    'correctOption' => $q['correct_option'],
                    'explanation' => $q['explanation'],
                    'difficulty' => $q['difficulty'],
                    'marks' => $q['marks']
                ];
            }
        }
        
        $set['questionIds'] = $qIds;
        $set['questions'] = $questions;
        $set['timeLimitMinutes'] = (int)$set['time_limit_minutes'];
        $set['totalMarks'] = (int)$set['total_marks'];
        sendJson($set);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    if ($action === 'create') {
        $id = uniqid();
        $stmt = $pdo->prepare("INSERT INTO model_sets (id, title, description, category_id, question_ids, time_limit_minutes, total_marks, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $data['title'],
            $data['description'] ?? '',
            $data['categoryId'],
            json_encode($data['questionIds'] ?? []),
            $data['timeLimitMinutes'] ?? 60,
            $data['totalMarks'] ?? 100,
            'draft'
        ]);
        sendJson(["id" => $id]);
    } elseif ($action === 'importJson') {
        // Receives a payload with set details and questions array
        $id = uniqid();
        $qIds = [];
        
        try {
            $pdo->beginTransaction();
            
            // Insert Questions
            foreach($data['questions'] as $q) {
                $qId = uniqid();
                $qStmt = $pdo->prepare("INSERT INTO questions (id, category_id, subject_id, question_text, options, correct_option, explanation, difficulty, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $qStmt->execute([
                    $qId,
                    $data['categoryId'],
                    $q['subjectId'] ?? null,
                    $q['questionText'],
                    json_encode($q['options']),
                    $q['correctOption'],
                    $q['explanation'] ?? '',
                    $q['difficulty'] ?? 'medium',
                    $q['marks'] ?? 1
                ]);
                $qIds[] = $qId;
            }

            // Insert Model Set
            $stmt = $pdo->prepare("INSERT INTO model_sets (id, title, description, category_id, question_ids, time_limit_minutes, total_marks, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([
                $id,
                $data['title'],
                $data['description'] ?? '',
                $data['categoryId'],
                json_encode($qIds),
                $data['timeLimitMinutes'] ?? 60,
                count($qIds), // Assumes 1 mark per question for simplicity
                'published' // Auto publish AI imports
            ]);

            $pdo->commit();
            sendJson(["success" => true, "id" => $id, "totalQuestions" => count($qIds)]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJson(["error" => "Import failed: " . $e->getMessage()], 500);
        }
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
