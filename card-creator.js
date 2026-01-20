/**
 * L'AMOUR - ID Card Generator
 * HTML/CSS Overlay + html2canvas approach
 * 
 * FIXED POSITIONS (scaled to 512x768 display):
 * - Photo: 180x180px at (166px, 182.5px)
 * - Name: Left-aligned at (155px, 520px)
 * 
 * Template: frame.jpg (1024x1536 original, displayed at 512x768)
 */

class CardCreator {
    constructor() {
        this.cardContainer = document.getElementById('cardContainer');
        this.cardTemplate = document.getElementById('cardTemplate');
        this.cardPhoto = document.getElementById('cardPhoto');
        this.cardName = document.getElementById('cardName');
        this.nameInput = document.getElementById('nameInput');
        this.photoUpload = document.getElementById('photoUpload');
        this.uploadBtn = document.getElementById('uploadPhotoBtn');
        this.resetBtn = document.getElementById('resetCard');
        this.downloadBtn = document.getElementById('downloadCard');
        
        this.userName = '';
        this.userImageData = null;
        
        if (!this.cardContainer) {
            console.error('CardCreator: Card container not found');
            return;
        }
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Name input
        if (this.nameInput) {
            this.nameInput.addEventListener('input', (e) => {
                this.userName = e.target.value.slice(0, 24);
                this.updateCard();
            });
        }

        // Photo upload
        if (this.uploadBtn && this.photoUpload) {
            this.uploadBtn.addEventListener('click', () => {
                this.photoUpload.click();
            });

            this.photoUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.loadUserImage(file);
                }
            });
        }

        // Reset button
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }

        // Download button
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.download());
        }
    }

    loadUserImage(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Center-crop the image to square
                const croppedCanvas = this.centerCropImage(img);
                this.userImageData = croppedCanvas.toDataURL('image/png');
                this.updateCard();
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    centerCropImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
        return canvas;
    }

    updateCard() {
        // Update name
        if (this.cardName) {
            this.cardName.textContent = this.userName.toUpperCase();
        }

        // Update photo
        if (this.userImageData && this.cardPhoto) {
            this.cardPhoto.src = this.userImageData;
            this.cardPhoto.style.display = 'block';
        }
    }

    reset() {
        this.userName = '';
        this.userImageData = null;

        if (this.nameInput) this.nameInput.value = '';
        if (this.photoUpload) this.photoUpload.value = '';
        if (this.cardPhoto) this.cardPhoto.style.display = 'none';
        if (this.cardName) this.cardName.textContent = '';
    }

    async download() {
        try {
            const element = this.cardContainer;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false
            });

            const link = document.createElement('a');
            const safeName = this.userName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'guest';

            link.download = `lamour-experience-${safeName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('CardCreator: Failed to download card', error);
            alert('Failed to download card. Please try again.');
        }
    }
}

// Initialize when DOM is ready
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardCreator;
}
