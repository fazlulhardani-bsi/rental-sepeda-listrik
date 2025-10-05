<?php
include 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $sepeda_id = $conn->real_escape_string($_POST['sepeda_id']);
    $status = $conn->real_escape_string($_POST['status']);
    
    $sql = "UPDATE sepeda SET status = '$status' WHERE id = '$sepeda_id'";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Status sepeda berhasil diupdate']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}
?>