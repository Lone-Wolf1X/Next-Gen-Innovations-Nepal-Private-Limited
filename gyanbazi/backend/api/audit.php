<?php
require_once 'config.php';
require_once 'auth_helper.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? '';

// We could enforce admin auth here using requireAdmin($pdo) if desired.
// For now, let's keep it simple.

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'write') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendJson(['error' => 'Invalid JSON'], 400);

    $adminId = $data['adminId'] ?? '';
    $act = $data['action'] ?? '';
    $entityType = $data['entityType'] ?? '';
    $entityId = $data['entityId'] ?? '';
    $before = $data['before'] ?? null;
    $after = $data['after'] ?? null;

    $changes = json_encode(['before' => $before, 'after' => $after]);

    $stmt = $pdo->prepare("INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$adminId, $act, $entityType, $entityId, $changes]);
    sendJson(['success' => true]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getRecent') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    
    // Fetch logs along with admin details if possible
    // We join with users table to get admin name/email
    $sql = "SELECT a.*, u.name as adminName, u.email as adminEmail 
            FROM audit_logs a 
            LEFT JOIN users u ON a.admin_id = u.uid 
            ORDER BY a.created_at DESC LIMIT ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$limit]);
    $logs = $stmt->fetchAll();
    
    // Map to camelCase
    $result = array_map(function($log) {
        return [
            'id' => $log['id'],
            'adminId' => $log['admin_id'],
            'adminName' => $log['adminName'] ?? 'Unknown',
            'adminEmail' => $log['adminEmail'] ?? '',
            'action' => $log['action'],
            'entityType' => $log['entity_type'],
            'entityId' => $log['entity_id'],
            'changes' => json_decode($log['changes'], true),
            'createdAt' => $log['created_at']
        ];
    }, $logs);
    
    sendJson($result);
} else {
    sendJson(['error' => 'Invalid action or method'], 400);
}
