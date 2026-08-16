<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $staffId = $data['staffId'] ?? '';

    if (empty($staffId)) {
        echo json_encode(['success' => false, 'error' => 'Missing Staff ID']);
        exit;
    }

    try {
        // Find the user with this staff_id. We also enforce role='admin' to be safe.
        $stmt = $pdo->prepare("SELECT email FROM users WHERE staff_id = ? AND role = 'admin' LIMIT 1");
        $stmt->execute([$staffId]);
        $user = $stmt->fetch();

        if ($user) {
            echo json_encode(['success' => true, 'email' => $user['email']]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid Staff ID. Account not found.']);
        }
    } catch (Exception $e) {
        error_log("Auth Helper Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An internal database error occurred.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
