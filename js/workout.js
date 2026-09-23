/* ============================================
   WORKOUT - Gerenciamento de treinos (Estilo Hevy)
   ============================================ */

const Workout = {
    currentWorkoutId: null,
    editingExerciseId: null,
    editingWorkoutId: null,
    restTimer: null,
    restInterval: null,

    muscleNames: {
        chest: 'Peito',
        back: 'Costas',
        shoulders: 'Ombros',
        biceps: 'Biceps',
        triceps: 'Triceps',
        quadriceps: 'Quadriceps',
        hamstrings: 'Posterior',
        glutes: 'Gluteos',
        abs: 'Abdomen',
        calves: 'Panturrilha'
    },

    setTypes: {
        warmup: { label: 'Warm Up', short: 'W', color: '#3B82F6' },
        normal: { label: 'Normal', short: 'N', color: '#6B7280' },
        failure: { label: 'Failure', short: 'F', color: '#EF4444' },
        dropset: { label: 'Drop Set', short: 'D', color: '#F97316' }
    },

    init() {
        document.getElementById('btn-back-main').addEventListener('click', () => {
            App.showScreen('main');
        });

        document.getElementById('btn-finish-workout').addEventListener('click', () => {
            this.showFinishModal();
        });

        document.getElementById('btn-add-exercise').addEventListener('click', () => {
            this.showExerciseModal();
        });

        document.getElementById('btn-close-modal').addEventListener('click', () => {
            this.hideExerciseModal();
        });
        document.getElementById('btn-cancel-exercise').addEventListener('click', () => {
            this.hideExerciseModal();
        });
        document.getElementById('btn-save-exercise').addEventListener('click', () => {
            this.saveExercise();
        });

        document.getElementById('btn-cancel-finish').addEventListener('click', () => {
            this.hideFinishModal();
        });
        document.getElementById('btn-confirm-finish').addEventListener('click', () => {
            this.finishWorkout();
        });

        document.getElementById('btn-back-complete').addEventListener('click', () => {
            App.showScreen('main');
        });

        document.getElementById('btn-close-edit-workout').addEventListener('click', () => {
            this.hideEditWorkoutModal();
        });
        document.getElementById('btn-cancel-edit-workout').addEventListener('click', () => {
            this.hideEditWorkoutModal();
        });
        document.getElementById('btn-save-edit-workout').addEventListener('click', () => {
            this.saveWorkoutEdit();
        });
        document.getElementById('btn-delete-workout').addEventListener('click', () => {
            this.deleteWorkout();
        });

        document.getElementById('exercise-modal').addEventListener('click', (e) => {
            if (e.target.id === 'exercise-modal') this.hideExerciseModal();
        });
        document.getElementById('finish-modal').addEventListener('click', (e) => {
            if (e.target.id === 'finish-modal') this.hideFinishModal();
        });
        document.getElementById('edit-workout-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-workout-modal') this.hideEditWorkoutModal();
        });

        // Recalcular descanso ao voltar ao app (timer nao congela em segundo plano)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.restTimer) this.syncRestTimer();
        });
        window.addEventListener('focus', () => {
            if (this.restTimer) this.syncRestTimer();
        });
    },

    openWorkout(workoutId) {
        this.currentWorkoutId = workoutId;
        Storage.setCurrentWorkout(workoutId);

        const workouts = Storage.getWorkouts();
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;

        document.getElementById('workout-title').textContent = workout.name;
        BodyMap.setActive('body-map-container', this.getWorkoutMuscles(workoutId));
        this.renderExercises();
        App.showScreen('workout');
    },

    getWorkoutMuscles(workoutId) {
        const exercises = Storage.getExercises(workoutId);
        const muscles = new Set();
        exercises.forEach(ex => {
            if (ex.muscle) muscles.add(ex.muscle);
        });
        return Array.from(muscles);
    },

    renderExercises() {
        const container = document.getElementById('exercises-list');
        const exercises = Storage.getExercises(this.currentWorkoutId);

        this.updateWorkoutProgress();

        if (exercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 3rem 1rem;">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <h3 class="empty-state-title">Nenhum exercicio</h3>
                    <p class="empty-state-text">Adicione exercicios para comecar!</p>
                </div>
            `;
            this.restoreRestTimer();
            return;
        }

        container.innerHTML = exercises.map((exercise, index) =>
            this.renderExerciseCard(exercise, index, exercises.length)
        ).join('');

        this.restoreRestTimer();
    },

    renderExerciseCard(exercise, index = 0, total = 1) {
        const prInfo = this.getExercisePR(exercise);

        const setsRows = exercise.sets.map((set, index) => {
            const typeInfo = this.setTypes[set.type] || this.setTypes.normal;
            return `
                <div class="set-row ${set.completed ? 'completed' : ''}" data-set-id="${set.id}">
                    <span class="set-number">${index + 1}</span>
                    <div class="set-reps" onclick="Workout.editSetField('${exercise.id}', '${set.id}', 'targetReps', this)">
                        ${set.targetReps}
                    </div>
                    <div class="set-weight" onclick="Workout.editSetField('${exercise.id}', '${set.id}', 'weight', this)">
                        ${set.weight}<span class="unit">kg</span>
                    </div>
                    <div class="set-type" onclick="Workout.cycleSetType('${exercise.id}', '${set.id}')" style="color: ${typeInfo.color}" title="${typeInfo.label}">
                        ${typeInfo.short}
                    </div>
                    <label class="set-checkbox" onclick="event.stopPropagation()">
                        <input type="checkbox" ${set.completed ? 'checked' : ''} onchange="Workout.toggleSet('${exercise.id}', '${set.id}', this.checked)">
                        <span class="checkmark"></span>
                    </label>
                </div>
            `;
        }).join('');

        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <div class="exercise-title-row">
                        <span class="exercise-name">${exercise.name}</span>
                        ${this.getTrophyHTML(prInfo)}
                        <span class="exercise-muscle-tag">${this.muscleNames[exercise.muscle] || exercise.muscle}</span>
                    </div>
                    <div class="exercise-progress">
                        <span class="progress-text">${prInfo.completedCount}/${prInfo.totalCount}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${prInfo.totalCount > 0 ? (prInfo.completedCount / prInfo.totalCount * 100) : 0}%"></div>
                        </div>
                    </div>
                </div>

                <div class="sets-header">
                    <span class="set-col">#</span>
                    <span class="set-col">Reps</span>
                    <span class="set-col">Peso</span>
                    <span class="set-col">Tipo</span>
                    <span class="set-col">OK</span>
                </div>

                <div class="sets-container">
                    ${setsRows}
                </div>

                <div class="exercise-add-set">
                    <button class="btn-add-set" onclick="Workout.addSet('${exercise.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Adicionar Serie
                    </button>
                </div>

                <div class="exercise-footer">
                    <div class="rest-time-display">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Descanso: ${exercise.restTime || 90}s</span>
                    </div>
                    <div class="exercise-actions-inline">
                        <button class="btn-icon-sm" onclick="Workout.moveExercise('${exercise.id}', -1)" title="Mover para cima" ${index === 0 ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                        </button>
                        <button class="btn-icon-sm" onclick="Workout.moveExercise('${exercise.id}', 1)" title="Mover para baixo" ${index === total - 1 ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <button class="btn-icon-sm" onclick="Workout.editExercise('${exercise.id}')" title="Editar exercicio">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon-sm btn-danger-sm" onclick="Workout.deleteExercise('${exercise.id}')" title="Excluir exercicio">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div id="timer-inline-${exercise.id}" class="timer-inline-container hidden"></div>
            </div>
        `;
    },

    getExercisePR(exercise) {
        const completedCount = exercise.sets.filter(s => s.completed).length;
        const totalCount = exercise.sets.length;
        const bestWeight = Storage.getExerciseMaxWeight(exercise, true);
        const previousBest = Storage.getBestWeight(exercise.name);
        const isPR = bestWeight > 0 && bestWeight > previousBest;
        const prDelta = isPR ? Math.round((bestWeight - previousBest) * 100) / 100 : 0;
        return { completedCount, totalCount, bestWeight, previousBest, isPR, prDelta };
    },

    getTrophyHTML(prInfo) {
        if (!prInfo.isPR) return '';
        const title = prInfo.previousBest > 0
            ? `Novo recorde! +${prInfo.prDelta}kg vs anterior`
            : `Primeiro recorde! ${prInfo.bestWeight}kg`;
        return `
            <span class="pr-trophy" title="${title}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"></path>
                    <path d="M17 5h2a2 2 0 0 1 0 4h-2M7 5H5a2 2 0 0 0 0 4h2"></path>
                </svg>
            </span>
        `;
    },

    updateWorkoutProgress() {
        const exercises = Storage.getExercises(this.currentWorkoutId);
        let done = 0;
        let total = 0;
        exercises.forEach(ex => {
            total += ex.sets.length;
            done += ex.sets.filter(s => s.completed).length;
        });

        const fill = document.getElementById('workout-progress-fill');
        const text = document.getElementById('workout-progress-text');
        if (fill) fill.style.width = (total > 0 ? (done / total * 100) : 0) + '%';
        if (text) text.textContent = `${done}/${total}`;
    },

    toggleSet(exerciseId, setId, checked) {
        const result = Storage.toggleSet(this.currentWorkoutId, exerciseId, setId);
        if (!result) return;

        const { exercise, set } = result;

        // Atualiza o card in-place para a barra animar e os timers nao sumirem
        const row = document.querySelector(`.set-row[data-set-id="${set.id}"]`);
        if (row) row.classList.toggle('completed', set.completed);

        const card = document.querySelector(`.exercise-card[data-exercise-id="${exercise.id}"]`);
        if (card) {
            const prInfo = this.getExercisePR(exercise);
            const textEl = card.querySelector('.progress-text');
            const fillEl = card.querySelector('.progress-fill');
            if (textEl) textEl.textContent = `${prInfo.completedCount}/${prInfo.totalCount}`;
            if (fillEl) fillEl.style.width = (prInfo.totalCount > 0 ? (prInfo.completedCount / prInfo.totalCount * 100) : 0) + '%';

            const titleRow = card.querySelector('.exercise-title-row');
            const tag = titleRow ? titleRow.querySelector('.exercise-muscle-tag') : null;
            const existingTrophy = titleRow ? titleRow.querySelector('.pr-trophy') : null;
            if (prInfo.isPR && !existingTrophy && tag) {
                tag.insertAdjacentHTML('beforebegin', this.getTrophyHTML(prInfo));
            } else if (!prInfo.isPR && existingTrophy) {
                existingTrophy.remove();
            }
        }

        this.updateWorkoutProgress();
        BodyMap.setActive('body-map-container', this.getWorkoutMuscles(this.currentWorkoutId));

        // Descanso por timestamp: continua em segundo plano e apos reload
        if (set.completed) {
            this.startRestTimer(exercise);
        } else if (this.restTimer && this.restTimer.exerciseId === exerciseId) {
            this.cancelRestTimer(false);
        }
    },

    startRestTimer(exercise) {
        const restTime = exercise.restTime || 90;
        this.restTimer = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            total: restTime,
            endAt: Date.now() + restTime * 1000
        };
        Storage.setRestTimerState(this.restTimer);
        this.ensureRestInterval();
        this.renderRestTimerUI();
    },

    ensureRestInterval() {
        if (this.restInterval) return;
        this.restInterval = setInterval(() => this.syncRestTimer(), 500);
    },

    clearRestInterval() {
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
    },

    syncRestTimer() {
        if (!this.restTimer) {
            this.clearRestInterval();
            return;
        }
        const remaining = Math.ceil((this.restTimer.endAt - Date.now()) / 1000);
        if (remaining <= 0) {
            this.completeRestTimer();
            return;
        }
        const el = document.getElementById(`timer-countdown-${this.restTimer.exerciseId}`);
        if (el) el.textContent = this.formatTime(remaining);
    },

    completeRestTimer() {
        const timer = this.restTimer;
        this.clearRestInterval();
        this.restTimer = null;
        Storage.clearRestTimerState();
        if (!timer) return;

        const timerContainer = document.getElementById(`timer-inline-${timer.exerciseId}`);
        if (timerContainer) {
            const timerInline = timerContainer.querySelector('.timer-inline');
            if (timerInline) timerInline.classList.add('completed');
        }

        this.playAlert();
        App.showToast('Descanso finalizado! Proxima serie.');

        setTimeout(() => {
            const container = document.getElementById(`timer-inline-${timer.exerciseId}`);
            if (container) {
                container.classList.add('hidden');
                container.innerHTML = '';
            }
        }, 3000);
    },

    cancelRestTimer(showToast = true) {
        const timer = this.restTimer;
        this.clearRestInterval();
        this.restTimer = null;
        Storage.clearRestTimerState();

        if (timer) {
            const container = document.getElementById(`timer-inline-${timer.exerciseId}`);
            if (container) {
                container.classList.add('hidden');
                container.innerHTML = '';
            }
        }
        if (showToast) App.showToast('Descanso cancelado');
    },

    restoreRestTimer() {
        if (!this.restTimer) {
            const state = Storage.getRestTimerState();
            if (state) this.restTimer = state;
        }
        if (!this.restTimer) return;

        const remaining = Math.ceil((this.restTimer.endAt - Date.now()) / 1000);
        if (remaining <= 0) {
            this.completeRestTimer();
        } else {
            this.ensureRestInterval();
            this.renderRestTimerUI();
        }
    },

    renderRestTimerUI() {
        if (!this.restTimer) return;

        const { exerciseId, total } = this.restTimer;
        const container = document.getElementById(`timer-inline-${exerciseId}`);
        if (!container) return;

        const exercises = Storage.getExercises(this.currentWorkoutId);
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const completedSets = exercise.sets.filter(s => s.completed).length;
        const totalSets = exercise.sets.length;
        const remaining = Math.max(0, Math.ceil((this.restTimer.endAt - Date.now()) / 1000));

        container.innerHTML = `
            <div class="timer-inline">
                <div class="timer-inline-info">
                    <div class="timer-inline-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div class="timer-inline-text">
                        <span class="timer-inline-exercise">${exercise.name}</span>
                        <span class="timer-inline-set">Serie ${completedSets}/${totalSets}</span>
                    </div>
                </div>
                <div class="timer-inline-countdown" id="timer-countdown-${exerciseId}">${this.formatTime(remaining)}</div>
                <button class="timer-inline-minimize" onclick="Workout.cancelRestTimer()" title="Cancelar descanso">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        container.classList.remove('hidden');
    },

    moveExercise(exerciseId, direction) {
        if (Storage.moveExercise(this.currentWorkoutId, exerciseId, direction)) {
            this.renderExercises();
        }
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    playAlert() {
        AudioAlert.play();
    },

    addSet(exerciseId) {
        Storage.addSet(this.currentWorkoutId, exerciseId);
        this.renderExercises();
        App.showToast('Serie adicionada');
    },

    removeSet(exerciseId, setId) {
        Storage.removeSet(this.currentWorkoutId, exerciseId, setId);
        this.renderExercises();
    },

    editSetField(exerciseId, setId, field, element) {
        const currentValue = element.textContent.trim().replace('kg', '').trim();
        const previousValue = parseFloat(currentValue);
        const input = document.createElement('input');
        input.type = 'number';
        input.value = currentValue;
        input.className = 'inline-edit-input';
        input.min = field === 'weight' ? '0' : '1';
        input.step = field === 'weight' ? '0.5' : '1';

        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const save = () => {
            let value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                value = Number.isFinite(previousValue) ? previousValue : 0;
            }
            Storage.updateSet(this.currentWorkoutId, exerciseId, setId, { [field]: value });
            this.renderExercises();
        };

        input.addEventListener('blur', save);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') save();
        });
    },

    cycleSetType(exerciseId, setId) {
        const exercises = Storage.getExercises(this.currentWorkoutId);
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        const types = ['normal', 'warmup', 'failure', 'dropset'];
        const currentIndex = types.indexOf(set.type);
        const nextIndex = (currentIndex + 1) % types.length;
        const newType = types[nextIndex];

        Storage.updateSet(this.currentWorkoutId, exerciseId, setId, { type: newType });
        this.renderExercises();
    },

    // Exercise Modal
    showExerciseModal(exerciseId = null) {
        this.editingExerciseId = exerciseId;
        const modal = document.getElementById('exercise-modal');
        const title = document.getElementById('modal-title');

        if (exerciseId) {
            title.textContent = 'Editar Exercicio';
            const exercises = Storage.getExercises(this.currentWorkoutId);
            const exercise = exercises.find(e => e.id === exerciseId);
            if (exercise) {
                document.getElementById('exercise-name').value = exercise.name;
                document.getElementById('exercise-muscle').value = exercise.muscle;
                document.getElementById('exercise-sets').value = exercise.sets ? exercise.sets.length : 3;
                document.getElementById('exercise-reps').value = exercise.sets && exercise.sets[0] ? exercise.sets[0].targetReps : 12;
                document.getElementById('exercise-weight').value = exercise.sets && exercise.sets[0] ? exercise.sets[0].weight : 0;
                document.getElementById('exercise-rest').value = exercise.restTime || 90;
            }
        } else {
            title.textContent = 'Adicionar Exercicio';
            document.getElementById('exercise-name').value = '';
            document.getElementById('exercise-muscle').value = 'chest';
            document.getElementById('exercise-sets').value = 3;
            document.getElementById('exercise-reps').value = 12;
            document.getElementById('exercise-weight').value = 0;
            document.getElementById('exercise-rest').value = 90;
        }

        modal.classList.add('active');
    },

    hideExerciseModal() {
        document.getElementById('exercise-modal').classList.remove('active');
        this.editingExerciseId = null;
    },

    saveExercise() {
        const name = document.getElementById('exercise-name').value.trim();
        const muscle = document.getElementById('exercise-muscle').value;
        const numSets = parseInt(document.getElementById('exercise-sets').value) || 3;
        const reps = parseInt(document.getElementById('exercise-reps').value) || 12;
        const weight = parseFloat(document.getElementById('exercise-weight').value) || 0;
        const restTime = parseInt(document.getElementById('exercise-rest').value) || 90;

        if (!name) {
            App.showToast('Digite o nome do exercicio');
            return;
        }

        if (this.editingExerciseId) {
            // Update existing exercise
            const exercises = Storage.getExercises(this.currentWorkoutId);
            const exercise = exercises.find(e => e.id === this.editingExerciseId);
            if (exercise) {
                // Update exercise properties but keep existing sets
                Storage.updateExercise(this.currentWorkoutId, this.editingExerciseId, {
                    name,
                    muscle,
                    restTime
                });
                App.showToast('Exercicio atualizado');
            }
        } else {
            // Create new exercise with sets
            const exerciseData = {
                name,
                muscle,
                restTime,
                sets: numSets // Will be converted to array by addExercise
            };

            // Store reps and weight temporarily for addExercise to use
            const tempExercise = { ...exerciseData, reps, weight };
            Storage.addExercise(this.currentWorkoutId, tempExercise);
            App.showToast('Exercicio adicionado');
        }

        this.hideExerciseModal();
        this.renderExercises();
        BodyMap.setActive('body-map-container', this.getWorkoutMuscles(this.currentWorkoutId));
    },

    editExercise(exerciseId) {
        this.showExerciseModal(exerciseId);
    },

    deleteExercise(exerciseId) {
        if (confirm('Tem certeza que deseja excluir este exercicio?')) {
            Storage.deleteExercise(this.currentWorkoutId, exerciseId);
            this.renderExercises();
            BodyMap.setActive('body-map-container', this.getWorkoutMuscles(this.currentWorkoutId));
            App.showToast('Exercicio removido');
        }
    },

    // Finish Workout
    showFinishModal() {
        const exercises = Storage.getExercises(this.currentWorkoutId);
        let total = 0;
        let done = 0;
        exercises.forEach(ex => {
            total += ex.sets.length;
            done += ex.sets.filter(s => s.completed).length;
        });
        const pending = total - done;

        const msgEl = document.getElementById('finish-modal-message');
        if (msgEl) {
            msgEl.textContent = pending > 0
                ? `Você ainda tem ${pending} series pendente${pending > 1 ? 's' : ''}, deseja finalizar mesmo assim?`
                : 'Os dados serao salvos no historico.';
        }
        document.getElementById('finish-modal').classList.add('active');
    },

    hideFinishModal() {
        document.getElementById('finish-modal').classList.remove('active');
    },

    finishWorkout() {
        if (!this.currentWorkoutId) {
            App.showToast('Nenhum treino em andamento');
            this.hideFinishModal();
            return;
        }

        const exercises = Storage.getExercises(this.currentWorkoutId);
        const workouts = Storage.getWorkouts();
        const workout = workouts.find(w => w.id === this.currentWorkoutId);
        if (!workout) {
            App.showToast('Treino nao encontrado');
            this.hideFinishModal();
            return;
        }

        const muscles = this.getWorkoutMuscles(this.currentWorkoutId);

        // Build history entry with set details
        const historyExercises = exercises.map(ex => ({
            name: ex.name,
            muscle: ex.muscle,
            sets: ex.sets.map(s => ({
                type: s.type,
                targetReps: s.targetReps,
                weight: s.weight,
                completed: s.completed
            }))
        }));

        const sessionPRs = Storage.getPRsForSession(exercises);

        Storage.addHistoryEntry({
            workoutId: this.currentWorkoutId,
            workoutName: workout.name,
            muscles: muscles,
            exercises: historyExercises
        });

        Storage.resetWorkoutSets(this.currentWorkoutId);
        Storage.clearCurrentWorkout();
        this.cancelRestTimer(false);
        Timer.reset();

        this.hideFinishModal();
        this.showCompleteScreen(workout.name, muscles, sessionPRs);
    },

    showCompleteScreen(workoutName, muscles, sessionPRs = []) {
        document.getElementById('complete-workout-name').textContent = workoutName;

        const musclesList = document.getElementById('complete-muscles-list');
        musclesList.innerHTML = muscles.map(m =>
            `<span class="muscle-tag">${this.muscleNames[m] || m}</span>`
        ).join('');

        const prContainer = document.getElementById('complete-prs');
        const prList = document.getElementById('complete-prs-list');
        if (sessionPRs.length > 0) {
            prList.innerHTML = sessionPRs.map(pr => `
                <div class="pr-item">
                    <svg class="pr-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"></path>
                        <path d="M17 5h2a2 2 0 0 1 0 4h-2M7 5H5a2 2 0 0 0 0 4h2"></path>
                    </svg>
                    <span class="pr-item-name">${pr.name}</span>
                    <span class="pr-item-weight">${pr.weight}kg ${pr.previous > 0 ? `<span class="pr-item-delta">+${pr.delta}kg</span>` : '<span class="pr-item-delta">novo!</span>'}</span>
                </div>
            `).join('');
            prContainer.classList.remove('hidden');
        } else {
            prContainer.classList.add('hidden');
            prList.innerHTML = '';
        }

        BodyMap.mount('complete-body-map-container', muscles);

        App.showScreen('workout-complete');
    },

    // Create / Edit Workout Modal
    showCreateWorkoutModal() {
        this.editingWorkoutId = null;
        document.getElementById('edit-workout-modal-title').textContent = 'Novo Treino';
        document.getElementById('edit-workout-name').value = '';
        document.getElementById('edit-workout-subtitle').value = '';
        document.getElementById('btn-delete-workout').classList.add('hidden');
        document.getElementById('edit-workout-modal').classList.add('active');
    },

    showEditWorkoutModal(workoutId) {
        this.editingWorkoutId = workoutId;
        const workouts = Storage.getWorkouts();
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;

        document.getElementById('edit-workout-modal-title').textContent = 'Editar Treino';
        document.getElementById('edit-workout-name').value = workout.name;
        document.getElementById('edit-workout-subtitle').value = workout.subtitle || '';
        document.getElementById('btn-delete-workout').classList.remove('hidden');
        document.getElementById('edit-workout-modal').classList.add('active');
    },

    hideEditWorkoutModal() {
        document.getElementById('edit-workout-modal').classList.remove('active');
        this.editingWorkoutId = null;
    },

    saveWorkoutEdit() {
        const name = document.getElementById('edit-workout-name').value.trim();
        const subtitle = document.getElementById('edit-workout-subtitle').value.trim();

        if (!name) {
            App.showToast('Digite o nome do treino');
            return;
        }

        if (!this.editingWorkoutId) {
            Storage.addWorkout(name, subtitle);
            App.showToast('Treino criado');
        } else {
            const workouts = Storage.getWorkouts();
            const workoutIndex = workouts.findIndex(w => w.id === this.editingWorkoutId);

            if (workoutIndex !== -1) {
                workouts[workoutIndex].name = name;
                workouts[workoutIndex].subtitle = subtitle;
                Storage.saveWorkouts(workouts);
                App.showToast('Treino atualizado');
            }
        }

        this.hideEditWorkoutModal();
        App.renderWorkouts();
    },

    deleteWorkout() {
        if (!this.editingWorkoutId) return;
        const workouts = Storage.getWorkouts();
        const workout = workouts.find(w => w.id === this.editingWorkoutId);
        if (!workout) return;

        if (!confirm(`Excluir "${workout.name}"? O historico sera mantido.`)) return;

        Storage.deleteWorkout(this.editingWorkoutId);
        this.hideEditWorkoutModal();
        App.renderWorkouts();
        App.showToast('Treino excluido');
    },

    getActiveMusclesForWeek() {
        const history = Storage.getHistory();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const weekEntries = history.filter(entry => {
            return new Date(entry.date).getTime() >= weekAgo;
        });

        const muscles = new Set();
        weekEntries.forEach(entry => {
            if (entry.muscles) {
                entry.muscles.forEach(m => muscles.add(m));
            }
        });

        return Array.from(muscles);
    }
};
