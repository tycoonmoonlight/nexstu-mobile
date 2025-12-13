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
$user_id = $user_data['data']['id'];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 1. Get Post Count
$post_count = $conn->query("SELECT COUNT(*) as c FROM posts WHERE user_id = $user_id")->fetch_assoc()['c'];

// 2. Get Total Likes Received (How many people liked YOUR posts)
$like_count = $conn->query("
    SELECT COUNT(*) as c 
    FROM likes 
    JOIN posts ON likes.post_id = posts.id 
    WHERE posts.user_id = $user_id
")->fetch_assoc()['c'];

// 3. Get Your Posts (Newest first)
$sql_posts = "SELECT id, media_url, caption, created_at FROM posts WHERE user_id = $user_id ORDER BY created_at DESC";
$result = $conn->query($sql_posts);
$posts = [];
while($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

echo json_encode([
    "status" => "success", 
    "data" => [
        "stats" => [
            "posts" => $post_count,
            "likes_received" => $like_count,
            "followers" => 0 // Placeholder for future
        ],
        "posts" => $posts
    ]
]);

$conn->close();
?>
