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

// Red Flags Manager
class RedFlagsManager {
    constructor() {
        this.redFlags = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addInitialRedFlags();
    }

    addInitialRedFlags() {
        const initialFlags = [
            'Bad communication',
            'Ghosting without explanation',
            'Still friends with ex',
            'Love bombing',
            'No ambition or goals',
            'Terrible music taste'
        ];
        
        initialFlags.forEach(flag => this.addRedFlag(flag));
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('redflagForm');
        const input = document.getElementById('redflagInput');
        const charCount = document.getElementById('charCount');
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                this.addRedFlag(text);
                input.value = '';
                charCount.textContent = '0/150';
            }
        });
        
        // Character counter
        input?.addEventListener('input', (e) => {
            const length = e.target.value.length;
            charCount.textContent = `${length}/150`;
        });
        
        // Quick pick buttons
        document.querySelectorAll('.quick-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.text;
                this.addRedFlag(text);
            });
        });
    }

    addRedFlag(text) {
        const list = document.getElementById('redflagsList');
        if (!list) return;
        
        const item = document.createElement('div');
        item.className = 'redflag-item';
        item.innerHTML = `
            <span class="redflag-emoji">🚩</span>
            <span class="redflag-text">"${text}"</span>
        `;
        
        list.insertBefore(item, list.firstChild);
        this.redFlags.unshift(text);
        
        // Keep only latest 20
        while (list.children.length > 20) {
            list.removeChild(list.lastChild);
            this.redFlags.pop();
        }
    }

}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
    new ScrollIndicator();
    new RedFlagsManager();
    
    console.log('%c❤️ L\'amour - Valentine\'s Event 2026 ❤️', 'color: #FF5722; font-size: 20px; font-weight: bold;');
});
