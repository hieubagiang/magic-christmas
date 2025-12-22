<?php
// Magic Christmas - Upload Handler
// Directory to store uploaded images
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// API endpoint for different actions
$action = $_GET['action'] ?? $_POST['action'] ?? null;

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Upload image
if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['photo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit();
    }

    $file = $_FILES['photo'];
    $fileName = basename($file['name']);
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Validate file
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($fileExt, $allowedExts)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type']);
        exit();
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
        http_response_code(400);
        echo json_encode(['error' => 'File too large (max 5MB)']);
        exit();
    }

    // Generate unique filename
    $newFileName = time() . '_' . uniqid() . '.' . $fileExt;
    $filePath = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode([
            'success' => true,
            'filename' => $newFileName,
            'url' => '/uploads/' . $newFileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
    }
    exit();
}

// Get all uploaded images
if ($action === 'list') {
    $images = [];
    if (is_dir($uploadDir)) {
        $files = scandir($uploadDir);
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $images[] = [
                    'filename' => $file,
                    'url' => '/uploads/' . $file,
                    'timestamp' => filemtime($uploadDir . $file)
                ];
            }
        }
        // Sort by timestamp desc
        usort($images, function($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });
    }
    echo json_encode(['images' => $images]);
    exit();
}

// Delete image
if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $filename = $_POST['filename'] ?? null;
    if (!$filename) {
        http_response_code(400);
        echo json_encode(['error' => 'No filename provided']);
        exit();
    }

    // Prevent directory traversal
    if (strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid filename']);
        exit();
    }

    $filePath = $uploadDir . $filename;
    if (file_exists($filePath) && is_file($filePath)) {
        if (unlink($filePath)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete file']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
    }
    exit();
}

// Default error
http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
?>
