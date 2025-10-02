// Simple Bell System - Just Audio, No Visuals
class EnhancedBellSystem {
    constructor() {
        // Initialize simple audio element for wooden bell
        this.audioElement = document.getElementById('bell-sound');
        console.log('Simple bell system loaded - wooden bell audio only');
    }
    
    showBell(message, duration = 3000) {
        // Simply play the wooden bell audio - no visual effects
        this.triggerBell();
    }
    
    triggerBell() {
        // Only play the wooden bell audio - no vibration or visual effects
        if (this.audioElement && this.audioElement.readyState >= 2) {
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(e => console.warn('Bell audio play failed:', e));
        }
    }
    
    setTimerActive(active) {
        // No visual timer effects - keep it simple
        console.log('Timer active state:', active);
    }
}

// Replace the old visual bell system
window.VisualBellSystem = EnhancedBellSystem;