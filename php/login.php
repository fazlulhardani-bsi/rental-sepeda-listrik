<?php
include 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password'];
    
    $sql = "SELECT id, nama, email, password FROM users WHERE email = '$email'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'nama' => $user['nama'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Password salah']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}
?>