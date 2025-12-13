<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../../../config/database.php';

// 1. Get the search term
$query = isset($_GET['q']) ? $_GET['q'] : '';

if (strlen($query) < 2) {
    echo json_encode(["status" => "error", "message" => "Type at least 2 characters"]);
    exit();
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 2. Search users (excluding password!)
$term = $conn->real_escape_string($query);
$sql = "SELECT id, email, created_at FROM users WHERE email LIKE '%$term%' OR id = '$term' LIMIT 20";

$result = $conn->query($sql);

$users = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Create a display name from email (e.g., "student" from "student@unn...")
        $row['name'] = explode('@', $row['email'])[0];
        $users[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $users]);
$conn->close();
?>
