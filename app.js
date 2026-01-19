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
// 4. POLLS MANAGER
// ===================================
class PollsManager {
    constructor(toastManager) {
        this.toast = toastManager;
        this.polls = [
            {
                id: 1,
                question: "Do you have a Valentine?",
                options: [
                    { id: 'a', text: "Yes, happily taken" },
                    { id: 'b', text: "Single and ready to mingle" },
                    { id: 'c', text: "It's complicated" },
                    { id: 'd', text: "Single by choice" }
                ]
            },
            {
                id: 2,
                question: "What's your relationship status?",
                options: [
                    { id: 'a', text: "Dating someone special" },
                    { id: 'b', text: "Single and loving it" },
                    { id: 'c', text: "In a situationship" },
                    { id: 'd', text: "Recently single" }
                ]
            },
            {
                id: 3,
                question: "How are you spending Valentine's Day?",
                options: [
                    { id: 'a', text: "At L'amour" },
                    { id: 'b', text: "At L'amour" },
                    { id: 'c', text: "At L'amour" },
                    { id: 'd', text: "At L'amour" }
                ]
            }
        ];
        
        this.pollData = {};
        this.userVotes = {};
        
        this.init();
    }

    init() {
        this.polls.forEach(poll => {
            this.pollData[poll.id] = { a: 0, b: 0, c: 0, d: 0 };
        });
        
        this.renderPolls();
    }

