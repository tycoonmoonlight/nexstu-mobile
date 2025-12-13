<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../../../config/database.php';

$headers = getallheaders();
$auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$token = str_replace('Bearer ', '', $auth);

if (!$token) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$parts = explode('.', $token);
$user_json = base64_decode($parts[1]);
$user_data = json_decode($user_json, true);
$follower_id = $user_data['data']['id']; // ME

$data = json_decode(file_get_contents("php://input"));
$followed_id = $data->user_id; // THEM

if ($follower_id == $followed_id) {
    echo json_encode(["status" => "error", "message" => "Cannot follow yourself"]);
    exit();
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check if already following
$check = $conn->query("SELECT id FROM follows WHERE follower_id=$follower_id AND followed_id=$followed_id");

if ($check->num_rows > 0) {
    // Already following? UNFOLLOW.
    $conn->query("DELETE FROM follows WHERE follower_id=$follower_id AND followed_id=$followed_id");
    echo json_encode(["status" => "success", "action" => "unfollowed"]);
} else {
    // Not following? FOLLOW.
    $conn->query("INSERT INTO follows (follower_id, followed_id) VALUES ($follower_id, $followed_id)");
    echo json_encode(["status" => "success", "action" => "followed"]);
}
$conn->close();
?>
