<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nama = $conn->real_escape_string($_POST['nama']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $no_telepon = $conn->real_escape_string($_POST['no_telepon']);
    $alamat = $conn->real_escape_string($_POST['alamat']);
    
    // Check if email already exists
    $check_sql = "SELECT id FROM users WHERE email = '$email'";
    $check_result = $conn->query($check_sql);
    
    if ($check_result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar']);
    } else {
        $sql = "INSERT INTO users (nama, email, password, no_telepon, alamat) 
                VALUES ('$nama', '$email', '$password', '$no_telepon', '$alamat')";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true, 'message' => 'Pendaftaran berhasil']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $conn->error]);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}
?>