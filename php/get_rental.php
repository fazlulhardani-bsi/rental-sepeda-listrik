<?php
include 'config.php';

$user_id = isset($_GET['user_id']) ? $conn->real_escape_string($_GET['user_id']) : '';

if (empty($user_id)) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT r.*, s.nama as nama_sepeda, s.merk, s.jenis 
        FROM rental r 
        JOIN sepeda s ON r.sepeda_id = s.id 
        WHERE r.user_id = '$user_id' 
        ORDER BY r.created_at DESC";

$result = $conn->query($sql);

$rentals = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $rentals[] = $row;
    }
}

echo json_encode($rentals);
?>