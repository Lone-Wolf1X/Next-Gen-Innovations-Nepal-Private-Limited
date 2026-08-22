<?php
// Script to parse the PSC JSON and seed the database locally via PHP
$json_content = file_get_contents('psc-level5-pre-qualifying-syllabus.json');
$syllabus = json_decode($json_content, true);

require_once 'config.php';
$pdo = getDbConnection();

try {
    // 1. Ensure Category exists
    $stmt = $pdo->prepare("SELECT id FROM gb_categories WHERE name = ?");
    $stmt->execute(['Government (Lok Sewa)']);
    $cat_result = $stmt->fetch();
    
    if ($cat_result) {
        $category_id = $cat_result['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO gb_categories (name, status) VALUES (?, ?)");
        $stmt->execute(['Government (Lok Sewa)', 'active']);
        $category_id = $pdo->lastInsertId();
    }

    // 2. Add the Exam
    $title = "PSC Pre-Qualifying (Level 5)";
    
    $stmt = $pdo->prepare("SELECT id FROM gb_exams WHERE title = ?");
    $stmt->execute([$title]);
    $result = $stmt->fetch();
    if ($result) {
        $exam_id = $result['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO gb_exams (category_id, title, status) VALUES (?, ?, ?)");
        $stmt->execute([$category_id, $title, 'active']);
        $exam_id = $pdo->lastInsertId();
    }
            
    // 3. Create MCQ sets based on sections
    foreach ($syllabus['phases'] as $phase) {
        foreach ($phase['papers'] as $paper) {
            if (!isset($paper['sections'])) continue;
            
            foreach ($paper['sections'] as $section) {
                $set_title = $paper['paper_name'] . " - " . $section['section_name'];
                
                // Create the set (set_date is required)
                $stmt = $pdo->prepare("INSERT INTO gb_mcq_sets (exam_id, title, set_date, status) VALUES (?, ?, CURDATE(), ?)");
                $stmt->execute([$exam_id, $set_title, 'PUBLISHED']);
                $set_id = $pdo->lastInsertId();
                
                // Generate some dummy questions based on topics for now
                if (!isset($section['topics'])) continue;
                
                $topic_count = 0;
                foreach ($section['topics'] as $topic) {
                    if ($topic_count >= 2) break; // limit to 2 per section
                    
                    $q_text = "What is a key concept of: " . mb_substr($topic, 0, 80, 'UTF-8') . "...?";
                    $exp = "This is an automated placeholder for " . mb_substr($topic, 0, 40, 'UTF-8') . "...";
                    
                    $stmt = $pdo->prepare("INSERT INTO gb_questions 
                        (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    
                    $stmt->execute([
                        $set_id, 
                        $q_text,
                        "Option A", "Option B", "Option C", "Option D",
                        "A", 
                        $exp,
                        "Review syllabus!"
                    ]);
                    $topic_count++;
                }
            }
        }
    }

    echo "Successfully parsed PSC syllabus JSON and seeded into live database!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
