// Visual Bell System - Alternative to Audio
class VisualBellSystem {
    constructor() {
        this.createVisualBell();
        this.setupStyles();
    }
    
    createVisualBell() {
        // Create visual bell overlay
        const bellOverlay = document.createElement('div');
        bellOverlay.id = 'visualBellOverlay';
        bellOverlay.innerHTML = `
            <div class="visual-bell-content">
                <div class="bell-icon">🔔</div>
                <div class="bell-ripples">
                    <div class="ripple ripple-1"></div>
                    <div class="ripple ripple-2"></div>
                    <div class="ripple ripple-3"></div>
                </div>
                <div class="bell-text"></div>
            </div>
        `;
        document.body.appendChild(bellOverlay);
    }
    
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #visualBellOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(99, 102, 241, 0.1);
                backdrop-filter: blur(2px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                pointer-events: none;
            }
            
            .visual-bell-content {
                text-align: center;
                position: relative;
            }
            
            .bell-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: bellRing 0.8s ease-in-out;
            }
            
            .bell-ripples {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
            }
            
            .ripple {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(99, 102, 241, 0.6);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: rippleExpand 1.5s ease-out infinite;
            }
            
            .ripple-2 {
                animation-delay: 0.3s;
            }
            
            .ripple-3 {
                animation-delay: 0.6s;
            }
            
            .bell-text {
                font-size: 1.2rem;
                color: var(--primary-color);
                font-weight: 600;
                margin-top: 1rem;
                animation: fadeInOut 2s ease-in-out;
            }
            
            @keyframes bellRing {
                0%, 100% { transform: rotate(0deg); }
                10% { transform: rotate(15deg); }
                20% { transform: rotate(-10deg); }
                30% { transform: rotate(5deg); }
                40% { transform: rotate(-5deg); }
                50% { transform: rotate(2deg); }
                60% { transform: rotate(-2deg); }
                70% { transform: rotate(0deg); }
            }
            
            @keyframes rippleExpand {
                0% {
                    width: 20px;
                    height: 20px;
                    opacity: 1;
                }
                100% {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
            
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(20px); }
                30% { opacity: 1; transform: translateY(0); }
                70% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
            
            /* Visual feedback for timer controls */
            .timer-flash {
                animation: timerFlash 0.5s ease-in-out;
            }
            
            @keyframes timerFlash {
                0%, 100% { background: transparent; }
                50% { background: rgba(99, 102, 241, 0.1); }
            }
            
            /* Pulse effect for active timer */
            .timer-active .progress-ring-circle {
                animation: timerPulse 2s ease-in-out infinite;
            }
            
            @keyframes timerPulse {
                0%, 100% { stroke-width: 4; }
                50% { stroke-width: 6; }
            }
        `;
        document.head.appendChild(style);
    }
    
    showBell(type, duration = 2000) {
        const overlay = document.getElementById('visualBellOverlay');
        const textElement = overlay.querySelector('.bell-text');
        const bellIcon = overlay.querySelector('.bell-icon');
        
        // Set bell type specific content
        const bellConfig = {
            'start': { text: 'Session Starting', icon: '🔔', color: 'rgba(16, 185, 129, 0.15)' },
            'end': { text: 'Session Complete', icon: '✨', color: 'rgba(99, 102, 241, 0.15)' },
            'interval': { text: 'Mindful Moment', icon: '🎋', color: 'rgba(251, 191, 36, 0.15)' }
        };
        
        const config = bellConfig[type] || bellConfig['start'];
        textElement.textContent = config.text;
        bellIcon.textContent = config.icon;
        overlay.style.background = config.color;
        
        // Show the visual bell
        overlay.style.display = 'flex';
        
        // Hide after duration
        setTimeout(() => {
            overlay.style.display = 'none';
        }, duration);
        
        // Add flash effect to timer
        this.addTimerFlash();
    }
    
    addTimerFlash() {
        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer) {
            timerContainer.classList.add('timer-flash');
            setTimeout(() => {
                timerContainer.classList.remove('timer-flash');
            }, 500);
        }
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

// Export for use in main app
window.VisualBellSystem = VisualBellSystem;