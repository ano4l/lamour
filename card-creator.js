/**
 * L'AMOUR - Valentine's Card Creator
 * Canvas-based card customization
 */

class CardCreator {
    constructor() {
        this.canvas = document.getElementById('cardCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.templateImage = new Image();
        this.userImage = null;
        this.customText = '';
        
        // Template coordinates (based on the provided image)
        this.textPosition = {
            x: 550,  // Right side of card
            y: 280   // Above "Do you have a valentine?"
        };
        
        this.imagePosition = {
            x: 20,    // Bottom left
            y: 470,   // Bottom left
            width: 360,
            height: 270
        };
        
        this.init();
    }

    init() {
        // Load the template image
        this.templateImage.crossOrigin = 'anonymous';
        this.templateImage.onload = () => {
            this.renderCard();
        };
        
        // Set template image source (you'll need to add the actual image)
        this.templateImage.src = 'template.jpg'; // We'll need to add this image
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Text input
        const textInput = document.getElementById('customText');
        textInput.addEventListener('input', (e) => {
            this.customText = e.target.value;
            this.renderCard();
        });

        // Image upload
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('imageUpload');
        
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadUserImage(file);
            }
        });

        // Reset button
        document.getElementById('resetCard').addEventListener('click', () => {
            this.resetCard();
        });

        // Download button
        document.getElementById('downloadCard').addEventListener('click', () => {
            this.downloadCard();
        });

        // Scroll to card creator
        document.getElementById('scrollToCard').addEventListener('click', () => {
            document.getElementById('cardCreator').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
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

        // Draw template background
        if (this.templateImage.complete) {
            this.ctx.drawImage(this.templateImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Draw placeholder background if template not loaded
            this.ctx.fillStyle = '#FFE4E6';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw placeholder text
            this.ctx.fillStyle = '#000';
            this.ctx.font = '20px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading template...', this.canvas.width / 2, this.canvas.height / 2);
        }

        // Draw user image in bottom left corner
        if (this.userImage) {
            this.ctx.save();
            
            // Calculate aspect ratio fit
            const imgAspect = this.userImage.width / this.userImage.height;
            const boxAspect = this.imagePosition.width / this.imagePosition.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgAspect > boxAspect) {
                // Image is wider
                drawHeight = this.imagePosition.height;
                drawWidth = drawHeight * imgAspect;
                offsetX = (this.imagePosition.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                // Image is taller
                drawWidth = this.imagePosition.width;
                drawHeight = drawWidth / imgAspect;
                offsetX = 0;
                offsetY = (this.imagePosition.height - drawHeight) / 2;
            }

            // Clip to image area
            this.ctx.beginPath();
            this.ctx.rect(
                this.imagePosition.x,
                this.imagePosition.y,
                this.imagePosition.width,
                this.imagePosition.height
            );
            this.ctx.clip();

            // Draw image
            this.ctx.drawImage(
                this.userImage,
                this.imagePosition.x + offsetX,
                this.imagePosition.y + offsetY,
                drawWidth,
                drawHeight
            );

            this.ctx.restore();
        }

        // Draw custom text
        if (this.customText) {
            this.ctx.save();
            
            // Text styling - handwritten style
            this.ctx.font = 'italic 32px "Brush Script MT", cursive';
            this.ctx.fillStyle = '#000000';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add slight shadow for depth
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            // Draw text
            this.ctx.fillText(this.customText, this.textPosition.x, this.textPosition.y);
            
            this.ctx.restore();
        }
    }

    resetCard() {
        this.customText = '';
        this.userImage = null;
        document.getElementById('customText').value = '';
        document.getElementById('imageUpload').value = '';
        this.renderCard();
    }

    downloadCard() {
        // Create download link
        const link = document.createElement('a');
        link.download = `lamour-valentine-card-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardCreator;
}