    renderPolls() {
        const container = document.getElementById('polls-container');
        if (!container) return;

        container.innerHTML = this.polls.map(poll => `
            <div class="poll-card" data-poll-id="${poll.id}">
                <div class="poll-card__question">${poll.question}</div>
                <div class="poll-card__options">
                    ${poll.options.map(opt => `
                        <button class="poll-option" data-option="${opt.id}">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
                <div class="poll-card__results" style="display: none;">
                    ${poll.options.map(opt => `
                        <div class="result-bar" data-option="${opt.id}" style="width: 0%">
                            ${opt.text}: 0%
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        this.attachPollListeners();
    }

    attachPollListeners() {
        document.querySelectorAll('.poll-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const pollCard = e.target.closest('.poll-card');
                const pollId = parseInt(pollCard.dataset.pollId);
                const selectedOption = e.target.dataset.option;
                
                this.handleVote(pollId, selectedOption, pollCard);
            });
        });
    }

    handleVote(pollId, option, pollCard) {
        if (this.userVotes[pollId]) {
            this.toast.show('You have already voted in this poll!');
            return;
        }

        this.pollData[pollId][option]++;
        this.userVotes[pollId] = option;

        const resultsContainer = pollCard.querySelector('.poll-card__results');
        resultsContainer.style.display = 'grid';

        this.updatePollResults(pollId, pollCard);
        
        pollCard.querySelectorAll('.poll-option').forEach(opt => {
            opt.classList.add('voted');
            opt.style.pointerEvents = 'none';
        });

        this.toast.show('Your vote has been recorded!');
    }

    updatePollResults(pollId, pollCard) {
        const results = this.pollData[pollId];
        const total = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        if (total === 0) return;
        
        Object.keys(results).forEach(option => {
            const percentage = Math.round((results[option] / total) * 100);
            const resultBar = pollCard.querySelector(`.result-bar[data-option="${option}"]`);
            if (resultBar) {
                const optionText = resultBar.textContent.split(':')[0];
                resultBar.textContent = `${optionText}: ${percentage}%`;
                resultBar.style.width = `${percentage}%`;
            }
        });
    }
}

// ===================================
// 5. RED FLAGS MANAGER
// ===================================
class RedFlagsManager {
    constructor(toastManager) {
        this.toast = toastManager;
        this.redFlags = [];
        this.init();
    }

    init() {
        const form = document.getElementById('redflag-form');
        const clearBtn = document.getElementById('clear-redflag-btn');
        const chips = document.querySelectorAll('#redflag-chips .chip');

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

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.getElementById('redflag-input').value = '';
                const resultText = document.querySelector('.submission-result__text');
                if (resultText) {
                    resultText.textContent = 'Your red flag will appear here for others to see...';
                    resultText.style.fontStyle = 'italic';
                }
            });
        }

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const value = chip.dataset.value;
                document.getElementById('redflag-input').value = value;
                this.submitRedFlag(value);
            });
        });
    }

    submitRedFlag(text) {
        const resultText = document.querySelector('.submission-result__text');
        if (resultText) {
            resultText.textContent = `"${text}" - Your red flag has been added to the list!`;
            resultText.style.fontStyle = 'normal';
        }
        
        this.addToList(text);
        this.toast.show('Red flag submitted!');
    }

    addToList(text) {
        const list = document.getElementById('redflags-list');
        if (!list) return;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item__text">"${text}"</div>
            <div class="list-item__badge">🚩 1</div>
        `;
        
        item.addEventListener('click', () => {
            const badge = item.querySelector('.list-item__badge');
            const currentVotes = parseInt(badge.textContent.match(/\d+/)[0]);
            badge.textContent = `🚩 ${currentVotes + 1}`;
        });

        list.insertBefore(item, list.firstChild);
        
        while (list.children.length > 10) {
            list.removeChild(list.lastChild);
        }
    }
}

// ===================================
// 6. MUSIC MANAGER
// ===================================
class MusicManager {
    constructor(toastManager) {
        this.toast = toastManager;
        this.songs = [];
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupForm();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `${targetTab}-panel`) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }

    setupForm() {
        const form = document.getElementById('music-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('song-title').value.trim();
            const artist = document.getElementById('song-artist').value.trim();
            const dedication = document.getElementById('song-dedication').value.trim();

            if (title && artist) {
                this.addSong(title, artist, dedication);
                form.reset();
                this.toast.show('Song request submitted!');
            } else {
                this.toast.show('Please fill in song title and artist');
            }
        });
    }

    addSong(title, artist, dedication = '') {
        const song = { title, artist, dedication, votes: 1 };
        this.songs.unshift(song);

        this.renderSong(song, 'recent-songs');
        this.renderSong(song, 'all-songs');
        
        this.limitSongs('recent-songs', 10);
        this.limitSongs('all-songs', 10);
    }

    renderSong(song, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item__text">
                <strong>${song.title}</strong><br>
                <small style="color: var(--text-secondary);">${song.artist}</small>
            </div>
            <div class="list-item__badge">♡ ${song.votes}</div>
        `;
        
        item.addEventListener('click', () => {
            const badge = item.querySelector('.list-item__badge');
            const currentVotes = parseInt(badge.textContent.match(/\d+/)[0]);
            badge.textContent = `♡ ${currentVotes + 1}`;
        });

        container.insertBefore(item, container.firstChild);
    }

    limitSongs(containerId, max) {
        const container = document.getElementById(containerId);
        if (!container) return;

        while (container.children.length > max) {
            container.removeChild(container.lastChild);
        }
    }
}

// ===================================
// 7. PHOTOBOOTH MANAGER
// ===================================
class PhotoboothManager {
    constructor(toastManager) {
        this.toast = toastManager;
        this.canvas = document.getElementById('photobooth-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.video = document.getElementById('camera-video');
        this.overlay = document.getElementById('camera-overlay');
        this.image = null;
        this.rotation = 0;
        this.flipped = false;
        this.cameraStream = null;
        this.photoFrameCoords = null;
        
        this.init();
    }

    init() {
        this.loadTemplate();
        this.setupControls();
    }

    loadTemplate() {
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#FF1493');
        bgGradient.addColorStop(1, '#8B008B');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const padding = 40;
        const photoFrameX = padding;
        const photoFrameY = padding;
        const photoFrameWidth = this.canvas.width - (padding * 2);
        const photoFrameHeight = this.canvas.height - (padding * 2) - 80;
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 8;
        this.ctx.strokeRect(photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("L'AMOUR", this.canvas.width / 2, this.canvas.height - 50);
        
        this.ctx.font = '16px Inter';
        this.ctx.fillText("VALENTINE'S EVENT 2026", this.canvas.width / 2, this.canvas.height - 25);

        this.photoFrameCoords = {
            x: photoFrameX,
            y: photoFrameY,
            width: photoFrameWidth,
            height: photoFrameHeight
        };
    }

    setupControls() {
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('image-upload').click();
        });

        document.getElementById('image-upload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.loadImage(file);
        });

        document.getElementById('camera-btn')?.addEventListener('click', () => {
            this.startCamera();
        });

        document.getElementById('capture-btn')?.addEventListener('click', () => {
            this.capturePhoto();
        });

        document.getElementById('close-camera-btn')?.addEventListener('click', () => {
            this.stopCamera();
        });

        document.getElementById('rotate-btn')?.addEventListener('click', () => {
            this.rotateImage();
        });

        document.getElementById('flip-btn')?.addEventListener('click', () => {
            this.flipImage();
        });

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.resetImage();
        });

        document.getElementById('download-btn')?.addEventListener('click', () => {
            this.downloadImage();
        });

        document.getElementById('share-photo-btn')?.addEventListener('click', () => {
            this.shareImage();
        });
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.rotation = 0;
                this.flipped = false;
                this.drawImage();
                this.toast.show('Photo loaded successfully!');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawImage() {
        if (!this.image) return;

        this.loadTemplate();
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.rect(
            this.photoFrameCoords.x,
            this.photoFrameCoords.y,
            this.photoFrameCoords.width,
            this.photoFrameCoords.height
        );
        this.ctx.clip();

        const centerX = this.photoFrameCoords.x + this.photoFrameCoords.width / 2;
        const centerY = this.photoFrameCoords.y + this.photoFrameCoords.height / 2;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        if (this.flipped) this.ctx.scale(-1, 1);

        const imgRatio = this.image.width / this.image.height;
        const frameRatio = this.photoFrameCoords.width / this.photoFrameCoords.height;
        let drawWidth, drawHeight;

        if (imgRatio > frameRatio) {
            drawHeight = this.photoFrameCoords.height;
            drawWidth = drawHeight * imgRatio;
        } else {
            drawWidth = this.photoFrameCoords.width;
            drawHeight = drawWidth / imgRatio;
        }

        this.ctx.drawImage(this.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        this.ctx.restore();

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 8;
        this.ctx.strokeRect(
            this.photoFrameCoords.x,
            this.photoFrameCoords.y,
            this.photoFrameCoords.width,
            this.photoFrameCoords.height
        );

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("L'AMOUR", this.canvas.width / 2, this.canvas.height - 50);
        
        this.ctx.font = '16px Inter';
        this.ctx.fillText("VALENTINE'S EVENT 2026", this.canvas.width / 2, this.canvas.height - 25);
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            
            this.cameraStream = stream;
            this.video.srcObject = stream;
            
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.video.style.display = 'block';
                this.overlay.style.display = 'flex';
                this.toast.show('Camera ready! Position yourself and tap CAPTURE');
            };
        } catch (error) {
            this.toast.show('Camera access denied or not available');
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        this.video.style.display = 'none';
        this.overlay.style.display = 'none';
        this.toast.show('Camera closed');
    }

    capturePhoto() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.video.videoWidth;
        tempCanvas.height = this.video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(this.video, 0, 0);
        
        tempCanvas.toBlob((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            this.loadImage(file);
            this.stopCamera();
        }, 'image/jpeg');
    }

    rotateImage() {
        if (!this.image) {
            this.toast.show('Please upload a photo first');
            return;
        }
        this.rotation += 90;
        if (this.rotation >= 360) this.rotation = 0;
        this.drawImage();
    }

    flipImage() {
        if (!this.image) {
            this.toast.show('Please upload a photo first');
            return;
        }
        this.flipped = !this.flipped;
        this.drawImage();
    }

    resetImage() {
        if (!this.image) {
            this.toast.show('Please upload a photo first');
            return;
        }
        this.rotation = 0;
        this.flipped = false;
        this.drawImage();
        this.toast.show('Image reset to original');
    }

    downloadImage() {
        if (!this.image) {
            this.toast.show('Please upload a photo first');
            return;
        }

        const link = document.createElement('a');
        link.download = 'lamour-photobooth.png';
        link.href = this.canvas.toDataURL();
        link.click();

        this.toast.show('Image downloaded!');
    }

    shareImage() {
        if (!this.image) {
            this.toast.show('Please upload a photo first');
            return;
        }

        this.canvas.toBlob((blob) => {
            const file = new File([blob], 'lamour-photobooth.png', { type: 'image/png' });
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: "L'amour Photobooth",
                    text: "Check out my L'amour moment! Tag @l.t.events",
                    files: [file]
                }).then(() => {
                    this.toast.show('Image shared successfully!');
                }).catch(() => {
                    this.toast.show('Share cancelled');
                });
            } else {
                this.toast.show('Sharing not supported. Try downloading instead!');
            }
        }, 'image/png');
    }
}

// ===================================
// 8. APP INITIALIZATION
// ===================================
class LamourApp {
    constructor() {
        this.toast = new ToastManager();
        this.navigation = new NavigationController();
        this.polls = new PollsManager(this.toast);
        this.redFlags = new RedFlagsManager(this.toast);
        this.music = new MusicManager(this.toast);
        this.photobooth = new PhotoboothManager(this.toast);
        
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
                this.toast.show('Quick actions coming soon!');
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
