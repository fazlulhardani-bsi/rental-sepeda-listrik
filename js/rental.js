// Rental form functionality
class RentalForm {
    constructor() {
        this.apiBase = 'php/';
        this.bikeId = this.getBikeIdFromURL();
        this.bikeData = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadBikeData();
        this.setupEventListeners();
    }

    getBikeIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('bike_id');
    }

    checkAuth() {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            app.showNotification('Silakan login terlebih dahulu', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    async loadBikeData() {
        if (!this.bikeId) {
            app.showNotification('ID sepeda tidak valid', 'error');
            setTimeout(() => {
                window.location.href = 'sepeda.html';
            }, 2000);
            return;
        }

        try {
            // Set hidden input
            document.getElementById('sepeda_id').value = this.bikeId;

            const response = await fetch(this.apiBase + 'get_sepeda.php?id=' + this.bikeId);
            const sepeda = await response.json();
            
            if (sepeda.length > 0) {
                this.bikeData = sepeda[0];
                
                // Check if bike is available
                if (this.bikeData.status !== 'tersedia') {
                    app.showNotification('Sepeda sedang tidak tersedia', 'error');
                    setTimeout(() => {
                        window.location.href = 'sepeda.html';
                    }, 2000);
                    return;
                }
                
                this.displayBikeDetails();
            } else {
                throw new Error('Sepeda tidak ditemukan');
            }
        } catch (error) {
            app.showNotification('Gagal memuat data sepeda', 'error');
            console.error('Error loading bike data:', error);
        }
    }

    displayBikeDetails() {
        const container = document.getElementById('bikeDetails');
        const bike = this.bikeData;

        container.innerHTML = `
            <div class="bike-rental-info">
                <div class="bike-image">
                    <i class="fas fa-bicycle"></i>
                </div>
                <div class="bike-details">
                    <h4>${bike.nama}</h4>
                    <p><strong>Merk:</strong> ${bike.merk}</p>
                    <p><strong>Jenis:</strong> ${bike.jenis}</p>
                    <p><strong>Baterai:</strong> ${bike.baterai_capacity}</p>
                    <p><strong>Jarak Tempuh:</strong> ${bike.jarak_tempuh}</p>
                    <p class="rental-price"><strong>Harga:</strong> Rp ${parseInt(bike.harga_per_jam).toLocaleString('id-ID')}/jam</p>
                </div>
            </div>
        `;

        // Update price display
        document.getElementById('pricePerHour').textContent = `Rp ${parseInt(bike.harga_per_jam).toLocaleString('id-ID')}`;
        this.updatePriceCalculation();
    }

    setupEventListeners() {
        const rentalForm = document.getElementById('rentalForm');
        const durasiInput = document.getElementById('durasi_jam');

        if (rentalForm) {
            rentalForm.addEventListener('submit', (e) => this.handleRentalSubmit(e));
        }

        if (durasiInput) {
            durasiInput.addEventListener('input', () => this.updatePriceCalculation());
        }

        // Set minimum datetime to current time
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('tanggal_rental').min = now.toISOString().slice(0, 16);
    }

    updatePriceCalculation() {
        const durasi = parseInt(document.getElementById('durasi_jam').value) || 0;
        const pricePerHour = this.bikeData ? parseFloat(this.bikeData.harga_per_jam) : 0;
        const serviceFee = 5000; // Biaya layanan tetap
        const totalPrice = (durasi * pricePerHour) + serviceFee;

        document.getElementById('durationDisplay').textContent = `${durasi} jam`;
        document.getElementById('totalPrice').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    }

    async handleRentalSubmit(e) {
        e.preventDefault();
        
        if (!this.bikeData) {
            app.showNotification('Data sepeda tidak valid', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const durasi = parseInt(formData.get('durasi_jam'));

        if (durasi < 1) {
            app.showNotification('Durasi rental minimal 1 jam', 'error');
            return;
        }

        if (!document.getElementById('agree_terms').checked) {
            app.showNotification('Anda harus menyetujui syarat dan ketentuan', 'error');
            return;
        }

        try {
            const rentalData = {
                user_id: this.currentUser.id,
                sepeda_id: this.bikeId,
                durasi_jam: durasi,
                tanggal_rental: formData.get('tanggal_rental'),
                lokasi_pengambilan: formData.get('lokasi_pengambilan'),
                catatan: formData.get('catatan')
            };

            const response = await fetch(this.apiBase + 'rent_sepeda.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentalData)
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Rental berhasil diproses!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                app.showNotification(result.message, 'error');
            }
        } catch (error) {
            app.showNotification('Terjadi kesalahan saat memproses rental', 'error');
            console.error('Rental submit error:', error);
        }
    }
}

// Initialize rental form
const rentalForm = new RentalForm();