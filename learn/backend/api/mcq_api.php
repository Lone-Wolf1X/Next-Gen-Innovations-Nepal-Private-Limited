<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

// Database configuration
$servername = "localhost";
$username = "root";
$password = "Abhii@@123@";
$dbname = "next_gen_db";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'getCategories':
        $sql = "SELECT * FROM categories WHERE status = 'active'";
        $result = $conn->query($sql);
        $data = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break;

    case 'getExams':
        $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
        $sql = "SELECT * FROM exams WHERE status = 'active'";
        if ($categoryId > 0) {
            $sql .= " AND category_id = $categoryId";
        }
        $result = $conn->query($sql);
        $data = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break;

    case 'getQuestions':
        // Fetch questions for a specific exam from PUBLISHED sets
        $examId = isset($_GET['exam_id']) ? (int)$_GET['exam_id'] : 0;
        if ($examId == 0) {
            echo json_encode(["status" => "error", "message" => "exam_id is required"]);
            break;
        }

        // Get the latest published set for this exam
        $setSql = "SELECT id, title, time_limit_minutes FROM mcq_sets WHERE exam_id = $examId AND status = 'PUBLISHED' ORDER BY set_date DESC LIMIT 1";
        $setResult = $conn->query($setSql);
        
        if ($setResult && $setResult->num_rows > 0) {
            $set = $setResult->fetch_assoc();
            $setId = $set['id'];
            
            $qSql = "SELECT * FROM questions WHERE set_id = $setId";
            $qResult = $conn->query($qSql);
            $questions = [];
            if ($qResult && $qResult->num_rows > 0) {
                while ($row = $qResult->fetch_assoc()) {
                    $questions[] = [
                        'id' => 'q_' . $row['id'],
                        'questionText' => $row['question_text'],
                        'options' => [
                            'A' => $row['option_a'],
                            'B' => $row['option_b'],
                            'C' => $row['option_c'],
                            'D' => $row['option_d']
                        ],
                        'correctOption' => $row['correct_option'],
                        'explanation' => $row['explanation'],
                        'tip' => $row['exam_tip'],
                        'subject' => $set['title']
                    ];
                }
            }
            echo json_encode([
                "status" => "success", 
                "set_info" => $set,
                "questions" => $questions
            ]);
        } else {
            echo json_encode(["status" => "success", "message" => "No published questions found for this exam", "questions" => []]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action specified"]);
        break;
}

$conn->close();
?>
