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
        
        // Photo adjustment controls
        this.photoOffsetX = 0;
        this.photoOffsetY = 0;
        this.photoZoom = 1.0;
        
        // Name adjustment controls
        this.nameOffsetX = 0;
        this.nameOffsetY = 0;
        
        // Canvas dimensions: 1024 x 1536
        this.canvas.width = 1024;
        this.canvas.height = 1536;
        
        // Photo position (square, center-cropped)
        this.photoPosition = {
            x: 332,
            y: 385,
            size: 360
        };
        
        // Name text position
        this.namePosition = {
            x: 310,
            y: 1060,
            maxWidth: 440,
            fontSize: 42,
            font: "42px 'Patrick Hand', cursive",
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
                // Show name adjustment controls when user enters name
                const nameControls = document.getElementById('nameControls');
                if (nameControls && this.userName.length > 0) {
                    nameControls.style.display = 'flex';
                } else if (nameControls && this.userName.length === 0) {
                    nameControls.style.display = 'none';
                }
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
        
        // Photo position controls
        const moveUpBtn = document.getElementById('movePhotoUp');
        const moveDownBtn = document.getElementById('movePhotoDown');
        const moveLeftBtn = document.getElementById('movePhotoLeft');
        const moveRightBtn = document.getElementById('movePhotoRight');
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        
        if (moveUpBtn) moveUpBtn.addEventListener('click', () => { this.photoOffsetY -= 20; this.renderCard(); });
        if (moveDownBtn) moveDownBtn.addEventListener('click', () => { this.photoOffsetY += 20; this.renderCard(); });
        if (moveLeftBtn) moveLeftBtn.addEventListener('click', () => { this.photoOffsetX -= 20; this.renderCard(); });
        if (moveRightBtn) moveRightBtn.addEventListener('click', () => { this.photoOffsetX += 20; this.renderCard(); });
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => { this.photoZoom = Math.min(this.photoZoom + 0.1, 3.0); this.renderCard(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { this.photoZoom = Math.max(this.photoZoom - 0.1, 0.5); this.renderCard(); });
        
        // Name position controls
        const moveNameUpBtn = document.getElementById('moveNameUp');
        const moveNameDownBtn = document.getElementById('moveNameDown');
        const moveNameLeftBtn = document.getElementById('moveNameLeft');
        const moveNameRightBtn = document.getElementById('moveNameRight');
        
        if (moveNameUpBtn) moveNameUpBtn.addEventListener('click', () => { this.nameOffsetY -= 5; this.renderCard(); });
        if (moveNameDownBtn) moveNameDownBtn.addEventListener('click', () => { this.nameOffsetY += 5; this.renderCard(); });
        if (moveNameLeftBtn) moveNameLeftBtn.addEventListener('click', () => { this.nameOffsetX -= 5; this.renderCard(); });
        if (moveNameRightBtn) moveNameRightBtn.addEventListener('click', () => { this.nameOffsetX += 5; this.renderCard(); });

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
                // Show photo adjustment controls
                const photoControls = document.getElementById('photoControls');
                if (photoControls) photoControls.style.display = 'flex';
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

        // Draw user photo (360x360 square at 332, 385)
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

            // Apply zoom and offset adjustments
            const zoomedSize = sourceSize / this.photoZoom;
            const adjustedSourceX = sourceX + (sourceSize - zoomedSize) / 2 + this.photoOffsetX;
            const adjustedSourceY = sourceY + (sourceSize - zoomedSize) / 2 + this.photoOffsetY;
            
            // Draw center-cropped square image with user adjustments
            this.ctx.drawImage(
                this.userImage,
                adjustedSourceX, adjustedSourceY, zoomedSize, zoomedSize,
                this.photoPosition.x, this.photoPosition.y, size, size
            );

            this.ctx.restore();
        }

        // Draw name text (uppercase, max 24 chars)
        if (this.userName) {
            this.ctx.save();
            
            const upperName = this.userName.toUpperCase();
            
            // Font styling: Patrick Hand, 42px, #111
            let fontSize = this.namePosition.fontSize;
            this.ctx.font = `${fontSize}px 'Patrick Hand', cursive`;
            this.ctx.fillStyle = this.namePosition.color;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'bottom';
            
            // Letter spacing
            this.ctx.letterSpacing = `${this.namePosition.letterSpacing}px`;
            
            // Check text width and reduce font size if needed
            let textWidth = this.ctx.measureText(upperName).width;
            while (textWidth > this.namePosition.maxWidth && fontSize > 20) {
                fontSize -= 2;
                this.ctx.font = `${fontSize}px 'Patrick Hand', cursive`;
                textWidth = this.ctx.measureText(upperName).width;
            }
            
            // Draw text at position with user adjustments
            this.ctx.fillText(upperName, this.namePosition.x + this.nameOffsetX, this.namePosition.y + this.nameOffsetY);
            
            this.ctx.restore();
        }
    }

    resetCard() {
        this.userName = '';
        this.userImage = null;
        this.photoOffsetX = 0;
        this.photoOffsetY = 0;
        this.photoZoom = 1.0;
        this.nameOffsetX = 0;
        this.nameOffsetY = 0;
        const nameInput = document.getElementById('nameInput');
        const photoInput = document.getElementById('photoUpload');
        if (nameInput) nameInput.value = '';
        if (photoInput) photoInput.value = '';
        const photoControls = document.getElementById('photoControls');
        const nameControls = document.getElementById('nameControls');
        if (photoControls) photoControls.style.display = 'none';
        if (nameControls) nameControls.style.display = 'none';
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
