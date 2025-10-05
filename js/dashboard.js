// Dashboard functionality
class Dashboard {
    constructor() {
        this.apiBase = 'php/';
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadUserData();
        this.loadRentalHistory();
        this.setupEventListeners();
    }

    checkAuth() {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = JSON.parse(userData);
        document.getElementById('userName').textContent = this.currentUser.nama;
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    async loadUserData() {
        try {
            const response = await fetch(this.apiBase + 'get_rental.php?user_id=' + this.currentUser.id);
            const rentals = await response.json();
            
            this.updateStats(rentals);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadRentalHistory() {
        try {
            const response = await fetch(this.apiBase + 'get_rental.php?user_id=' + this.currentUser.id);
            const rentals = await response.json();
            
            this.displayRentalHistory(rentals);
        } catch (error) {
            console.error('Error loading rental history:', error);
        }
    }

    updateStats(rentals) {
        const totalRental = rentals.length;
        const activeRental = rentals.filter(rental => rental.status === 'aktif').length;
        const completedRental = rentals.filter(rental => rental.status === 'selesai').length;

        document.getElementById('totalRental').textContent = totalRental;
        document.getElementById('activeRental').textContent = activeRental;
        document.getElementById('completedRental').textContent = completedRental;
    }

    displayRentalHistory(rentals) {
        const container = document.getElementById('rentalList');
        
        if (rentals.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-bicycle"></i>
                    <p>Belum ada riwayat rental</p>
                    <a href="sepeda.html" class="btn-primary">Sewa Sepeda Pertama</a>
                </div>
            `;
            return;
        }

        container.innerHTML = rentals.map(rental => `
            <div class="rental-item ${rental.status}">
                <div class="rental-info">
                    <h4>${rental.nama_sepeda}</h4>
                    <div class="rental-details">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(rental.tanggal_rental)}</span>
                        <span><i class="fas fa-clock"></i> ${rental.durasi_jam} jam</span>
                        <span><i class="fas fa-tag"></i> Rp ${parseInt(rental.total_biaya).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <div class="rental-status">
                    <span class="status-badge ${rental.status}">${rental.status}</span>
                    ${rental.status === 'aktif' ? 
                        `<button class="btn-secondary btn-sm" onclick="dashboard.endRental(${rental.id})">Selesaikan</button>` : 
                        ''
                    }
                </div>
            </div>
        `).join('');
    }

    async endRental(rentalId) {
        if (!confirm('Apakah Anda yakin ingin menyelesaikan rental ini?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('rental_id', rentalId);

            const response = await fetch(this.apiBase + 'end_rental.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Rental berhasil diselesaikan', 'success');
                this.loadUserData();
                this.loadRentalHistory();
            } else {
                app.showNotification(result.message, 'error');
            }
        } catch (error) {
            app.showNotification('Terjadi kesalahan', 'error');
            console.error('End rental error:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    logout() {
        localStorage.removeItem('currentUser');
        app.showNotification('Logout berhasil', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Initialize dashboard
const dashboard = new Dashboard();