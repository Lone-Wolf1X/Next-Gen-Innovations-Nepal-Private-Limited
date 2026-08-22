<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';
$pdo = getDbConnection();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Fetch pending questions (either is_verified = 0 or status != PUBLISHED)
    if ($action === 'getPendingQuestions') {
        // We fetch questions and their associated sets and exams
        $sql = "SELECT q.*, s.title as set_title, e.title as exam_title 
                FROM gb_questions q 
                JOIN gb_mcq_sets s ON q.set_id = s.id 
                JOIN gb_exams e ON s.exam_id = e.id 
                WHERE q.is_verified = 0 OR s.status = 'DRAFT' OR s.status = 'UNDER_REVIEW'
                ORDER BY q.id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["status" => "success", "data" => $questions]);
        exit;
    }
    
    // Fetch summary stats for admin dashboard
    if ($action === 'getStats') {
        $stats = [];
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM gb_questions WHERE is_verified = 0");
        $stats['pending_questions'] = $stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM gb_mcq_sets WHERE status = 'PUBLISHED'");
        $stats['published_sets'] = $stmt->fetchColumn();
        
        echo json_encode(["status" => "success", "data" => $stats]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Verify and Update a Question
    if ($action === 'verifyQuestion') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(["status" => "error", "message" => "Question ID is required"]);
            exit;
        }
        
        $sql = "UPDATE gb_questions SET 
                question_text = ?, 
                option_a = ?, 
                option_b = ?, 
                option_c = ?, 
                option_d = ?, 
                correct_option = ?, 
                explanation = ?, 
                exam_tip = ?, 
                is_verified = 1 
                WHERE id = ?";
                
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            $data['question_text'],
            $data['option_a'],
            $data['option_b'],
            $data['option_c'],
            $data['option_d'],
            $data['correct_option'],
            $data['explanation'] ?? '',
            $data['exam_tip'] ?? '',
            $data['id']
        ]);
        
        if ($result) {
            echo json_encode(["status" => "success", "message" => "Question verified successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update question"]);
        }
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    
    // Delete a Question
    if ($action === 'deleteQuestion') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["status" => "error", "message" => "Question ID is required"]);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM gb_questions WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["status" => "success", "message" => "Question deleted"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to delete question"]);
        }
        exit;
    }
}

echo json_encode(["status" => "error", "message" => "Invalid action specified"]);
?>
