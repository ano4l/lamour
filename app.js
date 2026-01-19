/**
 * L'AMOUR - Valentine's Event 2026
 * Countdown Timer Application
 */

// Countdown Timer
class CountdownTimer {
    constructor() {
        this.targetDate = new Date('2026-02-14T15:00:00').getTime();
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        
        this.init();
    }

    init() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        if (distance < 0) {
            this.elements.days.textContent = '00';
            this.elements.hours.textContent = '00';
            this.elements.minutes.textContent = '00';
            this.elements.seconds.textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.elements.days.textContent = String(days).padStart(2, '0');
        this.elements.hours.textContent = String(hours).padStart(2, '0');
        this.elements.minutes.textContent = String(minutes).padStart(2, '0');
        this.elements.seconds.textContent = String(seconds).padStart(2, '0');
    }
}

// Scroll Indicator
class ScrollIndicator {
    constructor() {
        this.button = document.querySelector('.scroll-indicator');
        if (this.button) {
            this.button.addEventListener('click', () => this.scrollDown());
        }
    }

    scrollDown() {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    }
}

// Card Creator Class
class CardCreator {
    constructor() {
        this.canvas = document.getElementById('cardCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.templateImage = new Image();
        this.userImage = null;
        this.customText = '';
        
        // Template coordinates
        this.textPosition = { x: 550, y: 280 };
        this.imagePosition = { x: 20, y: 470, width: 360, height: 270 };
        
        this.init();
    }

    init() {
        this.templateImage.crossOrigin = 'anonymous';
        this.templateImage.onload = () => this.renderCard();
        this.templateImage.src = 'data:image/svg+xml;base64,' + btoa(this.createTemplateSVG());
        this.setupEventListeners();
    }

    createTemplateSVG() {
        return `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#FFE4E6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#FFC0CB;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="800" height="800" fill="url(#bg)"/>
            <line x1="400" y1="0" x2="400" y2="800" stroke="#000" stroke-width="2"/>
            <text x="200" y="60" font-family="Bebas Neue, Arial" font-size="48" font-weight="900" text-anchor="middle">L'AMOUR</text>
            <text x="200" y="100" font-family="Arial" font-size="16" text-anchor="middle">VALENTINES EVENT</text>
            <text x="600" y="60" font-family="Bebas Neue, Arial" font-size="48" font-weight="900" text-anchor="middle">02.14.26</text>
            <text x="600" y="90" font-family="Arial" font-size="16" text-anchor="middle">SATURDAY</text>
            <text x="600" y="110" font-family="Arial" font-size="16" text-anchor="middle">15:00 TILL LATE</text>
            <text x="600" y="340" font-family="Brush Script MT, cursive" font-size="32" font-style="italic" text-anchor="middle">Do you HAVE</text>
            <text x="600" y="380" font-family="Brush Script MT, cursive" font-size="32" font-style="italic" text-anchor="middle">A VALENTINE?</text>
            <text x="600" y="480" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">LIMITED TICKETS</text>
            <text x="600" y="510" font-family="Arial" font-size="16" text-anchor="middle">99 JUTA ST, BRAAM</text>
            <text x="600" y="560" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle">SORAH X</text>
            <text x="600" y="590" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle">L&T EVENTS</text>
            <rect x="20" y="470" width="360" height="270" fill="#E8D5E0" stroke="#000" stroke-width="2"/>
            <text x="200" y="605" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">Your Photo Here</text>
        </svg>`;
    }

    setupEventListeners() {
        document.getElementById('customText')?.addEventListener('input', (e) => {
            this.customText = e.target.value;
            this.renderCard();
        });

        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('imageUpload');
        
        uploadBtn?.addEventListener('click', () => fileInput.click());
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.loadUserImage(file);
        });

        document.getElementById('resetCard')?.addEventListener('click', () => this.resetCard());
        document.getElementById('downloadCard')?.addEventListener('click', () => this.downloadCard());
        document.getElementById('scrollToCard')?.addEventListener('click', () => {
            document.getElementById('cardCreator')?.scrollIntoView({ behavior: 'smooth' });
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.templateImage.complete) {
            this.ctx.drawImage(this.templateImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.userImage) {
            this.ctx.save();
            const imgAspect = this.userImage.width / this.userImage.height;
            const boxAspect = this.imagePosition.width / this.imagePosition.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            if (imgAspect > boxAspect) {
                drawHeight = this.imagePosition.height;
                drawWidth = drawHeight * imgAspect;
                offsetX = (this.imagePosition.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = this.imagePosition.width;
                drawHeight = drawWidth / imgAspect;
                offsetX = 0;
                offsetY = (this.imagePosition.height - drawHeight) / 2;
            }

            this.ctx.beginPath();
            this.ctx.rect(this.imagePosition.x, this.imagePosition.y, this.imagePosition.width, this.imagePosition.height);
            this.ctx.clip();
            this.ctx.drawImage(this.userImage, this.imagePosition.x + offsetX, this.imagePosition.y + offsetY, drawWidth, drawHeight);
            this.ctx.restore();
        }

        if (this.customText) {
            this.ctx.save();
            this.ctx.font = 'italic 32px "Brush Script MT", cursive';
            this.ctx.fillStyle = '#000000';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
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
        const link = document.createElement('a');
        link.download = `lamour-valentine-card-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
    new ScrollIndicator();
    new CardCreator();
    
    console.log('%c❤️ L\'amour - Valentine\'s Event 2026 ❤️', 'color: #FF5722; font-size: 20px; font-weight: bold;');
});
