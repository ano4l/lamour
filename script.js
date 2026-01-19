// Mobile Swipable UI Controller
class SwipableUI {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 6;
        this.isAnimating = false;
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.wrapper = null;
        this.threshold = 80; // Minimum swipe distance to trigger navigation
        
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
        this.cameraStream = null;
        this.isCameraActive = false;
        this.logos = { top: null, bottom: null };
        
        this.init();
    }

    init() {
        this.wrapper = document.querySelector('.swipable-wrapper');
        this.setupTouchEvents();
        this.setupNavigation();
        this.setupPolls();
        this.setupMusicTabs();
        this.setupRedFlags();
        this.setupPhotobooth();
        this.setupFloatingMic();
        this.initializePollResults();
        this.goToSection(0);
    }

    setupTouchEvents() {
        const container = document.querySelector('.mobile-container');
        let touchStartTime = 0;
        
        // Touch Start
        container.addEventListener('touchstart', (e) => {
            if (this.isAnimating) return;
            touchStartTime = Date.now();
            this.startY = e.touches[0].clientY;
            this.currentY = this.startY;
            this.isDragging = true;
            this.wrapper.style.transition = 'none';
        }, { passive: true });

        // Touch Move - Real-time drag feedback with throttling
        let lastMoveTime = 0;
        container.addEventListener('touchmove', (e) => {
            if (!this.isDragging || this.isAnimating) return;
            
            const now = Date.now();
            if (now - lastMoveTime < 16) return; // Throttle to ~60fps
            lastMoveTime = now;
            
            this.currentY = e.touches[0].clientY;
            const diff = this.currentY - this.startY;
            const baseOffset = -this.currentSection * window.innerHeight;
            
            // Add resistance at boundaries
            let resistance = 1;
            if ((this.currentSection === 0 && diff > 0) || 
                (this.currentSection === this.totalSections - 1 && diff < 0)) {
                resistance = 0.3;
            }
            
            const newOffset = baseOffset + (diff * resistance);
            this.wrapper.style.transform = `translateY(${newOffset}px)`;
        }, { passive: true });

        // Touch End - Determine if swipe was successful
        container.addEventListener('touchend', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            const diff = this.currentY - this.startY;
            this.wrapper.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            if (Math.abs(diff) > this.threshold) {
                if (diff < 0 && this.currentSection < this.totalSections - 1) {
                    // Swipe up - go to next section
                    this.goToSection(this.currentSection + 1);
                } else if (diff > 0 && this.currentSection > 0) {
                    // Swipe down - go to previous section
                    this.goToSection(this.currentSection - 1);
                } else {
                    // Bounce back
                    this.goToSection(this.currentSection);
                }
            } else {
                // Didn't swipe far enough, bounce back
                this.goToSection(this.currentSection);
            }
        }, { passive: true });

        // Mouse events for desktop testing
        container.addEventListener('mousedown', (e) => {
            if (this.isAnimating) return;
            this.startY = e.clientY;
            this.currentY = this.startY;
            this.isDragging = true;
            this.wrapper.style.transition = 'none';
        });

        container.addEventListener('mousemove', (e) => {
            if (!this.isDragging || this.isAnimating) return;
            
            this.currentY = e.clientY;
            const diff = this.currentY - this.startY;
            const baseOffset = -this.currentSection * window.innerHeight;
            
            let resistance = 1;
            if ((this.currentSection === 0 && diff > 0) || 
                (this.currentSection === this.totalSections - 1 && diff < 0)) {
                resistance = 0.3;
            }
            
            const newOffset = baseOffset + (diff * resistance);
            this.wrapper.style.transform = `translateY(${newOffset}px)`;
        });

        container.addEventListener('mouseup', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            const diff = this.currentY - this.startY;
            this.wrapper.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            if (Math.abs(diff) > this.threshold) {
                if (diff < 0 && this.currentSection < this.totalSections - 1) {
                    this.goToSection(this.currentSection + 1);
                } else if (diff > 0 && this.currentSection > 0) {
                    this.goToSection(this.currentSection - 1);
                } else {
                    this.goToSection(this.currentSection);
                }
            } else {
                this.goToSection(this.currentSection);
            }
        });

        container.addEventListener('mouseleave', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.wrapper.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                this.goToSection(this.currentSection);
            }
        });

        // Wheel events for desktop
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (this.isAnimating) return;
            
            if (e.deltaY > 30 && this.currentSection < this.totalSections - 1) {
                this.goToSection(this.currentSection + 1);
            } else if (e.deltaY < -30 && this.currentSection > 0) {
                this.goToSection(this.currentSection - 1);
            }
        }, { passive: false });
    }

    goToSection(index) {
        if (index < 0 || index >= this.totalSections) return;
        
        this.isAnimating = true;
        this.currentSection = index;
        
        const offset = -index * window.innerHeight;
        this.wrapper.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.wrapper.style.transform = `translateY(${offset}px)`;
        
        // Update navigation dots
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 400);
    }

    setupNavigation() {
        // Navigation dots click
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!this.isAnimating) {
                    this.goToSection(index);
                }
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
        const video = document.getElementById('camera-video');
        const cameraOverlay = document.getElementById('camera-overlay');
        const captureBtn = document.getElementById('capture-btn');
        const closeCameraBtn = document.getElementById('close-camera-btn');

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

        // Camera button
        cameraBtn.addEventListener('click', () => {
            this.startCamera(video, cameraOverlay);
        });

        // Capture button
        captureBtn.addEventListener('click', () => {
            this.capturePhoto(video, canvas, ctx, cameraOverlay);
        });

        // Close camera button
        closeCameraBtn.addEventListener('click', () => {
            this.stopCamera(video, cameraOverlay);
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

    async startCamera(video, cameraOverlay) {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            this.cameraStream = stream;
            video.srcObject = stream;
            
            // Wait for video to be ready
            video.onloadedmetadata = () => {
                video.play();
                video.style.display = 'block';
                cameraOverlay.style.display = 'flex';
                this.isCameraActive = true;
                this.showNotification('Camera ready! Position yourself and tap CAPTURE', 'info');
            };
        } catch (error) {
            console.error('Camera access error:', error);
            this.showNotification('Camera access denied or not available', 'error');
        }
    }

    stopCamera(video, cameraOverlay) {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        video.style.display = 'none';
        cameraOverlay.style.display = 'none';
        this.isCameraActive = false;
        
        this.showNotification('Camera closed', 'info');
    }

    capturePhoto(video, canvas, ctx, cameraOverlay) {
        // Create a temporary canvas to capture the video frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw the current video frame
        tempCtx.drawImage(video, 0, 0);
        
        // Convert to image
        tempCanvas.toBlob((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            this.loadImage(file, ctx, canvas);
            this.stopCamera(video, cameraOverlay);
        }, 'image/jpeg');
    }

    loadTemplate(ctx, canvas) {
        // Clear canvas with gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#FF1493');
        bgGradient.addColorStop(1, '#8B008B');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple frame - just a border around the photo area
        const padding = 40;
        const photoFrameX = padding;
        const photoFrameY = padding;
        const photoFrameWidth = canvas.width - (padding * 2);
        const photoFrameHeight = canvas.height - (padding * 2) - 80; // Leave space for text at bottom
        
        // Draw simple white border frame
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;
        ctx.strokeRect(photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight);

        // Add event text at bottom
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText("L'AMOUR", canvas.width / 2, canvas.height - 50);
        
        ctx.font = '16px Inter';
        ctx.fillText("VALENTINE'S EVENT 2026", canvas.width / 2, canvas.height - 25);

        // Store photo frame coordinates for later use
        this.photoFrameCoords = {
            x: photoFrameX,
            y: photoFrameY,
            width: photoFrameWidth,
            height: photoFrameHeight
        };

        this.templateLoaded = true;
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

        // Create clipping region for photo frame area
        ctx.beginPath();
        ctx.rect(
            this.photoFrameCoords.x,
            this.photoFrameCoords.y,
            this.photoFrameCoords.width,
            this.photoFrameCoords.height
        );
        ctx.clip();

        // Apply transformations within the photo frame
        const centerX = this.photoFrameCoords.x + this.photoFrameCoords.width / 2;
        const centerY = this.photoFrameCoords.y + this.photoFrameCoords.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(this.imageRotation * Math.PI / 180);
        if (this.imageFlipped) {
            ctx.scale(-1, 1);
        }

        // Calculate image dimensions to fit photo frame
        const imgRatio = img.width / img.height;
        const frameRatio = this.photoFrameCoords.width / this.photoFrameCoords.height;
        let drawWidth, drawHeight;

        // Cover the frame (crop to fill)
        if (imgRatio > frameRatio) {
            drawHeight = this.photoFrameCoords.height;
            drawWidth = drawHeight * imgRatio;
        } else {
            drawWidth = this.photoFrameCoords.width;
            drawHeight = drawWidth / imgRatio;
        }

        // Draw image centered in photo frame
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        // Restore context state
        ctx.restore();

        // Redraw simple white border on top of photo
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;
        ctx.strokeRect(
            this.photoFrameCoords.x,
            this.photoFrameCoords.y,
            this.photoFrameCoords.width,
            this.photoFrameCoords.height
        );

        // Redraw event text at bottom
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText("L'AMOUR", canvas.width / 2, canvas.height - 50);
        
        ctx.font = '16px Inter';
        ctx.fillText("VALENTINE'S EVENT 2026", canvas.width / 2, canvas.height - 25);
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
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        const timeoutId = setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);

        // Allow manual dismissal
        notification.addEventListener('click', () => {
            clearTimeout(timeoutId);
            notification.remove();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SwipableUI();
});

// Console welcome
console.log('%c❤️ L\'amour Mobile UI Ready! ❤️', 'color: #EC4899; font-size: 20px; font-weight: bold;');
