/* ============================================
   HISTORY - Historico de treinos
   ============================================ */

const History = {
    init() {
        document.getElementById('history-filter-workout').addEventListener('change', () => {
            this.render();
        });
    },

    show() {
        this.populateFilter();
        this.render();
        App.showScreen('history');
    },

    populateFilter() {
        const select = document.getElementById('history-filter-workout');
        const workouts = Storage.getWorkouts();

        select.innerHTML = '<option value="all">Todos os treinos</option>';
        workouts.forEach(workout => {
            select.innerHTML += `<option value="${workout.id}">${workout.name}</option>`;
        });
    },

    render() {
        const container = document.getElementById('history-list');
        const emptyState = document.getElementById('history-empty');
        const filter = document.getElementById('history-filter-workout').value;

        let history = Storage.getHistory();

        if (filter !== 'all') {
            history = history.filter(entry => entry.workoutId === filter);
        }

        if (history.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const muscleNames = {
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
        };

        container.innerHTML = history.map(entry => {
            const date = new Date(entry.date);
            const dateStr = this.formatDate(date);
            const muscles = (entry.muscles || []).map(m => muscleNames[m] || m);

            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <span class="history-item-workout">${entry.workoutName}</span>
                        <span class="history-item-date">${dateStr}</span>
                    </div>
                    ${muscles.length > 0 ? `
                        <div class="history-item-muscles">
                            ${muscles.map(m => `<span class="history-muscle-tag">${m}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="history-exercises">
                        ${(entry.exercises || []).map(ex => `
                            <div class="history-exercise-row">
                                <span class="history-exercise-name">${ex.name}</span>
                                <span class="history-exercise-weight">${this.formatSetInfo(ex)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    formatSetInfo(ex) {
        if (Array.isArray(ex.sets)) {
            const total = ex.sets.length;
            const reps = ex.sets[0] && ex.sets[0].targetReps != null ? ex.sets[0].targetReps : '-';
            const weights = ex.sets.map(s => s.weight).filter(w => w != null);
            if (weights.length === 0) return `${total}x${reps}`;
            const minW = Math.min(...weights);
            const maxW = Math.max(...weights);
            const weightStr = minW === maxW ? minW : `${minW}-${maxW}`;
            return `${total}x${reps} - ${weightStr}kg`;
        }
        // Legacy format
        if (typeof ex.sets === 'number') {
            const reps = ex.reps != null ? ex.reps : 12;
            const weight = ex.weight != null ? ex.weight : 0;
            return `${ex.sets}x${reps} - ${weight}kg`;
        }
        return '';
    },

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
};
