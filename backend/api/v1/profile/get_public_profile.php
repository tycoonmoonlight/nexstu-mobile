<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../../../config/database.php';

// Get Current User ID (Viewer) from Token (if available)
$headers = getallheaders();
$auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$viewer_id = 0;
if ($token = str_replace('Bearer ', '', $auth)) {
    $parts = explode('.', $token);
    if(count($parts) >= 2) {
        $user_data = json_decode(base64_decode($parts[1]), true);
        $viewer_id = $user_data['data']['id'];
    }
}

$target_id = isset($_GET['user_id']) ? $_GET['user_id'] : 0;
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 1. Get User Info
$user = $conn->query("SELECT id, email FROM users WHERE id = $target_id")->fetch_assoc();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit();
}

// 2. Get Stats
$post_count = $conn->query("SELECT COUNT(*) as c FROM posts WHERE user_id = $target_id")->fetch_assoc()['c'];
$like_count = $conn->query("SELECT COUNT(*) as c FROM likes JOIN posts ON likes.post_id = posts.id WHERE posts.user_id = $target_id")->fetch_assoc()['c'];
$followers_count = $conn->query("SELECT COUNT(*) as c FROM follows WHERE followed_id = $target_id")->fetch_assoc()['c'];
$following_count = $conn->query("SELECT COUNT(*) as c FROM follows WHERE follower_id = $target_id")->fetch_assoc()['c'];

// 3. CHECK IF FOLLOWING (New Logic)
$is_following = false;
if ($viewer_id > 0) {
    $check = $conn->query("SELECT id FROM follows WHERE follower_id = $viewer_id AND followed_id = $target_id");
    if ($check->num_rows > 0) $is_following = true;
}

// 4. Get Posts
$result = $conn->query("SELECT media_url, caption FROM posts WHERE user_id = $target_id ORDER BY created_at DESC");
$posts = [];
while($row = $result->fetch_assoc()) $posts[] = $row;

echo json_encode([
    "status" => "success",
    "data" => [
        "user" => $user,
        "is_following" => $is_following, // Send status to app
        "stats" => [
            "posts" => $post_count,
            "followers" => $followers_count,
            "following" => $following_count,
            "likes" => $like_count
        ],
        "posts" => $posts
    ]
]);
$conn->close();
?>
