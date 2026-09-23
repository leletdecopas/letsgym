/* ============================================
   TIMER - Contagem de descanso
   Baseado em timestamp para nao pausar em
   segundo plano e sobreviver a reloads.
   ============================================ */

const AudioAlert = {
    ctx: null,
    pending: false,

    ensure() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    },

    unlock() {
        const ctx = this.ensure();
        if (!ctx) return null;
        try {
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            if (ctx.state === 'running' && !this._silentPlayed) {
                this._silentPlayed = true;
                const buffer = ctx.createBuffer(1, 1, 22050);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
            }
        } catch (e) {}
        return ctx;
    },

    isReady() {
        return !!this.ctx && this.ctx.state === 'running';
    },

    vibrate() {
        try {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
        } catch (e) {}
    },

    play() {
        this.vibrate();
        const ctx = this.unlock();
        if (!ctx) {
            this.pending = true;
            return;
        }

        const attempt = () => {
            if (ctx.state === 'running') {
                this.pending = false;
                this.beeps(ctx);
                return;
            }
            ctx.resume().then(() => {
                if (ctx.state === 'running') {
                    this.pending = false;
                    this.beeps(ctx);
                } else {
                    this.pending = true;
                }
            }).catch(() => {
                this.pending = true;
            });
        };

        if (ctx.state === 'suspended') {
            ctx.resume().then(attempt).catch(() => {
                this.pending = true;
            });
        } else {
            attempt();
        }
    },

    flushPending() {
        if (!this.pending) return;
        const ctx = this.unlock();
        if (ctx && ctx.state === 'running') {
            this.pending = false;
            this.beeps(ctx);
            this.vibrate();
        }
    },

    beeps(ctx) {
        try {
            const playBeep = (time, freq, duration) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
                oscillator.start(time);
                oscillator.stop(time + duration);
            };
            const now = ctx.currentTime;
            playBeep(now, 880, 0.2);
            playBeep(now + 0.3, 880, 0.2);
            playBeep(now + 0.6, 1100, 0.4);
        } catch (e) {
            this.vibrate();
        }
    }
};

const Timer = {
    interval: null,
    timeRemaining: 0,
    totalTime: 0,
    endAt: null,
    isRunning: false,
    currentExerciseId: null,
    exerciseName: '',
    setInfo: '',
    finished: false,

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
            const minutes = parseInt(input.value);
            if (minutes && minutes >= 1 && minutes <= 5) {
                this.start(minutes * 60);
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

        // Reset button
        document.getElementById('btn-reset-timer').addEventListener('click', () => {
            this.reset();
        });

        // Recalcular ao voltar ao app (evita congelar em segundo plano)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                AudioAlert.unlock();
                AudioAlert.flushPending();
                this.sync();
            }
        });
        window.addEventListener('focus', () => {
            AudioAlert.unlock();
            AudioAlert.flushPending();
            this.sync();
        });

        // Restaurar timer persistido apos reload/reabertura
        this.restore();
    },

    start(seconds, exerciseName = '', setInfo = '', exerciseId = null) {
        AudioAlert.unlock();

        this.clearInterval_();
        this.totalTime = seconds;
        this.timeRemaining = seconds;
        this.endAt = Date.now() + seconds * 1000;
        this.isRunning = true;
        this.finished = false;
        this.currentExerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.setInfo = setInfo;

        if (this.elements.timerExerciseName) {
            this.elements.timerExerciseName.textContent = exerciseName || 'Descanso';
        }
        if (this.elements.timerSetInfo) {
            this.elements.timerSetInfo.textContent = setInfo || `${seconds} segundos`;
        }

        this.elements.timerCircle.classList.remove('finished');
        this.elements.timerCircle.classList.add('running');

        this.saveState();
        this.updateDisplay();

        this.interval = setInterval(() => this.tick(), 1000);
    },

    tick() {
        if (!this.isRunning) return;

        this.timeRemaining = Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
        this.updateDisplay();

        if (this.timeRemaining <= 0) {
            this.finish();
        } else {
            this.saveState();
        }
    },

    sync() {
        if (this.isRunning) {
            this.tick();
        }
    },

    stop() {
        this.clearInterval_();
        if (this.isRunning && this.endAt) {
            this.timeRemaining = Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
        }
        this.isRunning = false;
        this.endAt = null;
        this.elements.timerCircle.classList.remove('running');
        this.saveState();
        this.updateDisplay();
    },

    reset() {
        this.clearInterval_();
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.endAt = null;
        this.isRunning = false;
        this.finished = false;
        this.currentExerciseId = null;
        this.exerciseName = '';
        this.setInfo = '';

        this.elements.timerCircle.classList.remove('running', 'finished');
        this.updateDisplay();

        if (this.elements.timerExerciseName) {
            this.elements.timerExerciseName.textContent = 'Descanso';
        }
        if (this.elements.timerSetInfo) {
            this.elements.timerSetInfo.textContent = '';
        }

        Storage.clearTimerState();
    },

    finish() {
        this.clearInterval_();
        this.timeRemaining = 0;
        this.isRunning = false;
        this.endAt = null;
        this.finished = true;
        this.elements.timerCircle.classList.remove('running');
        this.elements.timerCircle.classList.add('finished');
        this.updateDisplay();
        Storage.clearTimerState();
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

    saveState() {
        if (this.totalTime <= 0 && !this.isRunning) {
            Storage.clearTimerState();
            return;
        }
        Storage.setTimerState({
            running: this.isRunning,
            endAt: this.endAt,
            remaining: this.timeRemaining,
            totalTime: this.totalTime,
            exerciseName: this.exerciseName,
            setInfo: this.setInfo,
            currentExerciseId: this.currentExerciseId
        });
    },

    restore() {
        const state = Storage.getTimerState();
        if (!state) return;

        this.totalTime = state.totalTime || 0;
        this.exerciseName = state.exerciseName || '';
        this.setInfo = state.setInfo || '';
        this.currentExerciseId = state.currentExerciseId || null;

        if (this.elements.timerExerciseName) {
            this.elements.timerExerciseName.textContent = this.exerciseName || 'Descanso';
        }
        if (this.elements.timerSetInfo) {
            this.elements.timerSetInfo.textContent = this.setInfo || '';
        }

        if (state.running && state.endAt) {
            this.endAt = state.endAt;
            this.isRunning = true;
            this.timeRemaining = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
            this.elements.timerCircle.classList.remove('finished');
            this.elements.timerCircle.classList.add('running');
            this.updateDisplay();

            if (this.timeRemaining <= 0) {
                this.finish();
            } else {
                this.interval = setInterval(() => this.tick(), 1000);
            }
        } else {
            this.timeRemaining = state.remaining || 0;
            this.isRunning = false;
            this.endAt = null;
            this.updateDisplay();
        }
    },

    clearInterval_() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    playAlert() {
        AudioAlert.play();
    },

    onFinish(callback) {
        this.callbacks.onFinish = callback;
    },

    isActive() {
        return this.isRunning;
    }
};
