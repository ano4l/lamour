/**
 * L'AMOUR - ID Card Generator
 * Canvas-based ID card with locked template
 * Only editable: Photo (360x360 at 332,360) and Name (at 280,1015)
 */

class CardCreator {
    constructor() {
        this.canvas = document.getElementById('cardCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.templateImage = new Image();
        this.userImage = null;
        this.userName = '';
        
        // Canvas dimensions: 1024 x 1536
        this.canvas.width = 1024;
        this.canvas.height = 1536;
        
        // Photo position (square, center-cropped)
        this.photoPosition = {
            x: 332,
            y: 365,
            size: 360
        };
        
        // Name text position
        this.namePosition = {
            x: 310,
            y: 1040,
            maxWidth: 440,
            fontSize: 42,
            font: "42px 'Permanent Marker', cursive",
            color: '#111111',
            letterSpacing: 1.5
        };
        
        this.init();
    }

    init() {
        // Load the template image (frame.jpg)
        this.templateImage.crossOrigin = 'anonymous';
        this.templateImage.onload = () => {
            this.renderCard();
        };
        
        // Set template image source
        this.templateImage.src = 'frame.jpg';
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Name input (max 24 characters)
        const nameInput = document.getElementById('nameInput');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.userName = e.target.value.slice(0, 24);
                nameInput.value = this.userName;
                this.renderCard();
            });
        }

        // Image upload
        const uploadBtn = document.getElementById('uploadPhotoBtn');
        const fileInput = document.getElementById('photoUpload');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadUserImage(file);
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetCard');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCard();
            });
        }

        // Download button
        const downloadBtn = document.getElementById('downloadCard');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadCard();
            });
        }
    }

    loadUserImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.userImage = img;
                this.renderCard();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    renderCard() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw template background at exact size (1024x1536)
        if (this.templateImage.complete) {
            this.ctx.drawImage(this.templateImage, 0, 0, 1024, 1536);
        } else {
            // Draw placeholder background if template not loaded
            this.ctx.fillStyle = '#FFE4E6';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw placeholder text
            this.ctx.fillStyle = '#000';
            this.ctx.font = '24px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading template...', this.canvas.width / 2, this.canvas.height / 2);
        }

        // Draw user photo (360x360 square at 332, 365)
        if (this.userImage) {
            this.ctx.save();
            
            // Center-crop to square
            const size = this.photoPosition.size;
            const imgWidth = this.userImage.width;
            const imgHeight = this.userImage.height;
            
            let sourceX, sourceY, sourceSize;
            
            if (imgWidth > imgHeight) {
                // Landscape: crop width
                sourceSize = imgHeight;
                sourceX = (imgWidth - imgHeight) / 2;
                sourceY = 0;
            } else {
                // Portrait or square: crop height
                sourceSize = imgWidth;
                sourceX = 0;
                sourceY = (imgHeight - imgWidth) / 2;
            }

            // Draw center-cropped square image (no clipping, perfect fit)
            this.ctx.drawImage(
                this.userImage,
                sourceX, sourceY, sourceSize, sourceSize,
                this.photoPosition.x, this.photoPosition.y, size, size
            );

            this.ctx.restore();
        }

        // Draw name text (uppercase, max 24 chars)
        if (this.userName) {
            this.ctx.save();
            
            const upperName = this.userName.toUpperCase();
            
            // Font styling: Permanent Marker, 42px, #111
            let fontSize = this.namePosition.fontSize;
            this.ctx.font = `${fontSize}px 'Permanent Marker', cursive`;
            this.ctx.fillStyle = this.namePosition.color;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'bottom';
            
            // Letter spacing
            this.ctx.letterSpacing = `${this.namePosition.letterSpacing}px`;
            
            // Check text width and reduce font size if needed
            let textWidth = this.ctx.measureText(upperName).width;
            while (textWidth > this.namePosition.maxWidth && fontSize > 20) {
                fontSize -= 2;
                this.ctx.font = `${fontSize}px 'Permanent Marker', cursive`;
                textWidth = this.ctx.measureText(upperName).width;
            }
            
            // Draw text at exact position (310, 1040)
            this.ctx.fillText(upperName, this.namePosition.x, this.namePosition.y);
            
            this.ctx.restore();
        }
    }

    resetCard() {
        this.userName = '';
        this.userImage = null;
        const nameInput = document.getElementById('nameInput');
        const photoInput = document.getElementById('photoUpload');
        if (nameInput) nameInput.value = '';
        if (photoInput) photoInput.value = '';
        this.renderCard();
    }

    downloadCard() {
        // Create download link with username in filename
        const link = document.createElement('a');
        const sanitizedName = this.userName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'guest';
        link.download = `lamour-experience-${sanitizedName}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardCreator;
}
