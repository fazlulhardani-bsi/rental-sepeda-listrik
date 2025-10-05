<?php
include 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $rental_id = $conn->real_escape_string($_POST['rental_id']);
    
    // Get rental data
    $rental_sql = "SELECT * FROM rental WHERE id = '$rental_id' AND status = 'aktif'";
    $rental_result = $conn->query($rental_sql);
    
    if ($rental_result->num_rows > 0) {
        $rental = $rental_result->fetch_assoc();
        
        // Update rental status
        $update_rental_sql = "UPDATE rental SET status = 'selesai' WHERE id = '$rental_id'";
        
        if ($conn->query($update_rental_sql) === TRUE) {
            // Update sepeda status to available
            $update_sepeda_sql = "UPDATE sepeda SET status = 'tersedia' WHERE id = '{$rental['sepeda_id']}'";
            $conn->query($update_sepeda_sql);
            
            echo json_encode(['success' => true, 'message' => 'Rental berhasil diselesaikan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $conn->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Data rental tidak ditemukan atau sudah selesai']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}
?>