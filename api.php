<?php
// XAMPP defaults: user "root", empty password. Fine for localhost only.
const DB_HOST = 'localhost';
const DB_NAME = 'bible_app';
const DB_USER = 'root';
const DB_PASS = '';
const DEBUG   = true; // set to false before putting this on a real server

session_start();
header('Content-Type: application/json');

function out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

// Any uncaught error comes back as JSON, so the page can show it
set_exception_handler(function ($e) {
    out(['error' => DEBUG ? $e->getMessage() : 'Server error.'], 500);
});

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    preg_match('/\[(\d+)\]/', $e->getMessage(), $m);
    $code = isset($m[1]) ? (int)$m[1] : 0;

    if ($code === 2002) {
        $msg = 'MySQL is not running. Start MySQL in the XAMPP Control Panel.';
    } elseif ($code === 1049) {
        $msg = "The database '" . DB_NAME . "' does not exist. Import schema.sql in phpMyAdmin.";
    } elseif ($code === 1045) {
        $msg = 'MySQL refused the login. Check DB_USER and DB_PASS at the top of api.php.';
    } else {
        $msg = 'Database error: ' . $e->getMessage();
    }
    out(['error' => $msg], 500);
}

$in = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? '';

function require_login() {
    if (empty($_SESSION['uid'])) out(['error' => 'Please log in first.'], 401);
    return $_SESSION['uid'];
}

function bookmark_list($pdo, $uid) {
    $s = $pdo->prepare('SELECT reference, translation FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC');
    $s->execute([$uid]);
    return $s->fetchAll(PDO::FETCH_ASSOC);
}

switch ($action) {
    case 'register':
        $email = strtolower(trim($in['email'] ?? ''));
        $pass  = $in['password'] ?? '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
            out(['error' => 'Enter a valid email address.'], 400);
        }
        if (strlen($pass) < 8) out(['error' => 'Password must be at least 8 characters.'], 400);

        try {
            $s = $pdo->prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
            $s->execute([$email, password_hash($pass, PASSWORD_DEFAULT)]);
        } catch (PDOException $e) {
            if (($e->errorInfo[1] ?? 0) === 1062) {
                out(['error' => 'That email is already registered.'], 409);
            }
            if (($e->errorInfo[1] ?? 0) === 1146 || ($e->errorInfo[1] ?? 0) === 1054) {
                out(['error' => 'The tables are missing or outdated. Import the latest schema.sql in phpMyAdmin.'], 500);
            }
            throw $e;
        }
        session_regenerate_id(true);
        $_SESSION['uid'] = (int)$pdo->lastInsertId();
        $_SESSION['email'] = $email;
        out(['email' => $email]);

    case 'login':
        $s = $pdo->prepare('SELECT id, email, password_hash FROM users WHERE email = ?');
        $s->execute([strtolower(trim($in['email'] ?? ''))]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        if (!$row || !password_verify($in['password'] ?? '', $row['password_hash'])) {
            out(['error' => 'Wrong email or password.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['uid'] = (int)$row['id'];
        $_SESSION['email'] = $row['email'];
        out(['email' => $row['email']]);

    case 'logout':
        session_destroy();
        out(['ok' => true]);

    case 'me':
        out(['email' => $_SESSION['email'] ?? null]);

    case 'bookmarks':
        out(['bookmarks' => bookmark_list($pdo, require_login())]);

    case 'bookmark_add':
        $uid = require_login();
        $s = $pdo->prepare('INSERT IGNORE INTO bookmarks (user_id, reference, translation) VALUES (?, ?, ?)');
        $s->execute([$uid, substr($in['reference'] ?? '', 0, 100), substr($in['translation'] ?? '', 0, 20)]);
        out(['bookmarks' => bookmark_list($pdo, $uid)]);

    case 'bookmark_remove':
        $uid = require_login();
        $s = $pdo->prepare('DELETE FROM bookmarks WHERE user_id = ? AND reference = ? AND translation = ?');
        $s->execute([$uid, $in['reference'] ?? '', $in['translation'] ?? '']);
        out(['bookmarks' => bookmark_list($pdo, $uid)]);

    case 'chapter': // verses stored in the database (for example the Waray-Waray Bible)
        $tr = preg_replace('/[^a-z0-9_-]/', '', strtolower($_GET['translation'] ?? ''));
        $s = $pdo->prepare('SELECT verse, text FROM verses WHERE translation = ? AND book_nr = ? AND chapter = ? ORDER BY verse');
        $s->execute([$tr, (int)($_GET['book'] ?? 0), (int)($_GET['chapter'] ?? 0)]);
        out(['verses' => $s->fetchAll(PDO::FETCH_ASSOC)]);

    default:
        out(['error' => 'Unknown action.'], 400);
}