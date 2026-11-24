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

function isAdmin($pdo, $uid) {
    if (!$uid) return false;
    $stmt = $pdo->prepare("SELECT role FROM users WHERE uid = ?");
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    return $user && $user['role'] === 'admin';
}

if (!isAdmin($pdo, $uid)) {
    sendJson(["error" => "Unauthorized"], 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getStats') {
        $stats = [
            'totalUsers' => (int)$pdo->query("SELECT COUNT(*) as count FROM users")->fetch()['count'],
            'totalModelSets' => (int)$pdo->query("SELECT COUNT(*) as count FROM model_sets")->fetch()['count'],
            'totalQuestions' => (int)$pdo->query("SELECT COUNT(*) as count FROM questions")->fetch()['count'],
            'totalTestsCompleted' => (int)$pdo->query("SELECT COUNT(*) as count FROM test_results")->fetch()['count'],
            'activeVacancies' => (int)$pdo->query("SELECT COUNT(*) as count FROM vacancies")->fetch()['count']
        ];
        sendJson($stats);
    }
    elseif ($action === 'getUsers') {
        $stmt = $pdo->query("SELECT uid, name, email, subscription_tier, role, total_points, current_streak, created_at FROM users ORDER BY created_at DESC LIMIT 500");
        sendJson($stmt->fetchAll());
    }
    elseif ($action === 'getVacancies') {
        $stmt = $pdo->query("SELECT v.*, c.name as category_name FROM vacancies v LEFT JOIN exam_categories c ON v.category_id = c.id ORDER BY v.created_at DESC");
        sendJson($stmt->fetchAll());
    }
    elseif ($action === 'getDailySprints') {
        $stmt = $pdo->query("SELECT ds.*, ms.title as model_set_title, 
            (SELECT COUNT(*) FROM sprint_participants sp WHERE sp.sprint_id = ds.id) as participant_count 
            FROM daily_sprints ds JOIN model_sets ms ON ds.model_set_id = ms.id ORDER BY ds.sprint_date DESC");
        sendJson($stmt->fetchAll());
    }
    elseif ($action === 'getSubjectiveTopics') {
        $vacancyId = $_GET['vacancy_id'] ?? null;
        if($vacancyId) {
            $stmt = $pdo->prepare("SELECT st.*, v.title as vacancy_title FROM subjective_topics st JOIN vacancies v ON st.vacancy_id = v.id WHERE st.vacancy_id = ? ORDER BY st.display_order ASC");
            $stmt->execute([$vacancyId]);
        } else {
            $stmt = $pdo->query("SELECT st.*, v.title as vacancy_title FROM subjective_topics st JOIN vacancies v ON st.vacancy_id = v.id ORDER BY v.title, st.display_order ASC");
        }
        sendJson($stmt->fetchAll());
    }
    elseif ($action === 'getSubjectiveQuestions') {
        $topicId = $_GET['topic_id'] ?? null;
        if ($topicId) {
            $stmt = $pdo->prepare("SELECT * FROM subjective_questions WHERE topic_id = ? ORDER BY created_at ASC");
            $stmt->execute([$topicId]);
            sendJson($stmt->fetchAll());
        }
        sendJson([]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'saveVacancy') {
        $id = $data['id'] ?? uniqid('vac-');
        $isNew = empty($data['id']);
        
        $sql = $isNew 
            ? "INSERT INTO vacancies (id, category_id, title, description, application_open_date, application_close_date, double_fee_start_date, double_fee_end_date, exam_date, has_objective, has_subjective, roadmap_html) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            : "UPDATE vacancies SET category_id=?, title=?, description=?, application_open_date=?, application_close_date=?, double_fee_start_date=?, double_fee_end_date=?, exam_date=?, has_objective=?, has_subjective=?, roadmap_html=? WHERE id=?";
            
        $params = [
            $data['category_id'] ?? 'cat-rbb',
            $data['title'],
            $data['description'] ?? '',
            $data['application_open_date'] ?: null,
            $data['application_close_date'] ?: null,
            $data['double_fee_start_date'] ?: null,
            $data['double_fee_end_date'] ?: null,
            $data['exam_date'] ?: null,
            $data['has_objective'] ? 1 : 0,
            $data['has_subjective'] ? 1 : 0,
            $data['roadmap_html'] ?? ''
        ];
        
        if ($isNew) array_unshift($params, $id);
        else $params[] = $data['id'];
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        sendJson(["success" => true]);
    }
    elseif ($action === 'saveSprint') {
        $id = $data['id'] ?? uniqid('spr-');
        $isNew = empty($data['id']);
        
        $inviteCode = $isNew ? substr(md5(uniqid()), 0, 8) : ($data['invite_code'] ?? null);
        
        $sql = $isNew
            ? "INSERT INTO daily_sprints (id, model_set_id, sprint_date, start_time, end_time, status, invite_code) VALUES (?, ?, ?, ?, ?, ?, ?)"
            : "UPDATE daily_sprints SET model_set_id=?, sprint_date=?, start_time=?, end_time=?, status=? WHERE id=?";
            
        $params = [
            $data['model_set_id'],
            $data['sprint_date'],
            $data['start_time'],
            $data['end_time'],
            $data['status'] ?? 'active'
        ];
        
        if ($isNew) {
            array_unshift($params, $id);
            $params[] = $inviteCode;
        } else {
            $params[] = $data['id'];
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        sendJson(["success" => true]);
    }
    elseif ($action === 'saveSubjectiveQuestion') {
        $id = $data['id'] ?? uniqid('sq-');
        $isNew = empty($data['id']);
        
        $sql = $isNew
            ? "INSERT INTO subjective_questions (id, topic_id, question_text, writing_guide, sample_answer) VALUES (?, ?, ?, ?, ?)"
            : "UPDATE subjective_questions SET topic_id=?, question_text=?, writing_guide=?, sample_answer=? WHERE id=?";
            
        $params = [
            $data['topic_id'],
            $data['question_text'],
            $data['writing_guide'] ?? '',
            $data['sample_answer'] ?? ''
        ];
        
        if ($isNew) array_unshift($params, $id);
        else $params[] = $data['id'];
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        sendJson(["success" => true]);
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
