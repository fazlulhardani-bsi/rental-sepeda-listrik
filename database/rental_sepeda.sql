CREATE DATABASE IF NOT EXISTS rental_sepeda;
USE rental_sepeda;

-- Tabel pengguna
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(15),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel sepeda listrik
CREATE TABLE sepeda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    merk VARCHAR(50),
    jenis VARCHAR(50),
    baterai_capacity VARCHAR(20),
    jarak_tempuh VARCHAR(20),
    harga_per_jam DECIMAL(10,2),
    status ENUM('tersedia', 'disewa') DEFAULT 'tersedia',
    gambar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel rental
CREATE TABLE rental (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sepeda_id INT,
    tanggal_rental DATETIME,
    durasi_jam INT,
    total_biaya DECIMAL(10,2),
    lokasi_pengambilan VARCHAR(100),
    catatan TEXT,
    status ENUM('aktif', 'selesai') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (sepeda_id) REFERENCES sepeda(id)
);

-- Data sampel sepeda
INSERT INTO sepeda (nama, merk, jenis, baterai_capacity, jarak_tempuh, harga_per_jam, gambar) VALUES
('E-Bike Pro', 'Xiaomi', 'City Bike', '10Ah', '50 km', 15000, 'ebike1.jpg'),
('Electric Mountain', 'Giant', 'Mountain Bike', '15Ah', '70 km', 20000, 'ebike2.jpg'),
('Urban Rider', 'Polygon', 'Folding Bike', '8Ah', '40 km', 12000, 'ebike3.jpg'),
('Speed Demon', 'Trek', 'Road Bike', '12Ah', '60 km', 18000, 'ebike4.jpg'),
('City Cruiser', 'United', 'City Bike', '9Ah', '45 km', 13000, 'ebike5.jpg'),
('Trail Blazer', 'Wimcycle', 'Mountain Bike', '14Ah', '65 km', 22000, 'ebike6.jpg');

-- Data sampel user (password: 123456)
INSERT INTO users (nama, email, password, no_telepon, alamat) VALUES
('Admin User', 'admin@ebike.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '08123456789', 'Jl. Contoh Alamat No. 123');