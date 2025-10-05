<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$host = "localhost";
$username = "root";
$password = "";
$database = "rental_sepeda";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal: ' . $conn->connect_error]));
}
?>