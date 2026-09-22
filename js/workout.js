/* ============================================
   WORKOUT - Gerenciamento de treinos (Estilo Hevy)
   ============================================ */

const Workout = {
    currentWorkoutId: null,
    editingExerciseId: null,
    editingWorkoutId: null,
    activeTimerExerciseId: null,

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
            return;
        }

        container.innerHTML = exercises.map(exercise => this.renderExerciseCard(exercise)).join('');
    },

    renderExerciseCard(exercise) {
        const completedCount = exercise.sets.filter(s => s.completed).length;
        const totalCount = exercise.sets.length;

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
                        <span class="exercise-muscle-tag">${this.muscleNames[exercise.muscle] || exercise.muscle}</span>
                    </div>
                    <div class="exercise-progress">
                        <span class="progress-text">${completedCount}/${totalCount}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${totalCount > 0 ? (completedCount / totalCount * 100) : 0}%"></div>
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

    toggleSet(exerciseId, setId, checked) {
        const result = Storage.toggleSet(this.currentWorkoutId, exerciseId, setId);
        if (!result) return;

        const { exercise, set } = result;

        // Update UI
        this.renderExercises();
        BodyMap.setActive('body-map-container', this.getWorkoutMuscles(this.currentWorkoutId));

        // Start timer if set was completed
        if (set.completed) {
            this.startInlineTimer(exercise, set);
        } else {
            this.stopInlineTimer(exerciseId);
        }
    },

    startInlineTimer(exercise, set) {
        const timerContainer = document.getElementById(`timer-inline-${exercise.id}`);
        if (!timerContainer) return;

        this.activeTimerExerciseId = exercise.id;
        const restTime = exercise.restTime || 90;
        const completedSets = exercise.sets.filter(s => s.completed).length;
        const totalSets = exercise.sets.length;

        timerContainer.innerHTML = `
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
                <div class="timer-inline-countdown" id="timer-countdown-${exercise.id}">${this.formatTime(restTime)}</div>
                <button class="timer-inline-minimize" onclick="Workout.minimizeTimer('${exercise.id}')" title="Minimizar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>
        `;
        timerContainer.classList.remove('hidden');

        // Start countdown
        this.startTimerCountdown(exercise.id, restTime);
    },

    startTimerCountdown(exerciseId, seconds) {
        let remaining = seconds;
        const countdownEl = document.getElementById(`timer-countdown-${exerciseId}`);

        // Clear any existing interval
        if (this[`timerInterval_${exerciseId}`]) {
            clearInterval(this[`timerInterval_${exerciseId}`]);
        }

        this[`timerInterval_${exerciseId}`] = setInterval(() => {
            remaining--;
            if (countdownEl) {
                countdownEl.textContent = this.formatTime(remaining);
            }

            if (remaining <= 0) {
                clearInterval(this[`timerInterval_${exerciseId}`]);
                this.onTimerComplete(exerciseId);
            }
        }, 1000);
    },

    onTimerComplete(exerciseId) {
        const timerContainer = document.getElementById(`timer-inline-${exerciseId}`);
        if (timerContainer) {
            const timerInline = timerContainer.querySelector('.timer-inline');
            if (timerInline) {
                timerInline.classList.add('completed');
            }
        }

        // Play alert sound
        this.playAlert();

        // Show toast
        App.showToast('Descanso finalizado! Proxima serie.');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.stopInlineTimer(exerciseId);
        }, 3000);
    },

    stopInlineTimer(exerciseId) {
        if (this[`timerInterval_${exerciseId}`]) {
            clearInterval(this[`timerInterval_${exerciseId}`]);
            delete this[`timerInterval_${exerciseId}`];
        }

        const timerContainer = document.getElementById(`timer-inline-${exerciseId}`);
        if (timerContainer) {
            timerContainer.classList.add('hidden');
            timerContainer.innerHTML = '';
        }

        this.activeTimerExerciseId = null;
    },

    minimizeTimer(exerciseId) {
        this.stopInlineTimer(exerciseId);
        App.showToast('Timer minimizado');
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
            if (isNaN(value) || value < 0) value = currentValue;
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
        document.getElementById('finish-modal').classList.add('active');
    },

    hideFinishModal() {
        document.getElementById('finish-modal').classList.remove('active');
    },

    finishWorkout() {
        const exercises = Storage.getExercises(this.currentWorkoutId);
        const workouts = Storage.getWorkouts();
        const workout = workouts.find(w => w.id === this.currentWorkoutId);
        if (!workout) return;

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

        Storage.addHistoryEntry({
            workoutId: this.currentWorkoutId,
            workoutName: workout.name,
            muscles: muscles,
            exercises: historyExercises
        });

        // Reset all sets so the workout is fresh next time
        Storage.resetWorkoutSets(this.currentWorkoutId);

        this.hideFinishModal();
        this.showCompleteScreen(workout.name, muscles);
    },

    showCompleteScreen(workoutName, muscles) {
        document.getElementById('complete-workout-name').textContent = workoutName;

        const musclesList = document.getElementById('complete-muscles-list');
        musclesList.innerHTML = muscles.map(m =>
            `<span class="muscle-tag">${this.muscleNames[m] || m}</span>`
        ).join('');

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

    getActiveMusclesForToday() {
        const history = Storage.getHistory();
        const today = new Date().toDateString();

        const todayEntries = history.filter(entry => {
            const entryDate = new Date(entry.date).toDateString();
            return entryDate === today;
        });

        const muscles = new Set();
        todayEntries.forEach(entry => {
            if (entry.muscles) {
                entry.muscles.forEach(m => muscles.add(m));
            }
        });

        return Array.from(muscles);
    }
};
