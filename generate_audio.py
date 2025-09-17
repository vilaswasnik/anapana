#!/usr/bin/env python3
"""
Audio File Generator for Meditation Timer
Creates high-quality bell sounds and ambient audio
"""
import numpy as np
import wave
import os
import subprocess

def generate_bell_tone(frequency=800, duration=2.0, sample_rate=44100, bell_type='tibetan'):
    """Generate a realistic bell tone with harmonics and natural decay"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Different bell configurations
    bell_configs = {
        'tibetan': {'harmonics': [1, 2.5, 4.1, 5.8], 'amplitudes': [1.0, 0.3, 0.15, 0.08], 'decay': 0.8},
        'temple': {'harmonics': [1, 3, 5, 7], 'amplitudes': [1.0, 0.4, 0.2, 0.1], 'decay': 0.6},
        'soft': {'harmonics': [1, 1.5, 2.2], 'amplitudes': [1.0, 0.2, 0.1], 'decay': 0.9},
        'singing': {'harmonics': [1, 2, 3.5, 5.2], 'amplitudes': [1.0, 0.35, 0.18, 0.09], 'decay': 0.7}
    }
    
    config = bell_configs.get(bell_type, bell_configs['tibetan'])
    
    # Generate the bell sound with harmonics
    signal = np.zeros(len(t))
    for harmonic, amplitude in zip(config['harmonics'], config['amplitudes']):
        # Add slight frequency modulation for realism
        freq_mod = frequency * harmonic * (1 + 0.02 * np.sin(2 * np.pi * 3 * t))
        signal += amplitude * np.sin(2 * np.pi * freq_mod * t)
    
    # Apply natural bell envelope (attack, decay, sustain, release)
    envelope = np.ones(len(t))
    attack_samples = int(0.02 * sample_rate)  # 20ms attack
    decay_start = int(0.1 * sample_rate)      # 100ms to decay start
    
    # Attack phase
    envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    
    # Decay phase
    decay_factor = config['decay']
    envelope[decay_start:] *= np.exp(-5 * decay_factor * t[decay_start:] / duration)
    
    # Apply envelope
    signal *= envelope
    
    # Add subtle reverb effect
    reverb_delay = int(0.03 * sample_rate)  # 30ms delay
    reverb_signal = np.zeros(len(signal) + reverb_delay)
    reverb_signal[:len(signal)] = signal
    reverb_signal[reverb_delay:] += 0.3 * signal
    
    # Normalize to prevent clipping
    reverb_signal = reverb_signal / np.max(np.abs(reverb_signal)) * 0.8
    
    return reverb_signal.astype(np.float32)

def generate_ambient_sound(sound_type='rain', duration=30.0, sample_rate=44100):
    """Generate ambient sounds for meditation"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    if sound_type == 'rain':
        # Generate realistic rain sound with filtered noise
        rain = np.random.normal(0, 1, len(t))
        # Apply band-pass filtering effect
        rain = rain * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t)) * 0.3
        
    elif sound_type == 'ocean':
        # Ocean waves with low-frequency oscillation
        waves = np.sin(2 * np.pi * 0.05 * t) * np.sin(2 * np.pi * 0.15 * t)
        noise = np.random.normal(0, 1, len(t)) * 0.1
        rain = waves * 0.4 + noise
        
    elif sound_type == 'forest':
        # Forest ambience with bird-like chirps and wind
        wind = np.random.normal(0, 1, len(t)) * 0.2
        # Add occasional bird-like sounds
        for i in range(0, len(t), sample_rate * 3):  # Every 3 seconds
            if i + sample_rate < len(t) and np.random.random() > 0.5:
                chirp_len = min(sample_rate // 2, len(t) - i)
                chirp_t = np.linspace(0, 0.5, chirp_len)
                chirp = 0.1 * np.sin(2 * np.pi * 1200 * chirp_t) * np.exp(-chirp_t * 4)
                wind[i:i+chirp_len] += chirp
        rain = wind
        
    elif sound_type == 'white-noise':
        # Soft white noise
        rain = np.random.normal(0, 1, len(t)) * 0.15
        
    else:
        rain = np.random.normal(0, 1, len(t)) * 0.2
    
    # Apply gentle low-pass filter
    rain = np.convolve(rain, np.ones(5)/5, mode='same')
    
    # Normalize
    rain = rain / np.max(np.abs(rain)) * 0.6
    
    return rain.astype(np.float32)

def save_as_wav(audio_data, filename, sample_rate=44100):
    """Save audio data as WAV file"""
    # Convert to 16-bit PCM
    audio_16bit = (audio_data * 32767).astype(np.int16)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_16bit.tobytes())

def convert_wav_to_mp3(wav_file, mp3_file):
    """Convert WAV to MP3 using ffmpeg if available"""
    try:
        subprocess.run([
            'ffmpeg', '-i', wav_file, '-acodec', 'mp3', '-ab', '192k', mp3_file, '-y'
        ], check=True, capture_output=True)
        # Remove the temporary WAV file
        os.remove(wav_file)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"ffmpeg not available, keeping WAV file: {wav_file}")
        return False

def main():
    """Generate all meditation audio files"""
    sounds_dir = '/workspaces/anapana/app/sounds'
    os.makedirs(sounds_dir, exist_ok=True)
    
    print("🎵 Generating meditation audio files...")
    
    # Generate bell sounds
    bell_sounds = [
        ('tibetan-bell.mp3', 800, 'tibetan'),
        ('soft-chime.mp3', 700, 'soft'),
        ('temple-gong.mp3', 600, 'temple'),
        ('singing-bowl.mp3', 650, 'singing')
    ]
    
    for filename, frequency, bell_type in bell_sounds:
        print(f"  Creating {filename}...")
        audio = generate_bell_tone(frequency, duration=2.5, bell_type=bell_type)
        
        wav_file = os.path.join(sounds_dir, filename.replace('.mp3', '.wav'))
        mp3_file = os.path.join(sounds_dir, filename)
        
        save_as_wav(audio, wav_file)
        
        if not convert_wav_to_mp3(wav_file, mp3_file):
            # If MP3 conversion failed, rename WAV to MP3 (browsers can handle WAV)
            os.rename(wav_file, mp3_file.replace('.mp3', '.wav'))
    
    # Generate ambient sounds
    ambient_sounds = [
        ('rain.mp3', 'rain'),
        ('ocean.mp3', 'ocean'),
        ('forest.mp3', 'forest'),
        ('white-noise.mp3', 'white-noise')
    ]
    
    for filename, sound_type in ambient_sounds:
        print(f"  Creating {filename}...")
        audio = generate_ambient_sound(sound_type, duration=30.0)
        
        wav_file = os.path.join(sounds_dir, filename.replace('.mp3', '.wav'))
        mp3_file = os.path.join(sounds_dir, filename)
        
        save_as_wav(audio, wav_file)
        
        if not convert_wav_to_mp3(wav_file, mp3_file):
            os.rename(wav_file, mp3_file.replace('.mp3', '.wav'))
    
    print("✅ All audio files generated successfully!")
    print("📁 Files created in:", sounds_dir)

if __name__ == "__main__":
    main()