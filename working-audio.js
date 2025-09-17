// Working Audio Generator - Creates Perfect Bell Sounds
class WorkingAudioGenerator {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Audio context initialized successfully');
        } catch (e) {
            console.log('❌ Web Audio not available:', e);
        }
    }
    
    // Generate perfect bell sounds
    createBellTone(frequency = 800, duration = 2, type = 'tibetan') {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Different bell types
        const bellConfigs = {
            tibetan: {
                type: 'sine',
                harmonics: [1, 2.5, 4.1, 5.8],
                decay: 0.8
            },
            temple: {
                type: 'triangle',
                harmonics: [1, 3, 5, 7],
                decay: 0.6
            },
            soft: {
                type: 'sine',
                harmonics: [1, 1.5, 2.2],
                decay: 0.9
            },
            singing: {
                type: 'sawtooth',
                harmonics: [1, 2, 3.5, 5.2],
                decay: 0.7
            }
        };
        
        const config = bellConfigs[type] || bellConfigs.tibetan;
        
        // Create main oscillator
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Add frequency modulation for realistic bell sound
        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * 0.85, 
            this.audioContext.currentTime + duration
        );
        
        // Set up filter for warmth
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Create natural bell envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            this.audioContext.currentTime + duration * config.decay
        );
        
        // Connect audio nodes
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }
        };
    }
    
    // Generate ambient sounds
    createAmbientSound(type = 'rain') {
        if (!this.audioContext) return null;
        
        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate different ambient sounds
        for (let i = 0; i < bufferSize; i++) {
            switch (type) {
                case 'rain':
                    data[i] = (Math.random() * 2 - 1) * 0.3 * Math.sin(i * 0.01);
                    break;
                case 'ocean':
                    data[i] = (Math.random() * 2 - 1) * 0.2 * Math.sin(i * 0.005) * Math.cos(i * 0.002);
                    break;
                case 'forest':
                    data[i] = (Math.random() * 2 - 1) * 0.15 * (Math.sin(i * 0.003) + Math.sin(i * 0.007));
                    break;
                case 'white-noise':
                    data[i] = (Math.random() * 2 - 1) * 0.1;
                    break;
                default:
                    data[i] = (Math.random() * 2 - 1) * 0.2;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.3;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                source.start(0);
            },
            stop: () => source.stop()
        };
    }
}

// Export for use
window.WorkingAudioGenerator = WorkingAudioGenerator;