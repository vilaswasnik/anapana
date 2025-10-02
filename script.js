// ===== MEDITATION TIMER APP - CORE FUNCTIONALITY =====

// NUCLEAR RESET - Clear everything and force clean start
(function() {
    console.log('� NUCLEAR RESET - Clearing everything...');
    
    // Clear ALL possible storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all caches aggressively
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(name => {
                caches.delete(name);
                console.log('🗑️ Nuked cache:', name);
            });
        });
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
                console.log('🗑️ Unregistered SW:', registration.scope);
            }
        });
    }
    
    // Force override any existing settings immediately
    const cleanSettings = {
        version: 99,
        bellSound: 'wooden',
        startBell: true,
        endBell: true,
        intervalBell: false,
        intervalMinutes: 5,
        ambientSounds: true,
        ambientType: 'meditate1',
        volume: 70,
        dailyReminder: false,
        reminderTime: '07:00'
    };
    
    localStorage.setItem('meditationSettings', JSON.stringify(cleanSettings));
    console.log('✅ NUCLEAR RESET COMPLETE - Only wooden-bell.wav and meditate1.mp3 will be used');
})();

class MeditationTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.totalSeconds = 600; // 10 minutes default
        this.currentSeconds = this.totalSeconds;
        this.intervalId = null;
        this.startTime = null;
        this.pausedTime = 0;
        
        // Clear any old settings that might reference missing files
        this.clearOldSettings();
        
        // Audio elements with error handling
        this.audioContext = null;
        this.startBell = this.createAudioElement('startBellAudio');
        this.endBell = this.createAudioElement('endBellAudio');
        this.intervalBell = this.createAudioElement('intervalBellAudio');
        this.ambientAudio = this.createAudioElement('ambientAudio');
        
        // Fallback audio system
        this.useFallbackAudio = false;
        this.initializeFallbackAudio();
        
        // Progress tracking
        this.sessions = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
        this.stats = JSON.parse(localStorage.getItem('meditationStats') || '{}');
        this.settings = JSON.parse(localStorage.getItem('meditationSettings') || '{}');
        
        // Initialize visual bell system
        this.visualBells = new VisualBellSystem();
        
        this.initializeApp();
        this.bindEvents();
        this.loadSettings();
        this.updateProgress();
    }
    
    initializeApp() {
        // Clean up any old settings that reference missing files
        this.cleanupSettings();
        
        // FORCE clean settings - no matter what was saved before
        this.settings = {
            version: 99,
            bellSound: 'wooden',
            startBell: true,
            endBell: true,
            intervalBell: false,
            intervalMinutes: 5,
            ambientSounds: true,
            ambientType: 'meditate1',
            volume: 70,
            dailyReminder: false,
            reminderTime: '07:00'
        };
        this.saveSettings();
        console.log('🔒 FORCED clean settings: Wooden Bell + Meditation Music ONLY');
        
        // Initialize stats
        if (!this.stats.totalSessions) {
            this.stats = {
                totalSessions: 0,
                totalMinutes: 0,
                longestStreak: 0,
                currentStreak: 0,
                lastSessionDate: null,
                weeklyData: []
            };
            this.saveStats();
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    createAudioElement(id) {
        const audio = document.getElementById(id);
        if (audio) {
            // Add error handling for missing audio files
            audio.addEventListener('error', () => {
                console.log(`Audio file not found for ${id}, using fallback`);
                this.useFallbackAudio = true;
            });
            
            audio.addEventListener('canplaythrough', () => {
                console.log(`Audio file loaded successfully for ${id}`);
            });
        }
        return audio;
    }
    
    initializeFallbackAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported, audio disabled');
            this.useFallbackAudio = false;
        }
    }
    
    createBeepSound(frequency = 800, duration = 0.5) {
        if (!this.audioContext) return null;
        
        return {
            play: () => {
                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = 'sine';
                    
                    const volume = (this.settings.volume / 100) * 0.3;
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                } catch (e) {
                    console.log('Error playing beep sound:', e);
                }
            }
        };
    }
    
    bindEvents() {
        // Timer controls
        document.getElementById('playPauseBtn').addEventListener('click', () => this.toggleTimer());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTimer());
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setPresetTime(parseInt(e.target.dataset.time)));
        });
        
        // Custom time input
        document.getElementById('setCustomBtn').addEventListener('click', () => this.setCustomTime());
        
        // Modal controls
        document.getElementById('settingsBtn').addEventListener('click', () => this.openModal('settingsModal'));
        document.getElementById('statsBtn').addEventListener('click', () => this.openModal('statsModal'));
        document.getElementById('closeSettings').addEventListener('click', () => this.closeModal('settingsModal'));
        document.getElementById('closeStats').addEventListener('click', () => this.closeModal('statsModal'));
        
        // Settings
        document.getElementById('startBellCheck').addEventListener('change', (e) => {
            this.settings.startBell = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('endBellCheck').addEventListener('change', (e) => {
            this.settings.endBell = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('intervalBellCheck').addEventListener('change', (e) => {
            this.settings.intervalBell = e.target.checked;
            document.getElementById('intervalSelect').disabled = !e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('intervalSelect').addEventListener('change', (e) => {
            this.settings.intervalMinutes = parseInt(e.target.value);
            this.saveSettings();
        });
        
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.settings.volume = parseInt(e.target.value);
            this.updateAudioVolume();
            this.saveSettings();
        });
        
        document.getElementById('bellSoundSelect').addEventListener('change', (e) => {
            this.settings.bellSound = e.target.value;
            this.updateBellSounds();
            this.saveSettings();
        });
        
        document.getElementById('testBellBtn').addEventListener('click', () => this.testBell());
        
        document.getElementById('ambientSoundsCheck').addEventListener('change', (e) => {
            this.settings.ambientSounds = e.target.checked;
            document.getElementById('ambientSoundSelect').disabled = !e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('ambientSoundSelect').addEventListener('change', (e) => {
            this.settings.ambientType = e.target.value;
            this.updateAmbientSounds();
            this.saveSettings();
        });
        
        document.getElementById('dailyReminderCheck').addEventListener('change', (e) => {
            this.settings.dailyReminder = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('reminderTime').addEventListener('change', (e) => {
            this.settings.reminderTime = e.target.value;
            this.saveSettings();
        });
        
        // Data management
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('resetDataBtn').addEventListener('click', () => this.resetAllData());
        
        // Completion modal
        document.getElementById('anotherSessionBtn').addEventListener('click', () => {
            this.closeModal('completionModal');
            this.resetTimer();
        });
        
        document.getElementById('finishBtn').addEventListener('click', () => {
            this.closeModal('completionModal');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        
        // Audio notification handling
        document.getElementById('dismissNotification').addEventListener('click', () => {
            document.getElementById('audioNotification').style.display = 'none';
            localStorage.setItem('audioNotificationDismissed', 'true');
        });
        
        document.getElementById('audioHelpLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAudioHelp();
        });
        
        // Check if we should show audio notification
        setTimeout(() => {
            this.checkAudioStatus();
        }, 1000);
    }
    
    toggleTimer() {
        if (!this.isRunning || this.isPaused) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }
    
    startTimer() {
        if (this.isPaused) {
            // Resume from pause
            this.isPaused = false;
            this.startTime = Date.now() - this.pausedTime;
            
            // Re-enable visual timer activity
            this.visualBells.setTimerActive(true);
            
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
            
            if (this.settings.ambientSounds && this.settings.ambientType !== 'none') {
                this.ambientAudio.play();
            }
            
            this.updatePlayPauseButton();
        } else if (!this.isRunning) {
            // Start fresh timer
            this.isRunning = true;
            this.isPaused = false;
            this.startTime = Date.now() - this.pausedTime;
            
            // Enable visual timer activity
            this.visualBells.setTimerActive(true);
            
            // Play start bell if enabled
            if (this.settings.startBell) {
                this.playBell('start');
            }
            
            // Start ambient sounds if enabled
            if (this.settings.ambientSounds && this.settings.ambientType !== 'none') {
                this.startAmbientSounds();
            }
            
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
            
            this.updatePlayPauseButton();
        }
    }
    
    pauseTimer() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.pausedTime = Date.now() - this.startTime;
            
            // Disable visual timer activity during pause
            this.visualBells.setTimerActive(false);
            
            clearInterval(this.intervalId);
            
            if (this.ambientAudio && !this.ambientAudio.paused) {
                this.ambientAudio.pause();
            }
            
            this.updatePlayPauseButton();
        }
    }
    
    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSeconds = this.totalSeconds;
        this.pausedTime = 0;
        
        // Disable visual timer activity
        this.visualBells.setTimerActive(false);
        
        clearInterval(this.intervalId);
        
        if (this.ambientAudio && !this.ambientAudio.paused) {
            this.ambientAudio.pause();
            this.ambientAudio.currentTime = 0;
        }
        
        this.updateDisplay();
        this.updateProgressRing();
        this.updatePlayPauseButton();
    }
    
    tick() {
        if (this.currentSeconds > 0) {
            this.currentSeconds--;
            this.updateDisplay();
            this.updateProgressRing();
            
            // Check for interval bell
            if (this.settings.intervalBell && this.currentSeconds > 0) {
                const elapsedMinutes = Math.floor((this.totalSeconds - this.currentSeconds) / 60);
                if (elapsedMinutes > 0 && elapsedMinutes % this.settings.intervalMinutes === 0 &&
                    (this.totalSeconds - this.currentSeconds) % 60 === 0) {
                    this.playBell('interval');
                }
            }
        } else {
            this.completeSession();
        }
    }
    
    completeSession() {
        this.isRunning = false;
        this.isPaused = false;
        
        // Disable visual timer activity
        this.visualBells.setTimerActive(false);
        
        clearInterval(this.intervalId);
        
        // Stop ambient sounds
        if (this.ambientAudio && !this.ambientAudio.paused) {
            this.ambientAudio.pause();
            this.ambientAudio.currentTime = 0;
        }
        
        // Play end bell if enabled
        if (this.settings.endBell) {
            this.playBell('end');
        }
        
        // Record session
        this.recordSession();
        
        // Show completion modal
        this.showCompletionModal();
        
        this.updatePlayPauseButton();
    }
    
    recordSession() {
        const session = {
            date: new Date().toISOString(),
            duration: Math.floor(this.totalSeconds / 60),
            type: 'anapana'
        };
        
        this.sessions.push(session);
        
        // Update stats
        this.stats.totalSessions++;
        this.stats.totalMinutes += session.duration;
        
        // Update streak
        const today = new Date().toDateString();
        const lastDate = this.stats.lastSessionDate ? new Date(this.stats.lastSessionDate).toDateString() : null;
        
        if (lastDate === today) {
            // Same day, don't change streak
        } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
            // Yesterday, continue streak
            this.stats.currentStreak++;
        } else if (lastDate === null || new Date(this.stats.lastSessionDate) < new Date(Date.now() - 86400000)) {
            // First session or gap, reset streak
            this.stats.currentStreak = 1;
        }
        
        this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
        this.stats.lastSessionDate = session.date;
        
        // Update weekly data
        this.updateWeeklyData(session);
        
        // Save to localStorage
        this.saveSessions();
        this.saveStats();
        
        // Update UI
        this.updateProgress();
        this.updateStatsModal();
    }
    
    updateWeeklyData(session) {
        const sessionDate = new Date(session.date);
        const weekStart = new Date(sessionDate);
        weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        let weekData = this.stats.weeklyData.find(w => 
            new Date(w.weekStart).getTime() === weekStart.getTime()
        );
        
        if (!weekData) {
            weekData = {
                weekStart: weekStart.toISOString(),
                days: [0, 0, 0, 0, 0, 0, 0] // Sunday to Saturday
            };
            this.stats.weeklyData.push(weekData);
        }
        
        weekData.days[sessionDate.getDay()] += session.duration;
        
        // Keep only last 12 weeks of data
        this.stats.weeklyData = this.stats.weeklyData
            .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))
            .slice(0, 12);
    }
    
    setPresetTime(minutes) {
        // Allow time changes even during meditation
        const wasRunning = this.isRunning && !this.isPaused;
        
        this.totalSeconds = minutes * 60;
        
        // If we're extending time beyond current remaining time, add the difference
        // If we're reducing time, set current time to new total if it exceeds it
        if (this.isRunning || this.isPaused) {
            // Keep the current elapsed time but adjust total
            const elapsedSeconds = this.totalSeconds - this.currentSeconds;
            this.currentSeconds = Math.max(0, this.totalSeconds - elapsedSeconds);
        } else {
            // Fresh start - set current to total
            this.currentSeconds = this.totalSeconds;
        }
        
        this.updateDisplay();
        this.updateProgressRing();
        
        // Update active preset button
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        const presetBtn = document.querySelector(`[data-time="${minutes}"]`);
        if (presetBtn) {
            presetBtn.classList.add('active');
        }
    }
    
    setCustomTime() {
        // Allow custom time changes even during meditation
        const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
        const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
        
        this.totalSeconds = (minutes * 60) + seconds;
        
        // If we're extending time beyond current remaining time, add the difference
        // If we're reducing time, set current time to new total if it exceeds it
        if (this.isRunning || this.isPaused) {
            // Keep the current elapsed time but adjust total
            const elapsedSeconds = this.totalSeconds - this.currentSeconds;
            this.currentSeconds = Math.max(0, this.totalSeconds - elapsedSeconds);
        } else {
            // Fresh start - set current to total
            this.currentSeconds = this.totalSeconds;
        }
        
        this.updateDisplay();
        this.updateProgressRing();
        
        // Clear active preset since this is custom time
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentSeconds / 60);
        const seconds = this.currentSeconds % 60;
        
        document.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateProgressRing() {
        const circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 134; // r = 134
        const progress = 1 - (this.currentSeconds / this.totalSeconds);
        const strokeDashoffset = circumference * (1 - progress);
        
        circle.style.strokeDashoffset = strokeDashoffset;
    }
    
    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        if (!this.isRunning) {
            icon.className = 'fas fa-play';
            text.textContent = 'Start';
        } else if (this.isPaused) {
            icon.className = 'fas fa-play';
            text.textContent = 'Resume';
        } else {
            icon.className = 'fas fa-pause';
            text.textContent = 'Pause';
        }
    }
    
    updateProgress() {
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => 
            new Date(session.date).toDateString() === today
        );
        
        const todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
        
        document.getElementById('todaySessions').textContent = todaySessions.length;
        document.getElementById('todayMinutes').textContent = todayMinutes;
        document.getElementById('streakDays').textContent = this.stats.currentStreak;
    }
    
    playBell(type) {
        // Always show visual bell
        this.visualBells.showBell(type);
        
        // Try to resume audio context if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        let audio;
        let fallbackFrequency = 800; // Default frequency
        
        switch (type) {
            case 'start':
                audio = this.startBell;
                fallbackFrequency = 800;
                break;
            case 'end':
                audio = this.endBell;
                fallbackFrequency = 600;
                break;
            case 'interval':
                audio = this.intervalBell;
                fallbackFrequency = 700;
                break;
            default:
                return;
        }
        
        // Try to play the audio file first
        if (audio && !this.useFallbackAudio) {
            audio.currentTime = 0;
            audio.volume = this.settings.volume / 100;
            audio.play().catch(e => {
                console.log(`Audio file failed to play for ${type}, using fallback beep`);
                this.playFallbackBeep(fallbackFrequency);
            });
        } else {
            // Use fallback beep sound
            this.playFallbackBeep(fallbackFrequency);
        }
    }
    
    playFallbackBeep(frequency) {
        const beep = this.createBeepSound(frequency, 0.8);
        if (beep) {
            beep.play();
        } else {
            console.log('Audio not available - bell sound skipped');
        }
    }
    
    testBell() {
        // Enable audio context on user interaction
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.playBell('start');
    }
    
    startAmbientSounds() {
        if (this.ambientAudio && this.settings.ambientType !== 'none') {
            this.ambientAudio.volume = this.settings.volume / 100 * 0.5; // Lower volume for ambient
            this.ambientAudio.play().catch(e => console.log('Ambient audio play failed:', e));
        }
    }
    
    updateAudioVolume() {
        const volume = this.settings.volume / 100;
        
        if (this.startBell) this.startBell.volume = volume;
        if (this.endBell) this.endBell.volume = volume;
        if (this.intervalBell) this.intervalBell.volume = volume;
        if (this.ambientAudio) this.ambientAudio.volume = volume * 0.5;
    }
    
    updateBellSounds() {
        const soundFile = 'sounds/wooden-bell.wav';
        
        if (this.startBell) this.startBell.src = soundFile;
        if (this.endBell) this.endBell.src = soundFile;
        if (this.intervalBell) this.intervalBell.src = soundFile;
    }
    
    updateAmbientSounds() {
        if (this.settings.ambientType === 'meditate1' && this.ambientAudio) {
            this.ambientAudio.src = 'sounds/ambient/meditate1.mp3';
            this.ambientAudio.loop = true;
        }
    }
    
    loadSettings() {
        // Ensure only valid sounds are used
        this.settings.bellSound = 'wooden';
        if (!['none', 'meditate1'].includes(this.settings.ambientType)) {
            this.settings.ambientType = 'meditate1';
        }
        this.saveSettings();
        
        // Bell settings
        document.getElementById('startBellCheck').checked = this.settings.startBell;
        document.getElementById('endBellCheck').checked = this.settings.endBell;
        document.getElementById('intervalBellCheck').checked = this.settings.intervalBell;
        document.getElementById('intervalSelect').value = this.settings.intervalMinutes;
        document.getElementById('intervalSelect').disabled = !this.settings.intervalBell;
        
        // Audio settings
        document.getElementById('volumeSlider').value = this.settings.volume;
        document.getElementById('bellSoundSelect').value = this.settings.bellSound;
        document.getElementById('ambientSoundsCheck').checked = this.settings.ambientSounds;
        document.getElementById('ambientSoundSelect').value = this.settings.ambientType;
        document.getElementById('ambientSoundSelect').disabled = !this.settings.ambientSounds;
        
        // Reminder settings
        document.getElementById('dailyReminderCheck').checked = this.settings.dailyReminder;
        document.getElementById('reminderTime').value = this.settings.reminderTime;
        
        // Apply settings
        this.updateAudioVolume();
        this.updateBellSounds();
        this.updateAmbientSounds();
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        
        if (modalId === 'statsModal') {
            this.updateStatsModal();
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }
    
    updateStatsModal() {
        // Overview stats
        document.getElementById('totalSessions').textContent = this.stats.totalSessions;
        document.getElementById('totalMinutes').textContent = this.stats.totalMinutes;
        document.getElementById('longestStreak').textContent = this.stats.longestStreak;
        
        const avgSession = this.stats.totalSessions > 0 ? 
            Math.round(this.stats.totalMinutes / this.stats.totalSessions) : 0;
        document.getElementById('averageSession').textContent = avgSession;
        
        // Weekly chart (simplified)
        this.renderWeeklyChart();
        
        // Recent sessions
        this.renderRecentSessions();
    }
    
    renderWeeklyChart() {
        const chartContainer = document.getElementById('weeklyChart');
        
        if (this.stats.weeklyData.length === 0) {
            chartContainer.innerHTML = '<p>No data to display yet. Complete some sessions to see your progress!</p>';
            return;
        }
        
        // Simple bar chart representation
        const latestWeek = this.stats.weeklyData[0];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxMinutes = Math.max(...latestWeek.days, 1);
        
        let chartHTML = '<div style="display: flex; justify-content: space-between; height: 150px; align-items: end; gap: 8px;">';
        
        latestWeek.days.forEach((minutes, index) => {
            const height = (minutes / maxMinutes) * 130;
            chartHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="background: var(--primary-color); width: 24px; height: ${height}px; border-radius: 4px 4px 0 0; opacity: ${minutes > 0 ? 1 : 0.2};"></div>
                    <span style="font-size: 12px; color: var(--text-secondary);">${days[index]}</span>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        chartContainer.innerHTML = chartHTML;
    }
    
    renderRecentSessions() {
        const container = document.getElementById('recentSessionsList');
        const recentSessions = this.sessions.slice(-10).reverse();
        
        if (recentSessions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No sessions yet</p>';
            return;
        }
        
        container.innerHTML = recentSessions.map(session => {
            const date = new Date(session.date);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <div class="session-item">
                    <div>
                        <div class="session-date">${dateStr} at ${timeStr}</div>
                    </div>
                    <div class="session-duration">${session.duration} min</div>
                </div>
            `;
        }).join('');
    }
    
    showCompletionModal() {
        const sessionDuration = Math.floor(this.totalSeconds / 60);
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => 
            new Date(session.date).toDateString() === today
        ).length;
        
        document.getElementById('sessionDuration').textContent = sessionDuration;
        document.getElementById('sessionsToday').textContent = todaySessions;
        
        // Motivational messages
        const messages = [
            "Excellent work! You've cultivated inner peace through mindful breathing.",
            "Wonderful! Each moment of mindfulness is a gift to yourself.",
            "Great dedication! Your consistent practice is building inner strength.",
            "Well done! You've taken time to nurture your mind and spirit.",
            "Congratulations! This practice contributes to your overall wellbeing."
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('completionMessage').textContent = randomMessage;
        
        this.openModal('completionModal');
    }
    
    handleKeyboardShortcuts(e) {
        // Prevent shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.toggleTimer();
                break;
            case 'KeyR':
                e.preventDefault();
                this.resetTimer();
                break;
            case 'Escape':
                // Close any open modal
                document.querySelectorAll('.modal.show').forEach(modal => {
                    this.closeModal(modal.id);
                });
                break;
        }
    }
    
    exportData() {
        const data = {
            sessions: this.sessions,
            stats: this.stats,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `meditation-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    }
    
    resetAllData() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            localStorage.removeItem('meditationSessions');
            localStorage.removeItem('meditationStats');
            localStorage.removeItem('meditationSettings');
            
            alert('All data has been reset. Please refresh the page.');
            location.reload();
        }
    }
    
    // Data persistence methods
    saveSessions() {
        localStorage.setItem('meditationSessions', JSON.stringify(this.sessions));
    }
    
    saveStats() {
        localStorage.setItem('meditationStats', JSON.stringify(this.stats));
    }
    
    saveSettings() {
        localStorage.setItem('meditationSettings', JSON.stringify(this.settings));
    }
    
    cleanupSettings() {
        if (this.settings.bellSound !== 'wooden') {
            this.settings.bellSound = 'wooden';
        }
        if (!['none', 'meditate1'].includes(this.settings.ambientType)) {
            this.settings.ambientType = 'meditate1';
        }
        this.saveSettings();
    }
    
    clearOldSettings() {
        const oldSettings = JSON.parse(localStorage.getItem('meditationSettings') || '{}');
        
        if (oldSettings.bellSound && oldSettings.bellSound !== 'wooden') {
            localStorage.removeItem('meditationSettings');
        }
        
        if (oldSettings.ambientType && !['none', 'meditate1'].includes(oldSettings.ambientType)) {
            localStorage.removeItem('meditationSettings');
        }
    }
    
    checkAudioStatus() {
        // Check if any audio files failed to load or if we're using fallback
        const hasAudioIssues = this.useFallbackAudio || 
            (this.startBell && this.startBell.error) ||
            (this.endBell && this.endBell.error) ||
            !this.audioContext;
            
        const notificationDismissed = localStorage.getItem('audioNotificationDismissed') === 'true';
        
        if (hasAudioIssues && !notificationDismissed) {
            document.getElementById('audioNotification').style.display = 'block';
        }
    }
    
    showAudioHelp() {
        const helpContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Audio Setup Help</h2>
                    <button class="close-btn" onclick="this.closest('.modal').classList.remove('show')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <h3>Missing Audio Files</h3>
                    <p>The app is currently using synthesized bell sounds because audio files are not available.</p>
                    
                    <h3>Available Sounds:</h3>
                    <ul>
                        <li>✅ Wooden Bell - Available</li>
                        <li>✅ Meditation Music - Available</li>
                    </ul>
                    
                    <h3>To Add More Bell Sounds:</h3>
                    <ol>
                        <li>Download meditation bell audio files (MP3 or WAV format)</li>
                        <li>Place them in the <code>sounds/</code> folder</li>
                        <li>Update the sound options in the settings</li>
                        <li>Refresh the page</li>
                    </ol>
                    
                    <h3>Current Status:</h3>
                    <p>✅ Timer functionality works perfectly<br>
                    ✅ Fallback bell sounds are active<br>
                    ⚠️ Real audio files not found</p>
                    
                    <p><em>The app works fully without audio files - they're just an enhancement!</em></p>
                </div>
            </div>
        `;
        
        // Create and show help modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = helpContent;
        document.body.appendChild(modal);
        
        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}

// ===== NOTIFICATION SYSTEM =====
class NotificationManager {
    constructor(timer) {
        this.timer = timer;
        this.permission = Notification.permission;
        this.checkPermission();
    }
    
    async checkPermission() {
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
    }
    
    scheduleReminder() {
        if (this.timer.settings.dailyReminder && this.permission === 'granted') {
            // This would require a service worker for persistent reminders
            // For now, we'll just show browser notifications when the app is open
            const now = new Date();
            const [hours, minutes] = this.timer.settings.reminderTime.split(':');
            const reminderTime = new Date();
            reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            
            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            setTimeout(() => {
                this.showNotification();
                // Schedule next day
                setTimeout(() => this.scheduleReminder(), 24 * 60 * 60 * 1000);
            }, timeUntilReminder);
        }
    }
    
    showNotification() {
        if (this.permission === 'granted') {
            new Notification('Time for Meditation', {
                body: 'Take a moment for your Anapana practice',
                icon: 'icons/meditation-icon.png',
                tag: 'meditation-reminder'
            });
        }
    }
}

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== APPLICATION INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const timer = new MeditationTimer();
    const notifications = new NotificationManager(timer);
    
    // Schedule reminder if enabled
    if (timer.settings.dailyReminder) {
        notifications.scheduleReminder();
    }
    
    // Handle app visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && timer.isRunning && !timer.isPaused) {
            // App is hidden but timer is running
            console.log('App hidden, timer continues in background');
        } else if (!document.hidden && timer.isRunning) {
            // App is visible again
            console.log('App visible, checking timer sync');
        }
    });
    
    // Prevent accidental page refresh during meditation
    window.addEventListener('beforeunload', (e) => {
        if (timer.isRunning && !timer.isPaused) {
            e.preventDefault();
            e.returnValue = '';
            return 'You have an active meditation session. Are you sure you want to leave?';
        }
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        console.log('App is online');
    });
    
    window.addEventListener('offline', () => {
        console.log('App is offline - timer continues to work');
    });
    
    console.log('Anapana Meditation Timer initialized successfully');
});