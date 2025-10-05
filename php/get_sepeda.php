<?php
include 'config.php';

$id = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : '';

if (!empty($id)) {
    // Get specific bike by ID
    $sql = "SELECT * FROM sepeda WHERE id = '$id'";
} else {
    // Get all bikes
    $sql = "SELECT * FROM sepeda ORDER BY nama";
}

$result = $conn->query($sql);

$sepeda = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $sepeda[] = $row;
    }
}

echo json_encode($sepeda);
?>