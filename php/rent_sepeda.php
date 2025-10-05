<?php
include 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Handle JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $conn->real_escape_string($input['user_id']);
    $sepeda_id = $conn->real_escape_string($input['sepeda_id']);
    $durasi_jam = $conn->real_escape_string($input['durasi_jam']);
    $tanggal_rental = $conn->real_escape_string($input['tanggal_rental']);
    $lokasi_pengambilan = $conn->real_escape_string($input['lokasi_pengambilan']);
    $catatan = $conn->real_escape_string($input['catatan'] ?? '');
    
    // Get sepeda price
    $price_sql = "SELECT harga_per_jam FROM sepeda WHERE id = '$sepeda_id' AND status = 'tersedia'";
    $price_result = $conn->query($price_sql);
    
    if ($price_result->num_rows > 0) {
        $sepeda = $price_result->fetch_assoc();
        $biaya_layanan = 5000;
        $total_biaya = ($sepeda['harga_per_jam'] * $durasi_jam) + $biaya_layanan;
        
        // Insert rental record
        $sql = "INSERT INTO rental (user_id, sepeda_id, tanggal_rental, durasi_jam, total_biaya, lokasi_pengambilan, catatan) 
                VALUES ('$user_id', '$sepeda_id', '$tanggal_rental', '$durasi_jam', '$total_biaya', '$lokasi_pengambilan', '$catatan')";
        
        if ($conn->query($sql) === TRUE) {
            // Update sepeda status
            $update_sql = "UPDATE sepeda SET status = 'disewa' WHERE id = '$sepeda_id'";
            $conn->query($update_sql);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Sepeda berhasil disewa',
                'rental_id' => $conn->insert_id
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $conn->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Sepeda tidak tersedia atau tidak ditemukan']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}
?>