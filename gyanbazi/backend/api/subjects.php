<?php
require_once 'config.php';
$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getAll') {
        $stmt = $pdo->prepare("SELECT * FROM subjects ORDER BY display_order ASC, name ASC");
        $stmt->execute();
        $subjects = $stmt->fetchAll();
        // Map to camelCase
        foreach($subjects as &$s) {
            $s['categoryId'] = $s['category_id'];
            $s['isActive'] = (bool)$s['is_active'];
            $s['displayOrder'] = (int)$s['display_order'];
        }
        sendJson($subjects);
    } elseif ($action === 'getByCategory') {
        $categoryId = $_GET['categoryId'] ?? '';
        if (!$categoryId) sendJson(["error" => "categoryId required"], 400);

        $stmt = $pdo->prepare("SELECT * FROM subjects WHERE category_id = ? ORDER BY display_order ASC, name ASC");
        $stmt->execute([$categoryId]);
        $subjects = $stmt->fetchAll();
        foreach($subjects as &$s) {
            $s['categoryId'] = $s['category_id'];
            $s['isActive'] = (bool)$s['is_active'];
            $s['displayOrder'] = (int)$s['display_order'];
        }
        sendJson($subjects);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'create') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['name']) || empty($data['categoryId'])) {
            sendJson(["error" => "Invalid data"], 400);
        }
        
        $id = uniqid();
        $stmt = $pdo->prepare("INSERT INTO subjects (id, category_id, name, is_active, display_order) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([
            $id,
            $data['categoryId'],
            $data['name'],
            isset($data['isActive']) ? (int)$data['isActive'] : 1,
            $data['displayOrder'] ?? 0
        ])) {
            sendJson(["success" => true, "id" => $id]);
        } else {
            sendJson(["error" => "Failed to create subject"], 500);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($action === 'update') {
        $id = $_GET['id'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$id || !$data) sendJson(["error" => "ID and data required"], 400);

        $stmt = $pdo->prepare("UPDATE subjects SET name = ?, is_active = ?, display_order = ? WHERE id = ?");
        if ($stmt->execute([
            $data['name'],
            isset($data['isActive']) ? (int)$data['isActive'] : 1,
            $data['displayOrder'] ?? 0,
            $id
        ])) {
            sendJson(["success" => true]);
        } else {
            sendJson(["error" => "Failed to update subject"], 500);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($action === 'delete') {
        $id = $_GET['id'] ?? '';
        if (!$id) sendJson(["error" => "ID required"], 400);
        
        $stmt = $pdo->prepare("DELETE FROM subjects WHERE id = ?");
        if ($stmt->execute([$id])) {
            sendJson(["success" => true]);
        } else {
            sendJson(["error" => "Failed to delete subject"], 500);
        }
    }
}

sendJson(["error" => "Invalid action"], 400);
?>
