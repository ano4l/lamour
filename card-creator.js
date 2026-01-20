/**
 * L'AMOUR - ID Card Generator
 * Canvas-based ID card with locked template
 * 
 * FIXED POSITIONS (no user adjustment):
 * - Photo: 360x360px square at (332, 365)
 * - Name: Left-aligned at (310, 1040), max width 440px
 * 
 * Canvas: 1024 x 1536 pixels
 * Template: frame.jpg
 */

class CardCreator {
    constructor() {
        this.canvas = document.getElementById('cardCanvas');
        if (!this.canvas) {
            console.error('CardCreator: Canvas element #cardCanvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.templateImage = new Image();
        this.userImage = null;
        this.userName = '';
        this.templateLoaded = false;
        
        // Fixed canvas dimensions
        this.CANVAS_WIDTH = 1024;
        this.CANVAS_HEIGHT = 1536;
        
        // Fixed photo position and size (the empty box in the template)
        this.PHOTO_X = 332;
        this.PHOTO_Y = 365;
        this.PHOTO_SIZE = 360;
        
        // Fixed name text position (next to NAME: label)
        this.NAME_X = 310;
        this.NAME_Y = 1040;
        this.NAME_MAX_WIDTH = 440;
        this.NAME_FONT_SIZE = 42;
        this.NAME_FONT = "'Patrick Hand', cursive";
        this.NAME_COLOR = '#111111';
        
        this.init();
    }

    init() {
        // Set canvas dimensions
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        
        // Load the template image
        this.templateImage.crossOrigin = 'anonymous';
        
        this.templateImage.onload = () => {
            this.templateLoaded = true;
            this.render();
        };
        
        this.templateImage.onerror = () => {
            console.error('CardCreator: Failed to load template image frame.jpg');
            this.renderPlaceholder();
        };
        
        this.templateImage.src = 'frame.jpg';
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Name input
        const nameInput = document.getElementById('nameInput');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.userName = e.target.value.slice(0, 24);
                nameInput.value = this.userName;
                this.render();
            });
        }

        // Photo upload button
        const uploadBtn = document.getElementById('uploadPhotoBtn');
        const fileInput = document.getElementById('photoUpload');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.loadUserImage(file);
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetCard');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Download button
        const downloadBtn = document.getElementById('downloadCard');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.download());
        }
    }

    loadUserImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                this.userImage = img;
                this.render();
            };
            
            img.onerror = () => {
                console.error('CardCreator: Failed to load user image');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            console.error('CardCreator: Failed to read file');
        };
        
        reader.readAsDataURL(file);
    }

    renderPlaceholder() {
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#999';
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Loading template...', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        // Step 1: Draw template background
        if (this.templateLoaded && this.templateImage.complete) {
            this.ctx.drawImage(
                this.templateImage,
                0, 0,
                this.CANVAS_WIDTH, this.CANVAS_HEIGHT
            );
        } else {
            this.renderPlaceholder();
            return;
        }

        // Step 2: Draw user photo in the fixed photo box
        if (this.userImage) {
            this.drawPhoto();
        }

        // Step 3: Draw user name at the fixed position
        if (this.userName.trim()) {
            this.drawName();
        }
    }

    drawPhoto() {
        const img = this.userImage;
        const imgW = img.width;
        const imgH = img.height;
        
        // Calculate center-crop coordinates
        // We want to extract a square from the center of the image
        let srcX, srcY, srcSize;
        
        if (imgW > imgH) {
            // Landscape image: crop from center horizontally
            srcSize = imgH;
            srcX = (imgW - imgH) / 2;
            srcY = 0;
        } else if (imgH > imgW) {
            // Portrait image: crop from center vertically
            srcSize = imgW;
            srcX = 0;
            srcY = (imgH - imgW) / 2;
        } else {
            // Square image: use as-is
            srcSize = imgW;
            srcX = 0;
            srcY = 0;
        }
        
        // Draw the center-cropped square into the fixed photo box
        this.ctx.drawImage(
            img,
            srcX, srcY, srcSize, srcSize,           // Source: center square
            this.PHOTO_X, this.PHOTO_Y,              // Destination: fixed position
            this.PHOTO_SIZE, this.PHOTO_SIZE         // Destination: fixed size
        );
    }

    drawName() {
        const name = this.userName.toUpperCase();
        
        this.ctx.save();
        
        // Set text properties
        let fontSize = this.NAME_FONT_SIZE;
        this.ctx.font = `${fontSize}px ${this.NAME_FONT}`;
        this.ctx.fillStyle = this.NAME_COLOR;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        
        // Reduce font size if text is too wide
        let textWidth = this.ctx.measureText(name).width;
        while (textWidth > this.NAME_MAX_WIDTH && fontSize > 18) {
            fontSize -= 2;
            this.ctx.font = `${fontSize}px ${this.NAME_FONT}`;
            textWidth = this.ctx.measureText(name).width;
        }
        
        // Draw the name at the fixed position
        this.ctx.fillText(name, this.NAME_X, this.NAME_Y);
        
        this.ctx.restore();
    }

    reset() {
        this.userName = '';
        this.userImage = null;
        
        const nameInput = document.getElementById('nameInput');
        const photoInput = document.getElementById('photoUpload');
        
        if (nameInput) nameInput.value = '';
        if (photoInput) photoInput.value = '';
        
        this.render();
    }

    download() {
        const link = document.createElement('a');
        const safeName = this.userName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'guest';
        
        link.download = `lamour-experience-${safeName}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize when DOM is ready
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardCreator;
}
