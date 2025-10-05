// Aplikasi Rental Sepeda Listrik
class EBikeRental {
    constructor() {
        this.apiBase = 'php/';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadSepeda();
        this.setupEventListeners();
    }

    // Check authentication status
    checkAuth() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateNavigation();
        }
    }

    // Update navigation based on auth status
    updateNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && this.currentUser) {
            navMenu.innerHTML = `
                <a href="index.html">Beranda</a>
                <a href="sepeda.html">Sepeda</a>
                <a href="dashboard.html" class="btn-login">Dashboard</a>
                <a href="#" class="btn-register" id="logoutBtn">Keluar</a>
            `;
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Filter sepeda
        const filterJenis = document.getElementById('filterJenis');
        const filterHarga = document.getElementById('filterHarga');
        if (filterJenis) filterJenis.addEventListener('change', () => this.filterSepeda());
        if (filterHarga) filterHarga.addEventListener('change', () => this.filterSepeda());

        // Hamburger menu
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', this.toggleMobileMenu);
        }

        // Rental form navigation
        const rentButtons = document.querySelectorAll('[onclick^="app.rentSepeda"]');
        rentButtons.forEach(button => {
            button.onclick = null;
            button.addEventListener('click', (e) => {
                const sepedaId = e.target.getAttribute('onclick').match(/\d+/)[0];
                this.navigateToRental(sepedaId);
            });
        });
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch(this.apiBase + 'login.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                this.showNotification('Login berhasil!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Terjadi kesalahan saat login', 'error');
            console.error('Login error:', error);
        }
    }

    // Handle register
    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch(this.apiBase + 'register.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Pendaftaran berhasil! Silakan login.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Terjadi kesalahan saat pendaftaran', 'error');
            console.error('Register error:', error);
        }
    }

    // Load sepeda data
    async loadSepeda() {
        const container = document.getElementById('sepedaContainer');
        if (!container) return;

        try {
            const response = await fetch(this.apiBase + 'get_sepeda.php');
            const sepeda = await response.json();
            
            this.displaySepeda(sepeda);
        } catch (error) {
            console.error('Error loading sepeda:', error);
            container.innerHTML = '<p class="text-center">Terjadi kesalahan saat memuat data sepeda.</p>';
        }
    }

    // Display sepeda in grid
    displaySepeda(sepeda) {
        const container = document.getElementById('sepedaContainer');
        if (!container) return;

        if (sepeda.length === 0) {
            container.innerHTML = '<p class="text-center">Tidak ada sepeda tersedia.</p>';
            return;
        }

        container.innerHTML = sepeda.map(bike => `
            <div class="sepeda-card" data-jenis="${bike.jenis}" data-harga="${bike.harga_per_jam}">
                <div class="sepeda-image">
                    <i class="fas fa-bicycle"></i>
                </div>
                <div class="sepeda-content">
                    <h3>${bike.nama}</h3>
                    <div class="sepeda-meta">
                        <span>${bike.merk}</span>
                        <span class="status ${bike.status}">${bike.status}</span>
                    </div>
                    <div class="sepeda-features">
                        <div><i class="fas fa-battery-full"></i> ${bike.baterai_capacity}</div>
                        <div><i class="fas fa-road"></i> ${bike.jarak_tempuh}</div>
                        <div><i class="fas fa-tag"></i> ${bike.jenis}</div>
                    </div>
                    <div class="sepeda-price">
                        <span class="price">Rp ${parseInt(bike.harga_per_jam).toLocaleString('id-ID')}/jam</span>
                        ${bike.status === 'tersedia' ? 
                            `<button class="btn-primary" onclick="app.rentSepeda(${bike.id})">Sewa</button>` : 
                            `<button class="btn-secondary" disabled>Tidak Tersedia</button>`
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Filter sepeda
    filterSepeda() {
        const jenisFilter = document.getElementById('filterJenis').value;
        const hargaFilter = document.getElementById('filterHarga').value;
        const cards = document.querySelectorAll('.sepeda-card');

        cards.forEach(card => {
            const jenis = card.dataset.jenis;
            const harga = parseFloat(card.dataset.harga);
            
            let show = true;

            // Filter jenis
            if (jenisFilter !== 'all' && jenis !== jenisFilter) {
                show = false;
            }

            // Filter harga
            if (hargaFilter !== 'all') {
                if (hargaFilter === 'low' && harga > 15000) show = false;
                if (hargaFilter === 'medium' && (harga <= 15000 || harga > 18000)) show = false;
                if (hargaFilter === 'high' && harga <= 18000) show = false;
            }

            card.style.display = show ? 'block' : 'none';
        });
    }

    // Navigate to rental form
    navigateToRental(sepedaId) {
        if (!this.currentUser) {
            this.showNotification('Silakan login terlebih dahulu', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        window.location.href = `rental.html?bike_id=${sepedaId}`;
    }

    // Rent sepeda
    async rentSepeda(sepedaId) {
        this.navigateToRental(sepedaId);
    }

    // Update sepeda status
    async updateSepedaStatus(sepedaId, status) {
        try {
            const formData = new FormData();
            formData.append('sepeda_id', sepedaId);
            formData.append('status', status);

            const response = await fetch(this.apiBase + 'update_sepeda.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Status sepeda berhasil diupdate', 'success');
                this.loadSepeda();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Terjadi kesalahan saat update status', 'error');
            console.error('Update status error:', error);
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showNotification('Logout berhasil', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles for notification if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 5px;
                    color: white;
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    min-width: 300px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease;
                }
                .notification.success { background: var(--success); }
                .notification.error { background: var(--danger); }
                .notification.warning { background: var(--warning); }
                .notification.info { background: var(--secondary); }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Show terms modal
    showTerms() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Syarat dan Ketentuan</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Syarat & Ketentuan Rental Sepeda Listrik:</strong></p>
                    <ol>
                        <li>Penyewa harus berusia minimal 17 tahun</li>
                        <li>Menyimpan KTP asli sebagai jaminan</li>
                        <li>Durasi rental maksimal 24 jam</li>
                        <li>Dilarang menggunakan sepeda di jalan tol</li>
                        <li>Bertanggung jawab penuh atas kerusakan selama masa rental</li>
                        <li>Baterai akan diisi penuh saat pengambilan</li>
                        <li>Denda keterlambatan Rp 10.000 per jam</li>
                    </ol>
                </div>
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Mengerti</button>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.body.appendChild(modal);
    }
}

// Initialize app
const app = new EBikeRental();