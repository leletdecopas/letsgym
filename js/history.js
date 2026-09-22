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

        const allHistory = Storage.getHistory();
        const prKeys = this.computePRKeys(allHistory);

        let history = allHistory;
        if (filter !== 'all') {
            history = allHistory.filter(entry => entry.workoutId === filter);
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
                            <div class="history-exercise-row ${prKeys.has(entry.id + ':' + ex.name) ? 'is-pr' : ''}">
                                <span class="history-exercise-name">
                                    ${prKeys.has(entry.id + ':' + ex.name) ? `
                                        <span class="pr-trophy pr-trophy-sm" title="Recorde pessoal nesta sessao">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"></path>
                                                <path d="M17 5h2a2 2 0 0 1 0 4h-2M7 5H5a2 2 0 0 0 0 4h2"></path>
                                            </svg>
                                        </span>
                                    ` : ''}
                                    ${ex.name}
                                </span>
                                <span class="history-exercise-weight">${this.formatSetInfo(ex)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    computePRKeys(history) {
        const keys = new Set();
        const bests = {};
        const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

        sorted.forEach(entry => {
            (entry.exercises || []).forEach(ex => {
                const max = Storage.getExerciseMaxWeight(ex, false);
                if (max <= 0) return;
                const nameKey = String(ex.name || '').toLowerCase().trim();
                const prev = bests[nameKey] || 0;
                if (prev > 0 && max > prev) {
                    keys.add(entry.id + ':' + ex.name);
                }
                if (max > prev) {
                    bests[nameKey] = max;
                }
            });
        });

        return keys;
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
