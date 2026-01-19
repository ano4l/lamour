/**
 * L'AMOUR - Valentine's Event 2026
 * Modern JavaScript Architecture with ES6 Modules
 */

// ===================================
// 1. UTILITY FUNCTIONS
// ===================================
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ===================================
// 2. TOAST NOTIFICATION SYSTEM
// ===================================
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    show(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);

        toast.addEventListener('click', () => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// ===================================
// 3. NAVIGATION CONTROLLER (Scroll-based)
// ===================================
class NavigationController {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.dots = document.querySelectorAll('.nav-dot');
        
        this.init();
    }

    init() {
        this.setupDotNavigation();
        this.setupScrollSpy();
    }

    setupDotNavigation() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const section = this.sections[index];
                if (section) {
                    section.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollSpy() {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(this.sections).indexOf(entry.target);
                    this.dots.forEach((dot, i) => {
                        dot.classList.toggle('active', i === index);
                    });
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }
}

// ===================================
// 4. RED FLAGS MANAGER (Simplified)
// ===================================
class RedFlagsManager {
    constructor(toastManager) {
        this.toast = toastManager;
        this.redFlags = [];
        this.init();
    }

    init() {
        const form = document.getElementById('redflag-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('redflag-input');
                const value = input.value.trim();
                
                if (value) {
                    this.submitRedFlag(value);
                    input.value = '';
                }
            });
        }

        // Add some initial red flags
        this.addInitialRedFlags();
    }

    addInitialRedFlags() {
        const initialFlags = [
            "Bad communication",
            "Ghosting without explanation", 
            "Still friends with ex",
            "Love bombing",
            "No ambition",
            "Terrible music taste"
        ];

        initialFlags.forEach(flag => {
            this.addToList(flag);
        });
    }

    submitRedFlag(text) {
        this.addToList(text);
        this.toast.show('Red flag submitted!');
    }

    addToList(text) {
        const list = document.getElementById('redflags-list');
        if (!list) return;

        const item = document.createElement('div');
        item.className = 'redflag-item';
        item.innerHTML = `
            <div class="redflag-text">"${text}"</div>
            <div class="redflag-badge">🚩 1</div>
        `;
        
        item.addEventListener('click', () => {
            const badge = item.querySelector('.redflag-badge');
            const currentVotes = parseInt(badge.textContent.match(/\d+/)[0]);
            badge.textContent = `🚩 ${currentVotes + 1}`;
        });

        list.insertBefore(item, list.firstChild);
        
        // Keep only latest 10
        while (list.children.length > 10) {
            list.removeChild(list.lastChild);
        }
    }
}

// ===================================
// 5. APP INITIALIZATION (Simplified)
// ===================================
class LamourApp {
    constructor() {
        this.toast = new ToastManager();
        this.navigation = new NavigationController();
        this.redFlags = new RedFlagsManager(this.toast);
        
        this.init();
    }

    init() {
        this.setupEventHandlers();
        console.log('%c❤️ L\'amour App Ready! ❤️', 'color: #FF1493; font-size: 20px; font-weight: bold;');
    }

    setupEventHandlers() {
        const shareEventBtn = document.getElementById('share-event-btn');
        if (shareEventBtn) {
            shareEventBtn.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: "L'amour - Valentine's Event 2026",
                        text: "Join me at L'amour Valentine's Event!",
                        url: window.location.href
                    }).catch(() => {});
                } else {
                    this.toast.show('Sharing not supported on this device');
                }
            });
        }

        const fabBtn = document.getElementById('fab-btn');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => {
                this.toast.show('Get your tickets for L\'amour!');
            });
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LamourApp());
} else {
    new LamourApp();
}
