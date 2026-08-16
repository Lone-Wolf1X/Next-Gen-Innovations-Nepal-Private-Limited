<?php
require_once 'config.php';
$pdo = getDbConnection();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getDailyLive') {
        $vacancyId = $_GET['vacancyId'] ?? null;
        if (!$vacancyId) sendJson(null);
        $stmt = $pdo->prepare("SELECT * FROM model_sets WHERE vacancy_id = ? AND is_daily_live = TRUE AND status = 'published' ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$vacancyId]);
        $data = $stmt->fetch();
        if ($data) {
            $data['questionIds'] = json_decode($data['question_ids']);
            $data['timeLimitMinutes'] = (int)$data['time_limit_minutes'];
            $data['totalMarks'] = (int)$data['total_marks'];
            $data['totalQuestions'] = $data['questionIds'] ? count($data['questionIds']) : 0;
            $data['categoryId'] = $data['category_id'];
            $data['vacancyId'] = $data['vacancy_id'];
            $data['isDailyLive'] = (bool)$data['is_daily_live'];
            $data['liveStartTime'] = $data['live_start_time'];
            $data['liveEndTime'] = $data['live_end_time'];
        }
        sendJson($data ?: null);
    } elseif ($action === 'getPublished') {
        $categoryId = $_GET['categoryId'] ?? null;
        $vacancyId = $_GET['vacancyId'] ?? null;
        $sql = "SELECT * FROM model_sets WHERE status = 'published'";
        $params = [];
        if ($categoryId) {
            $sql .= " AND category_id = ?";
            $params[] = $categoryId;
        }
        if ($vacancyId) {
            $sql .= " AND vacancy_id = ?";
            $params[] = $vacancyId;
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
            $s['vacancyId'] = $s['vacancy_id'];
            $s['isDailyLive'] = (bool)$s['is_daily_live'];
            $s['liveStartTime'] = $s['live_start_time'];
            $s['liveEndTime'] = $s['live_end_time'];
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
            $s['vacancyId'] = $s['vacancy_id'];
            $s['isDailyLive'] = (bool)$s['is_daily_live'];
            $s['liveStartTime'] = $s['live_start_time'];
            $s['liveEndTime'] = $s['live_end_time'];
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
            $data['vacancyId'] = $data['vacancy_id'];
            $data['isDailyLive'] = (bool)$data['is_daily_live'];
            $data['liveStartTime'] = $data['live_start_time'];
            $data['liveEndTime'] = $data['live_end_time'];
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
                    'marks' => $q['marks']
                ];
            }
        }
        
        $set['questionIds'] = $qIds;
        $set['questions'] = $questions;
        $set['timeLimitMinutes'] = (int)$set['time_limit_minutes'];
        $set['totalMarks'] = (int)$set['total_marks'];
        $set['vacancyId'] = $set['vacancy_id'];
        $set['isDailyLive'] = (bool)$set['is_daily_live'];
        $set['liveStartTime'] = $set['live_start_time'];
        $set['liveEndTime'] = $set['live_end_time'];
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
                $qStmt = $pdo->prepare("INSERT INTO questions (id, category_id, subject_id, question_text, options, correct_option, explanation, marks, negative_marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $qStmt->execute([
                    $qId,
                    $data['categoryId'],
                    $q['subjectId'] ?? null,
                    $q['questionText'],
                    json_encode($q['options']),
                    $q['correctOption'],
                    $q['explanation'] ?? '',
                    $q['marks'] ?? 1.00,
                    0.20 // 20% negative marks default for imported questions
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
                $data['timeLimitMinutes'] ?? 45, // default 45 mins
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
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($action === 'delete') {
        $id = $_GET['id'] ?? '';
        if (!$id) sendJson(["error" => "ID required"], 400);

        // Fetch question IDs to delete them as well if they belong to this set exclusively?
        // Let's just delete the model_set for now; questions are deleted automatically if ON DELETE CASCADE,
        // but here they are just json arrays. If we want to clean up questions, we'd need to parse json.
        // For now, just delete the model set.
        $stmt = $pdo->prepare("DELETE FROM model_sets WHERE id = ?");
        if ($stmt->execute([$id])) {
            sendJson(["success" => true]);
        } else {
            sendJson(["error" => "Failed to delete"], 500);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($action === 'update') {
        $id = $_GET['id'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$id || !$data) sendJson(["error" => "ID and data required"], 400);

        $stmt = $pdo->prepare("UPDATE model_sets SET title = ?, description = ?, time_limit_minutes = ?, total_marks = ?, status = ?, is_daily_live = ?, live_start_time = ?, live_end_time = ?, vacancy_id = ? WHERE id = ?");
        if ($stmt->execute([
            $data['title'],
            $data['description'] ?? '',
            $data['timeLimitMinutes'] ?? 60,
            $data['totalMarks'] ?? 100,
            $data['status'] ?? 'published',
            isset($data['isDailyLive']) ? (int)$data['isDailyLive'] : 0,
            $data['liveStartTime'] ?? null,
            $data['liveEndTime'] ?? null,
            $data['vacancyId'] ?? null,
            $id
        ])) {
            sendJson(["success" => true]);
        } else {
            sendJson(["error" => "Failed to update"], 500);
        }
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
