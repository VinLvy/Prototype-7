
// Simple synthesizer for sound effects using Web Audio API
// No external files required!

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playLevelUpSound = () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Create oscillator nodes (C major arpeggio: C4, E4, G4, C5)
    const notes = [261.63, 329.63, 392.00, 523.25];

    notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine'; // Smooth tone
        osc.frequency.setValueAtTime(freq, now + index * 0.1); // Staggered start

        // Envelope: Attack -> Decay
        gain.gain.setValueAtTime(0, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + index * 0.1 + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.5); // Decay

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.5);
    });
};

export const playClickSound = () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
};
