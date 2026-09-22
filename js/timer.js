/* ============================================
   TIMER - Contagem de descanso
   ============================================ */

const Timer = {
    interval: null,
    timeRemaining: 0,
    totalTime: 0,
    isRunning: false,
    audioContext: null,
    currentExerciseId: null,

    elements: {
        timerValue: null,
        timerCircle: null,
        timerExerciseName: null,
        timerSetInfo: null
    },

    callbacks: {
        onFinish: null
    },

    init() {
        this.elements.timerValue = document.getElementById('timer-value');
        this.elements.timerCircle = document.getElementById('timer-circle');
        this.elements.timerExerciseName = document.getElementById('timer-exercise-name');
        this.elements.timerSetInfo = document.getElementById('timer-set-info');

        // Preset buttons
        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.getAttribute('data-time'));
                this.start(time);
            });
        });

        // Custom time button
        document.getElementById('btn-custom-timer').addEventListener('click', () => {
            const input = document.getElementById('timer-custom-input');
            const time = parseInt(input.value);
            if (time && time >= 5 && time <= 600) {
                this.start(time);
            }
        });

        // Enter key on custom input
        document.getElementById('timer-custom-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('btn-custom-timer').click();
            }
        });

        // Stop button
        document.getElementById('btn-stop-timer').addEventListener('click', () => {
            this.stop();
        });
    },

    start(seconds, exerciseName = '', setInfo = '', exerciseId = null) {
        if (this.isRunning) {
            this.stop();
        }

        this.totalTime = seconds;
        this.timeRemaining = seconds;
        this.isRunning = true;
        this.currentExerciseId = exerciseId;

        // Update exercise info
        if (this.elements.timerExerciseName) {
            this.elements.timerExerciseName.textContent = exerciseName || 'Descanso';
        }
        if (this.elements.timerSetInfo) {
            this.elements.timerSetInfo.textContent = setInfo || `${seconds} segundos`;
        }

        // Update display
        this.updateDisplay();

        // Start countdown
        this.elements.timerCircle.classList.remove('finished');
        this.elements.timerCircle.classList.add('running');

        this.interval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.finish();
            }

            this.updateDisplay();
        }, 1000);
    },

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        this.elements.timerCircle.classList.remove('running');
    },

    finish() {
        this.stop();
        this.elements.timerCircle.classList.add('finished');
        this.playAlert();

        if (this.callbacks.onFinish) {
            this.callbacks.onFinish();
        }
    },

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (this.elements.timerValue) {
            this.elements.timerValue.textContent = display;
        }
    },

    playAlert() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const playBeep = (time, freq, duration) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);

                oscillator.start(time);
                oscillator.stop(time + duration);
            };

            const now = this.audioContext.currentTime;
            playBeep(now, 880, 0.2);
            playBeep(now + 0.3, 880, 0.2);
            playBeep(now + 0.6, 1100, 0.4);
        } catch (e) {
            // Audio not supported
        }
    },

    onFinish(callback) {
        this.callbacks.onFinish = callback;
    },

    isActive() {
        return this.isRunning;
    }
};
