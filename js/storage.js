/* ============================================
   STORAGE - Persistencia em localStorage
   ============================================ */

const Storage = {
    KEYS: {
        WELCOMED: 'gymtracker_welcomed',
        WORKOUTS: 'gymtracker_workouts',
        EXERCISES: 'gymtracker_exercises',
        HISTORY: 'gymtracker_history',
        CURRENT_WORKOUT: 'gymtracker_current_workout'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    isWelcomed() {
        return this.get(this.KEYS.WELCOMED) === true;
    },

    setWelcomed() {
        this.set(this.KEYS.WELCOMED, true);
    },

    getDefaultWorkouts() {
        return [
            { id: 'workout_a', name: 'Treino A', subtitle: '' },
            { id: 'workout_b', name: 'Treino B', subtitle: '' },
            { id: 'workout_c', name: 'Treino C', subtitle: '' },
            { id: 'workout_d', name: 'Treino D', subtitle: '' },
            { id: 'workout_e', name: 'Treino E', subtitle: '' }
        ];
    },

    getWorkouts() {
        const workouts = this.get(this.KEYS.WORKOUTS);
        if (!workouts) {
            const defaults = this.getDefaultWorkouts();
            this.set(this.KEYS.WORKOUTS, defaults);
            return defaults;
        }
        return workouts;
    },

    saveWorkouts(workouts) {
        this.set(this.KEYS.WORKOUTS, workouts);
    },

    addWorkout(name, subtitle = '') {
        const workouts = this.getWorkouts();
        const workout = {
            id: 'workout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name,
            subtitle
        };
        workouts.push(workout);
        this.saveWorkouts(workouts);
        return workout;
    },

    deleteWorkout(workoutId) {
        const workouts = this.getWorkouts().filter(w => w.id !== workoutId);
        this.saveWorkouts(workouts);

        const allExercises = this.get(this.KEYS.EXERCISES) || {};
        delete allExercises[workoutId];
        this.set(this.KEYS.EXERCISES, allExercises);

        if (this.getCurrentWorkout() === workoutId) {
            this.clearCurrentWorkout();
        }
    },

    getExercises(workoutId) {
        const allExercises = this.get(this.KEYS.EXERCISES) || {};
        const exercises = allExercises[workoutId] || [];
        // Migrate old format to new format
        return exercises.map(ex => this.migrateExercise(ex));
    },

    migrateExercise(exercise) {
        // If exercise has old format (sets as number), migrate to new format
        if (exercise.sets && typeof exercise.sets === 'number') {
            const oldSets = exercise.sets;
            const oldReps = exercise.reps || 12;
            const oldWeight = exercise.weight || 0;
            const newSets = [];

            for (let i = 0; i < oldSets; i++) {
                newSets.push({
                    id: 'set_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
                    type: 'normal',
                    targetReps: oldReps,
                    weight: oldWeight,
                    completed: false,
                    completedAt: null
                });
            }

            return {
                ...exercise,
                sets: newSets
            };
        }
        // If exercise already has new format (sets as array)
        if (Array.isArray(exercise.sets)) {
            return exercise;
        }
        // Fallback
        return {
            ...exercise,
            sets: []
        };
    },

    saveExercises(workoutId, exercises) {
        const allExercises = this.get(this.KEYS.EXERCISES) || {};
        allExercises[workoutId] = exercises;
        this.set(this.KEYS.EXERCISES, allExercises);
    },

    addExercise(workoutId, exercise) {
        const exercises = this.getExercises(workoutId);
        exercise.id = 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Ensure sets is an array
        if (!exercise.sets || !Array.isArray(exercise.sets)) {
            const numSets = exercise.sets || 3;
            const reps = exercise.reps || 12;
            const weight = exercise.weight || 0;
            exercise.sets = [];

            for (let i = 0; i < numSets; i++) {
                exercise.sets.push({
                    id: 'set_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
                    type: 'normal',
                    targetReps: reps,
                    weight: weight,
                    completed: false,
                    completedAt: null
                });
            }
        }

        exercises.push(exercise);
        this.saveExercises(workoutId, exercises);
        return exercise;
    },

    updateExercise(workoutId, exerciseId, updatedExercise) {
        const exercises = this.getExercises(workoutId);
        const index = exercises.findIndex(e => e.id === exerciseId);
        if (index !== -1) {
            exercises[index] = { ...exercises[index], ...updatedExercise };
            this.saveExercises(workoutId, exercises);
            return exercises[index];
        }
        return null;
    },

    deleteExercise(workoutId, exerciseId) {
        const exercises = this.getExercises(workoutId);
        const filtered = exercises.filter(e => e.id !== exerciseId);
        this.saveExercises(workoutId, filtered);
    },

    toggleSet(workoutId, exerciseId, setId) {
        const exercises = this.getExercises(workoutId);
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return null;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return null;

        set.completed = !set.completed;
        set.completedAt = set.completed ? new Date().toISOString() : null;

        this.saveExercises(workoutId, exercises);
        return { exercise, set };
    },

    resetWorkoutSets(workoutId) {
        const exercises = this.getExercises(workoutId);
        exercises.forEach(ex => {
            (ex.sets || []).forEach(s => {
                s.completed = false;
                s.completedAt = null;
            });
        });
        this.saveExercises(workoutId, exercises);
    },

    addSet(workoutId, exerciseId) {
        const exercises = this.getExercises(workoutId);
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return null;

        // Clone last set values
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet = {
            id: 'set_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: 'normal',
            targetReps: lastSet ? lastSet.targetReps : 12,
            weight: lastSet ? lastSet.weight : 0,
            completed: false,
            completedAt: null
        };

        exercise.sets.push(newSet);
        this.saveExercises(workoutId, exercises);
        return exercise;
    },

    removeSet(workoutId, exerciseId, setId) {
        const exercises = this.getExercises(workoutId);
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return null;

        exercise.sets = exercise.sets.filter(s => s.id !== setId);
        this.saveExercises(workoutId, exercises);
        return exercise;
    },

    updateSet(workoutId, exerciseId, setId, updates) {
        const exercises = this.getExercises(workoutId);
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return null;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return null;

        Object.assign(set, updates);
        this.saveExercises(workoutId, exercises);
        return { exercise, set };
    },

    getHistory() {
        return this.get(this.KEYS.HISTORY) || [];
    },

    addHistoryEntry(entry) {
        const history = this.getHistory();
        entry.id = 'hist_' + Date.now();
        entry.date = new Date().toISOString();
        history.unshift(entry);
        this.set(this.KEYS.HISTORY, history);
        return entry;
    },

    clearHistory() {
        this.set(this.KEYS.HISTORY, []);
    },

    getExerciseMaxWeight(ex, onlyCompleted = true) {
        const toNumber = (w) => {
            const n = typeof w === 'number' ? w : parseFloat(w);
            return Number.isFinite(n) ? n : 0;
        };

        if (Array.isArray(ex.sets)) {
            let max = 0;
            ex.sets.forEach(s => {
                if (onlyCompleted && !s.completed) return;
                const w = toNumber(s.weight);
                if (w > max) max = w;
            });
            return max;
        }
        if (typeof ex.sets === 'number') {
            return toNumber(ex.weight);
        }
        return 0;
    },

    getBestWeight(exerciseName) {
        const name = String(exerciseName || '').toLowerCase().trim();
        let best = 0;
        this.getHistory().forEach(entry => {
            (entry.exercises || []).forEach(ex => {
                if (String(ex.name || '').toLowerCase().trim() !== name) return;
                const max = this.getExerciseMaxWeight(ex, false);
                if (max > best) best = max;
            });
        });
        return best;
    },

    getPRsForSession(exercises) {
        const prs = [];
        exercises.forEach(ex => {
            const current = this.getExerciseMaxWeight(ex, true);
            if (current <= 0) return;
            const previous = this.getBestWeight(ex.name);
            if (previous > 0 && current > previous) {
                prs.push({
                    name: ex.name,
                    weight: current,
                    previous,
                    delta: Math.round((current - previous) * 100) / 100
                });
            }
        });
        return prs;
    },

    setCurrentWorkout(workoutId) {
        this.set(this.KEYS.CURRENT_WORKOUT, workoutId);
    },

    getCurrentWorkout() {
        return this.get(this.KEYS.CURRENT_WORKOUT);
    },

    clearCurrentWorkout() {
        this.remove(this.KEYS.CURRENT_WORKOUT);
    }
};
