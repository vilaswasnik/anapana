// Enhanced Visual + Web Audio Bell System
class EnhancedBellSystem {
    constructor() {
        this.audioContext = null;
        this.initializeAudioContext();
        this.createVisualBell();
        this.setupStyles();
    }
    
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not available, using visual-only feedback');
        }
    }
    
    createVisualBell() {
        const bellOverlay = document.createElement('div');
        bellOverlay.id = 'enhancedBellOverlay';
        bellOverlay.innerHTML = `
            <div class="enhanced-bell-content">
                <div class="bell-icon">🔔</div>
                <div class="bell-ripples">
                    <div class="ripple ripple-1"></div>
                    <div class="ripple ripple-2"></div>
                    <div class="ripple ripple-3"></div>
                </div>
                <div class="bell-text"></div>
                <div class="frequency-bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
            </div>
        `;
        document.body.appendChild(bellOverlay);
    }
    
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #enhancedBellOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(99, 102, 241, 0.1);
                backdrop-filter: blur(3px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                pointer-events: none;
            }
            
            .enhanced-bell-content {
                text-align: center;
                position: relative;
            }
            
            .bell-icon {
                font-size: 5rem;
                margin-bottom: 1rem;
                animation: enhancedBellRing 1.2s ease-in-out;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            }
            
            .bell-ripples {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
            }
            
            .ripple {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 30px;
                height: 30px;
                border: 3px solid rgba(99, 102, 241, 0.7);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: enhancedRippleExpand 2s ease-out infinite;
            }
            
            .ripple-2 { animation-delay: 0.4s; }
            .ripple-3 { animation-delay: 0.8s; }
            
            .bell-text {
                font-size: 1.5rem;
                color: var(--primary-color, #6366f1);
                font-weight: 700;
                margin-top: 2rem;
                animation: enhancedFadeInOut 2.5s ease-in-out;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .frequency-bars {
                display: flex;
                justify-content: center;
                gap: 4px;
                margin-top: 1rem;
                height: 30px;
                align-items: flex-end;
            }
            
            .bar {
                width: 4px;
                background: linear-gradient(to top, #6366f1, #a855f7);
                border-radius: 2px;
                animation: frequencyBounce 0.6s ease-in-out infinite alternate;
            }
            
            .bar:nth-child(1) { animation-delay: 0s; }
            .bar:nth-child(2) { animation-delay: 0.1s; }
            .bar:nth-child(3) { animation-delay: 0.2s; }
            .bar:nth-child(4) { animation-delay: 0.3s; }
            .bar:nth-child(5) { animation-delay: 0.4s; }
            
            @keyframes enhancedBellRing {
                0%, 100% { transform: rotate(0deg) scale(1); }
                10% { transform: rotate(20deg) scale(1.1); }
                20% { transform: rotate(-15deg) scale(1.05); }
                30% { transform: rotate(10deg) scale(1.08); }
                40% { transform: rotate(-8deg) scale(1.03); }
                50% { transform: rotate(4deg) scale(1.06); }
                60% { transform: rotate(-3deg) scale(1.02); }
                70% { transform: rotate(1deg) scale(1.04); }
                80% { transform: rotate(0deg) scale(1.01); }
            }
            
            @keyframes enhancedRippleExpand {
                0% {
                    width: 30px;
                    height: 30px;
                    opacity: 1;
                }
                100% {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
            
            @keyframes enhancedFadeInOut {
                0% { opacity: 0; transform: translateY(30px) scale(0.8); }
                25% { opacity: 1; transform: translateY(0) scale(1); }
                75% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-30px) scale(1.1); }
            }
            
            @keyframes frequencyBounce {
                0% { height: 10px; }
                100% { height: 30px; }
            }
            
            /* Enhanced timer visual feedback */
            .timer-active .progress-ring-circle {
                animation: activeTimerPulse 3s ease-in-out infinite;
                filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
            }
            
            @keyframes activeTimerPulse {
                0%, 100% { 
                    stroke-width: 4; 
                    opacity: 0.9;
                }
                50% { 
                    stroke-width: 6; 
                    opacity: 1;
                }
            }
            
            .session-flash {
                animation: sessionFlash 1s ease-in-out;
            }
            
            @keyframes sessionFlash {
                0%, 100% { background: transparent; }
                25% { background: rgba(16, 185, 129, 0.1); }
                50% { background: rgba(99, 102, 241, 0.15); }
                75% { background: rgba(251, 191, 36, 0.1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    playBellSound(frequency) {
        if (!this.audioContext) return;
        
        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Create a pleasant bell-like sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, this.audioContext.currentTime + 1);
            
            // Envelope for natural bell decay
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1.5);
            
        } catch (e) {
            console.log('Web Audio synthesis failed, using visual-only feedback');
        }
    }
    
    showBell(type, duration = 3000) {
        const overlay = document.getElementById('enhancedBellOverlay');
        const textElement = overlay.querySelector('.bell-text');
        const bellIcon = overlay.querySelector('.bell-icon');
        
        const bellConfig = {
            'start': { 
                text: '🧘 Session Starting', 
                icon: '🔔', 
                color: 'rgba(16, 185, 129, 0.15)',
                frequency: 800 
            },
            'end': { 
                text: '✨ Session Complete', 
                icon: '🎉', 
                color: 'rgba(99, 102, 241, 0.15)',
                frequency: 600 
            },
            'interval': { 
                text: '🎋 Mindful Moment', 
                icon: '🎋', 
                color: 'rgba(251, 191, 36, 0.15)',
                frequency: 700 
            }
        };
        
        const config = bellConfig[type] || bellConfig['start'];
        textElement.textContent = config.text;
        bellIcon.textContent = config.icon;
        overlay.style.background = config.color;
        
        // Play synthetic bell sound
        this.playBellSound(config.frequency);
        
        // Show the visual bell
        overlay.style.display = 'flex';
        
        // Add flash effect to body
        document.body.classList.add('session-flash');
        
        // Hide after duration
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.classList.remove('session-flash');
        }, duration);
    }
    
    setTimerActive(active) {
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) {
            if (active) {
                timerDisplay.classList.add('timer-active');
            } else {
                timerDisplay.classList.remove('timer-active');
            }
        }
    }
}

// Replace the old visual bell system
window.VisualBellSystem = EnhancedBellSystem;