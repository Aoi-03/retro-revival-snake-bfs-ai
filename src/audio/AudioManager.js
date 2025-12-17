export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.isPlaying = false;
        this.volume = 0.3;
        
        this.initializeAudio();
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    playBackgroundMusic() {
        if (!this.audioContext || this.isPlaying) return;
        
        this.isPlaying = true;
        this.playChiptune();
    }
    
    stopBackgroundMusic() {
        this.isPlaying = false;
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }
    
    playChiptune() {
        if (!this.audioContext) return;
        
        // Simple chiptune melody
        const melody = [
            { freq: 440, duration: 0.2 }, // A
            { freq: 523, duration: 0.2 }, // C
            { freq: 659, duration: 0.2 }, // E
            { freq: 784, duration: 0.4 }, // G
            { freq: 659, duration: 0.2 }, // E
            { freq: 523, duration: 0.2 }, // C
            { freq: 440, duration: 0.4 }, // A
        ];
        
        this.playMelody(melody, 0);
    }
    
    playMelody(melody, index) {
        if (!this.isPlaying || index >= melody.length) {
            if (this.isPlaying) {
                // Loop the melody
                setTimeout(() => this.playMelody(melody, 0), 500);
            }
            return;
        }
        
        const note = melody[index];
        this.playTone(note.freq, note.duration);
        
        setTimeout(() => {
            this.playMelody(melody, index + 1);
        }, note.duration * 1000);
    }
    
    playTone(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square'; // Chiptune sound
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Envelope for retro sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playEatSound() {
        this.playTone(800, 0.1);
    }
    
    playGameOverSound() {
        // Descending tone sequence
        setTimeout(() => this.playTone(400, 0.2), 0);
        setTimeout(() => this.playTone(350, 0.2), 200);
        setTimeout(() => this.playTone(300, 0.4), 400);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}