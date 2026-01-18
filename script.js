// Mobile Swipable UI Controller
class SwipableUI {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 6;
        this.isTransitioning = false;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.pollData = {
            1: { a: 0, b: 0, c: 0, d: 0 },
            2: { a: 0, b: 0, c: 0, d: 0 },
            3: { a: 0, b: 0, c: 0, d: 0 }
        };
        this.userVotes = {};
        this.redFlags = [];
        this.photoboothImage = null;
        this.imageRotation = 0;
        this.imageFlipped = false;
        
        this.init();
    }

    init() {
        this.setupTouchEvents();
        this.setupNavigation();
        this.setupPolls();
        this.setupMusicTabs();
        this.setupRedFlags();
        this.setupPhotobooth();
        this.setupFloatingMic();
        this.initializePollResults();
    }

    setupTouchEvents() {
        const wrapper = document.querySelector('.swipable-wrapper');
        
        // Touch events
        wrapper.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe();
        }, { passive: true });

        // Mouse events for desktop testing
        let mouseDown = false;
        wrapper.addEventListener('mousedown', (e) => {
            mouseDown = true;
            this.touchStartY = e.clientY;
        });

        wrapper.addEventListener('mouseup', (e) => {
            if (mouseDown) {
                this.touchEndY = e.clientY;
                this.handleSwipe();
                mouseDown = false;
            }
        });

        // Wheel events for desktop
        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0 && this.currentSection < this.totalSections - 1) {
                this.navigateToSection(this.currentSection + 1);
            } else if (e.deltaY < 0 && this.currentSection > 0) {
                this.navigateToSection(this.currentSection - 1);
            }
        }, { passive: false });
    }

    handleSwipe() {
        const swipeDistance = this.touchStartY - this.touchEndY;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) < minSwipeDistance) return;

        if (swipeDistance > 0 && this.currentSection < this.totalSections - 1) {
            // Swipe up - next section
            this.navigateToSection(this.currentSection + 1);
        } else if (swipeDistance < 0 && this.currentSection > 0) {
            // Swipe down - previous section
            this.navigateToSection(this.currentSection - 1);
        }
    }

    navigateToSection(sectionIndex) {
        if (this.isTransitioning || sectionIndex === this.currentSection) return;
        
        this.isTransitioning = true;
        this.currentSection = sectionIndex;

        // Update sections
        document.querySelectorAll('.section').forEach((section, index) => {
            section.classList.toggle('active', index === sectionIndex);
        });

        // Update navigation dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === sectionIndex);
        });

        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    setupNavigation() {
        // Navigation dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.navigateToSection(index);
            });
        });

        // Action buttons
        document.querySelectorAll('.glowing-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.textContent;
                this.showNotification(`${text} feature coming soon!`, 'info');
            });
        });
    }

    setupPolls() {
        document.querySelectorAll('.poll-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const pollCard = e.target.closest('.poll-card');
                const pollId = parseInt(pollCard.dataset.pollId);
                const selectedOption = e.target.dataset.option;
                
                this.handlePollVote(pollId, selectedOption, pollCard);
            });
        });
    }

    handlePollVote(pollId, option, pollCard) {
        if (this.userVotes[pollId]) {
            this.showNotification('You have already voted in this poll!', 'error');
            return;
        }

        // Record vote
        this.pollData[pollId][option]++;
        this.userVotes[pollId] = option;

        // Show results container
        const resultsContainer = pollCard.querySelector('.poll-results');
        resultsContainer.style.display = 'block';

        // Update UI
        this.updatePollResults(pollId);
        
        // Mark as voted
        pollCard.querySelectorAll('.poll-option').forEach(opt => {
            opt.classList.add('voted');
            opt.style.pointerEvents = 'none';
            opt.style.opacity = '0.7';
        });

        this.showNotification('Your vote has been recorded!', 'success');
    }

    updatePollResults(pollId) {
        const pollCard = document.querySelector(`[data-poll-id="${pollId}"]`);
        const results = this.pollData[pollId];
        const total = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        // Only show results if there are votes
        if (total === 0) return;
        
        Object.keys(results).forEach(option => {
            const percentage = total > 0 ? Math.round((results[option] / total) * 100) : 0;
            const resultBar = pollCard.querySelector(`[data-option="${option}"]`);
            if (resultBar) {
                const optionText = resultBar.textContent.split(':')[0];
                resultBar.textContent = `${optionText}: ${percentage}%`;
                resultBar.style.width = `${percentage}%`;
                resultBar.style.display = 'block';
            }
        });
    }

    initializePollResults() {
        // Hide all poll results initially
        document.querySelectorAll('.poll-results').forEach(results => {
            results.style.display = 'none';
        });
    }

    setupRedFlags() {
        const promptInput = document.querySelector('.prompt-input');
        const clearBtn = document.querySelector('.prompt-btn.clear');
        const submitBtn = document.querySelector('.prompt-btn.generate');
        const resultText = document.querySelector('.result-text');
        const exampleChips = document.querySelectorAll('.example-chip');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                promptInput.value = '';
                resultText.textContent = 'Your red flag will appear here for others to see...';
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const input = promptInput.value.trim();
                if (!input) {
                    this.showNotification('Please share your red flag', 'error');
                    return;
                }
                this.submitRedFlag(input);
            });
        }

        exampleChips.forEach(chip => {
            chip.addEventListener('click', () => {
                promptInput.value = chip.textContent;
                this.submitRedFlag(chip.textContent);
            });
        });

        // Red flag items voting
        document.querySelectorAll('.redflag-item').forEach(item => {
            item.addEventListener('click', () => {
                const votes = item.querySelector('.redflag-votes');
                const currentVotes = parseInt(votes.textContent.match(/\d+/)[0]);
                votes.textContent = `🚩 ${currentVotes + 1}`;
                this.showNotification('Red flag voted up!', 'success');
            });
        });
    }

    submitRedFlag(redFlag) {
        const resultText = document.querySelector('.result-text');
        resultText.textContent = `"${redFlag}" - Your red flag has been added to the list!`;
        resultText.style.fontStyle = 'normal';
        resultText.style.color = 'var(--text-primary)';
        
        // Add to red flags list
        this.addRedFlagToList(redFlag);
        
        // Clear input
        document.querySelector('.prompt-input').value = '';
        
        this.showNotification('Red flag submitted!', 'success');
    }

    addRedFlagToList(redFlag) {
        const redflagsList = document.querySelector('.redflags-list');
        const newItem = document.createElement('div');
        newItem.className = 'redflag-item';
        newItem.innerHTML = `
            <div class="redflag-text">"${redFlag}"</div>
            <div class="redflag-votes">🚩 1</div>
        `;
        
        // Add click handler
        newItem.addEventListener('click', () => {
            const votes = newItem.querySelector('.redflag-votes');
            const currentVotes = parseInt(votes.textContent.match(/\d+/)[0]);
            votes.textContent = `🚩 ${currentVotes + 1}`;
        });

        redflagsList.insertBefore(newItem, redflagsList.firstChild);
        
        // Keep only latest 10 red flags
        while (redflagsList.children.length > 10) {
            redflagsList.removeChild(redflagsList.lastChild);
        }
    }

    setupMusicTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update buttons
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update panes
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === `${targetTab}-tab`) {
                        pane.classList.add('active');
                    }
                });
            });
        });

        // Music form submission
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.handleMusicRequest();
            });
        }

        // Suggestion items - handle all suggestion items
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const votes = item.querySelector('.song-votes');
                const currentVotes = parseInt(votes.textContent.match(/\d+/)[0]);
                votes.textContent = `♡ ${currentVotes + 1}`;
                this.showNotification('Vote recorded!', 'success');
            });
        });
    }

    handleMusicRequest() {
        const inputs = document.querySelectorAll('.music-input');
        const songTitle = inputs[0].value.trim();
        const artist = inputs[1].value.trim();
        const dedication = inputs[2].value.trim();

        if (!songTitle || !artist) {
            this.showNotification('Please fill in song title and artist', 'error');
            return;
        }

        // Add to both suggestion lists
        this.addSongSuggestion(songTitle, artist);
        
        // Clear form
        inputs.forEach(input => input.value = '');
        
        this.showNotification('Song request submitted successfully!', 'success');
    }

    addSongSuggestion(title, artist) {
        // Add to recent suggestions (in request tab)
        const recentList = document.querySelector('#request-tab .suggestions-list');
        const newItem = document.createElement('div');
        newItem.className = 'suggestion-item';
        newItem.innerHTML = `
            <div class="song-info">
                <div class="song-title">${title}</div>
                <div class="song-artist">${artist}</div>
            </div>
            <div class="song-votes">♡ 1</div>
        `;
        
        // Add click handler
        newItem.addEventListener('click', () => {
            const votes = newItem.querySelector('.song-votes');
            const currentVotes = parseInt(votes.textContent.match(/\d+/)[0]);
            votes.textContent = `♡ ${currentVotes + 1}`;
        });

        recentList.insertBefore(newItem, recentList.firstChild);
        
        // Also add to all suggestions tab
        const allList = document.querySelector('#suggestions-tab .suggestions-list');
        const allNewItem = newItem.cloneNode(true);
        allNewItem.addEventListener('click', () => {
            const votes = allNewItem.querySelector('.song-votes');
            const currentVotes = parseInt(votes.textContent.match(/\d+/)[0]);
            votes.textContent = `♡ ${currentVotes + 1}`;
        });
        allList.insertBefore(allNewItem, allList.firstChild);
        
        // Keep only latest 10 suggestions in each list
        [recentList, allList].forEach(list => {
            while (list.children.length > 10) {
                list.removeChild(list.lastChild);
            }
        });
    }

    setupPhotobooth() {
        const canvas = document.getElementById('photobooth-canvas');
        const ctx = canvas.getContext('2d');
        const uploadBtn = document.getElementById('upload-btn');
        const cameraBtn = document.getElementById('camera-btn');
        const imageUpload = document.getElementById('image-upload');
        const rotateBtn = document.getElementById('rotate-btn');
        const flipBtn = document.getElementById('flip-btn');
        const resetBtn = document.getElementById('reset-btn');
        const downloadBtn = document.getElementById('download-btn');
        const shareBtn = document.getElementById('share-btn');

        // Initialize with template
        this.loadTemplate(ctx, canvas);

        // Upload button
        uploadBtn.addEventListener('click', () => {
            imageUpload.click();
        });

        // Handle image upload
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImage(file, ctx, canvas);
            }
        });

        // Camera button (for mobile devices)
        cameraBtn.addEventListener('click', () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.showNotification('Camera access coming soon!', 'info');
            } else {
                this.showNotification('Camera not available on this device', 'error');
            }
        });

        // Edit controls
        rotateBtn.addEventListener('click', () => {
            this.rotateImage(ctx, canvas);
        });

        flipBtn.addEventListener('click', () => {
            this.flipImage(ctx, canvas);
        });

        resetBtn.addEventListener('click', () => {
            this.resetImage(ctx, canvas);
        });

        // Save controls
        downloadBtn.addEventListener('click', () => {
            this.downloadImage(canvas);
        });

        shareBtn.addEventListener('click', () => {
            this.shareImage(canvas);
        });
    }

    loadTemplate(ctx, canvas) {
        // Create gradient background similar to template
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add L'AMOUR text at top
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('L\'AMOUR', canvas.width / 2, 80);

        // Add date at bottom
        ctx.font = 'bold 24px Inter';
        ctx.fillText('02.14.26', canvas.width / 2, canvas.height - 40);

        // Add placeholder for photo area
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(50, 120, canvas.width - 100, canvas.height - 240);
        
        // Add placeholder text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Inter';
        ctx.fillText('Your photo goes here', canvas.width / 2, canvas.height / 2);
    }

    loadImage(file, ctx, canvas) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.photoboothImage = img;
                this.imageRotation = 0;
                this.imageFlipped = false;
                this.drawImage(ctx, canvas, img);
                this.showNotification('Photo loaded successfully!', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawImage(ctx, canvas, img) {
        // First draw the template background
        this.loadTemplate(ctx, canvas);

        // Save context state
        ctx.save();

        // Define photo area (where user's photo goes)
        const photoX = 50;
        const photoY = 120;
        const photoWidth = canvas.width - 100;
        const photoHeight = canvas.height - 240;

        // Create clipping region for photo area
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoWidth, photoHeight);
        ctx.clip();

        // Apply transformations within the photo area
        ctx.translate(photoX + photoWidth / 2, photoY + photoHeight / 2);
        ctx.rotate(this.imageRotation * Math.PI / 180);
        if (this.imageFlipped) {
            ctx.scale(-1, 1);
        }

        // Calculate image dimensions to fit photo area
        const imgRatio = img.width / img.height;
        const photoRatio = photoWidth / photoHeight;
        let drawWidth, drawHeight;

        if (imgRatio > photoRatio) {
            drawWidth = photoWidth;
            drawHeight = photoWidth / imgRatio;
        } else {
            drawHeight = photoHeight;
            drawWidth = photoHeight * imgRatio;
        }

        // Draw image centered in photo area
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        // Restore context state
        ctx.restore();
    }

    rotateImage(ctx, canvas) {
        if (!this.photoboothImage) {
            this.showNotification('Please upload a photo first', 'error');
            return;
        }
        this.imageRotation += 90;
        if (this.imageRotation >= 360) this.imageRotation = 0;
        this.drawImage(ctx, canvas, this.photoboothImage);
    }

    flipImage(ctx, canvas) {
        if (!this.photoboothImage) {
            this.showNotification('Please upload a photo first', 'error');
            return;
        }
        this.imageFlipped = !this.imageFlipped;
        this.drawImage(ctx, canvas, this.photoboothImage);
    }

    resetImage(ctx, canvas) {
        if (!this.photoboothImage) {
            this.showNotification('Please upload a photo first', 'error');
            return;
        }
        this.imageRotation = 0;
        this.imageFlipped = false;
        this.drawImage(ctx, canvas, this.photoboothImage);
        this.showNotification('Image reset to original', 'success');
    }

    downloadImage(canvas) {
        if (!this.photoboothImage) {
            this.showNotification('Please upload a photo first', 'error');
            return;
        }

        // Download the current canvas (which already has template + photo)
        const link = document.createElement('a');
        link.download = 'lamour-photobooth.png';
        link.href = canvas.toDataURL();
        link.click();

        this.showNotification('Image downloaded!', 'success');
    }

    shareImage(canvas) {
        if (!this.photoboothImage) {
            this.showNotification('Please upload a photo first', 'error');
            return;
        }

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (navigator.share && navigator.canShare({ files: [new File([blob], 'lamour-photobooth.png', { type: 'image/png' })] })) {
                navigator.share({
                    title: 'L\'amour Photobooth',
                    text: 'Check out my L\'amour moment! Tag @l.t.events',
                    files: [new File([blob], 'lamour-photobooth.png', { type: 'image/png' })]
                }).then(() => {
                    this.showNotification('Image shared successfully!', 'success');
                }).catch(() => {
                    this.showNotification('Share cancelled', 'info');
                });
            } else {
                // Fallback: copy to clipboard or show download option
                this.showNotification('Sharing not supported on this device. Try downloading instead!', 'info');
            }
        }, 'image/png');
    }

    setupFloatingMic() {
        const floatingMic = document.querySelector('.floating-mic');
        
        floatingMic.addEventListener('click', () => {
            this.showNotification('Voice commands coming soon!', 'info');
            
            // Add pulse animation
            floatingMic.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                floatingMic.style.animation = '';
            }, 500);
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Style based on type
        const colors = {
            success: 'linear-gradient(135deg, #EC4899, #BE185D)',
            error: 'linear-gradient(135deg, #BE185D, #EC4899)',
            info: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 500;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SwipableUI();
});

// Console welcome
console.log('%c❤️ L\'amour Mobile UI Ready! ❤️', 'color: #EC4899; font-size: 20px; font-weight: bold;');
