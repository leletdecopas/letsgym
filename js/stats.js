/* ============================================
   STATS - Estatisticas, ofensiva e graficos
   ============================================ */

const Stats = {
    KCAL_PER_KG: 0.05,
    DAY_LETTERS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    DAY_NAMES: ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'],
    pendingGoal: null,

    init() {
        const select = document.getElementById('stats-exercise-select');
        if (select) {
            select.addEventListener('change', () => this.renderProgressChartFor(select.value));
        }

        const modal = document.getElementById('goal-modal');
        if (!modal) return;

        document.getElementById('btn-goal-minus').addEventListener('click', () => this.adjustGoal(-1));
        document.getElementById('btn-goal-plus').addEventListener('click', () => this.adjustGoal(1));
        document.getElementById('btn-goal-save').addEventListener('click', () => this.saveGoal());
        document.getElementById('btn-goal-cancel').addEventListener('click', () => this.hideGoalModal());
        document.getElementById('btn-goal-close').addEventListener('click', () => this.hideGoalModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideGoalModal();
        });
    },

    /* ---------- Datas (sempre fuso local) ---------- */

    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    getWeekRange(ref) {
        const start = this.startOfDay(ref || new Date());
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        return { start, end };
    },

    getMonthRange(ref) {
        const now = new Date(ref || new Date());
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start, end };
    },

    getEntriesIn(start, end) {
        const startTime = start.getTime();
        const endTime = end.getTime();
        return Storage.getHistory().filter(entry => {
            const t = new Date(entry.date).getTime();
            return Number.isFinite(t) && t >= startTime && t < endTime;
        });
    },

    toNumber(value) {
        const n = typeof value === 'number' ? value : parseFloat(value);
        return Number.isFinite(n) ? n : 0;
    },

    /* ---------- Calculos ---------- */

    getTrainedDaysThisWeek() {
        const { start, end } = this.getWeekRange();
        const days = new Set();
        this.getEntriesIn(start, end).forEach(entry => {
            days.add(new Date(entry.date).getDay());
        });
        return days;
    },

    countWorkouts(range) {
        return this.getEntriesIn(range.start, range.end).length;
    },

    countPRs(range) {
        const all = Storage.getHistory();
        if (!all.length || typeof History === 'undefined') return 0;

        const prKeys = History.computePRKeys(all);
        if (!prKeys || prKeys.size === 0) return 0;

        let count = 0;
        this.getEntriesIn(range.start, range.end).forEach(entry => {
            (entry.exercises || []).forEach(ex => {
                if (prKeys.has((entry.id || '') + ':' + ex.name)) count++;
            });
        });
        return count;
    },

    getMuscleCounts(days = 30) {
        const now = new Date();
        let from = this.startOfDay(now);
        from.setDate(from.getDate() - days);

        let entries = this.getEntriesIn(from, new Date(now.getTime() + 1000));
        if (!entries.length) entries = Storage.getHistory();

        const counts = {};
        entries.forEach(entry => {
            (entry.muscles || []).forEach(m => {
                if (!m) return;
                counts[m] = (counts[m] || 0) + 1;
            });
        });

        return Object.keys(counts)
            .map(key => ({
                key,
                count: counts[key],
                label: (typeof Workout !== 'undefined' && Workout.muscleNames[key]) || key
            }))
            .sort((a, b) => b.count - a.count);
    },

    getFavoriteMuscle() {
        const list = this.getMuscleCounts(30);
        return list.length ? list[0] : null;
    },

    estimateKcal(range) {
        let volume = 0;
        this.getEntriesIn(range.start, range.end).forEach(entry => {
            (entry.exercises || []).forEach(ex => {
                const sets = ex.sets || [];
                const done = sets.filter(s => s && s.completed);
                const use = done.length ? done : sets;
                use.forEach(s => {
                    const weight = this.toNumber(s.weight);
                    const reps = this.toNumber(s.targetReps);
                    if (weight > 0 && reps > 0) volume += weight * reps;
                });
            });
        });
        return { volume, kcal: volume * this.KCAL_PER_KG };
    },

    getWeeklyCounts(nWeeks = 12) {
        const all = Storage.getHistory();
        const current = this.getWeekRange();
        const result = [];

        for (let i = nWeeks - 1; i >= 0; i--) {
            const start = new Date(current.start);
            start.setDate(start.getDate() - i * 7);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const count = all.filter(entry => {
                const t = new Date(entry.date).getTime();
                return Number.isFinite(t) && t >= start.getTime() && t < end.getTime();
            }).length;

            result.push({
                label: `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`,
                count
            });
        }
        return result;
    },

    getExerciseNames() {
        const names = new Set();
        Storage.getHistory().forEach(entry => {
            (entry.exercises || []).forEach(ex => {
                if (ex && ex.name) names.add(ex.name);
            });
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    },

    getExerciseProgress(name) {
        const key = String(name || '').toLowerCase().trim();
        const entries = [...Storage.getHistory()].sort((a, b) => new Date(a.date) - new Date(b.date));
        const points = [];

        entries.forEach(entry => {
            let max = 0;
            (entry.exercises || []).forEach(ex => {
                if (String(ex.name || '').toLowerCase().trim() !== key) return;
                const weight = Storage.getExerciseMaxWeight(ex, true);
                if (weight > max) max = weight;
            });
            if (max > 0) points.push({ date: entry.date, weight: max });
        });
        return points;
    },

    /* ---------- Card de ofensiva ---------- */

    streakHTML() {
        const trained = this.getTrainedDaysThisWeek();
        const count = trained.size;
        const goal = Storage.getWeekGoal();
        const today = new Date().getDay();
        const pct = Math.round(count / 7 * 100);
        const goalPct = Math.round(goal / 7 * 100);

        let status;
        if (count >= goal) {
            status = 'Meta da semana batida!';
        } else {
            const missing = goal - count;
            status = `Faltam ${missing} dia${missing > 1 ? 's' : ''} para a meta`;
        }

        const days = this.DAY_LETTERS.map((letter, i) => {
            const classes = ['streak-day'];
            if (trained.has(i)) classes.push('trained');
            if (i === today) classes.push('today');
            return `<span class="${classes.join(' ')}" title="${this.DAY_NAMES[i]}">${letter}</span>`;
        }).join('');

        return `
            <div class="streak-head">
                <span class="streak-label">Ofensiva da semana</span>
                <button type="button" class="streak-goal" title="Editar meta semanal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
                    Meta: <span class="streak-goal-value">${goal}</span>x
                </button>
            </div>
            <div class="streak-body">
                <div class="streak-count"><span class="streak-count-value">${count}</span><span class="streak-count-total">/7</span></div>
                <div class="streak-info">
                    <span class="streak-status">${status}</span>
                    <span class="streak-range">Domingo a sabado</span>
                </div>
            </div>
            <div class="streak-days">${days}</div>
            <div class="streak-progress">
                <div class="streak-progress-fill" style="width: ${pct}%"></div>
                <div class="streak-progress-goal" style="left: ${goalPct}%"></div>
            </div>
        `;
    },

    renderStreaks() {
        document.querySelectorAll('[data-streak-card]').forEach(container => {
            container.innerHTML = this.streakHTML();
            const btn = container.querySelector('.streak-goal');
            if (btn) btn.addEventListener('click', () => this.showGoalModal());
        });
    },

    renderCompleteWeek() {
        const container = document.getElementById('complete-week-days');
        if (!container) return;

        const trained = this.getTrainedDaysThisWeek();
        const today = new Date().getDay();

        container.innerHTML = this.DAY_LETTERS.map((letter, i) => {
            const classes = ['complete-week-day'];
            if (trained.has(i)) classes.push('trained');
            if (i === today) classes.push('today');
            return `<span class="${classes.join(' ')}" title="${this.DAY_NAMES[i]}">${letter}</span>`;
        }).join('');

        const countEl = document.getElementById('complete-week-count');
        if (countEl) {
            countEl.textContent = `${trained.size} de 7 dias treinados nesta semana`;
        }
    },

    /* ---------- Modal de meta ---------- */

    showGoalModal() {
        this.pendingGoal = Storage.getWeekGoal();
        this.updateGoalModal();
        const modal = document.getElementById('goal-modal');
        if (modal) modal.classList.add('active');
    },

    hideGoalModal() {
        const modal = document.getElementById('goal-modal');
        if (modal) modal.classList.remove('active');
    },

    adjustGoal(delta) {
        const next = (this.pendingGoal || 1) + delta;
        this.pendingGoal = Math.min(7, Math.max(1, next));
        this.updateGoalModal();
    },

    updateGoalModal() {
        const value = document.getElementById('goal-modal-value');
        if (value) value.textContent = this.pendingGoal;
    },

    saveGoal() {
        if (Storage.setWeekGoal(this.pendingGoal)) {
            this.hideGoalModal();
            this.renderStreaks();
            if (typeof App !== 'undefined') App.showToast('Meta da semana atualizada');
        }
    },

    /* ---------- Aba Estatisticas ---------- */

    renderStats() {
        const kpis = document.getElementById('stats-kpis');
        if (!kpis) return;

        const history = Storage.getHistory();
        const weekRange = this.getWeekRange();
        const monthRange = this.getMonthRange();
        const favorite = this.getFavoriteMuscle();
        const { kcal } = this.estimateKcal(monthRange);

        const items = [
            { value: history.length, label: 'Total de treinos' },
            { value: this.countWorkouts(monthRange), label: 'Treinos no mes' },
            { value: this.countWorkouts(weekRange), label: 'Treinos na semana' },
            { value: this.countPRs(monthRange), label: 'Recordes no mes' },
            { value: favorite ? favorite.label : '-', label: 'Musculo favorito', text: true },
            { value: history.length ? `~${this.formatKcal(kcal)}` : '-', label: 'Kcal no mes (estim.)', text: true }
        ];

        kpis.innerHTML = items.map(item => `
            <div class="exercise-stat">
                <div class="exercise-stat-value${item.text ? ' stat-text' : ''}">${item.value}</div>
                <div class="exercise-stat-label">${item.label}</div>
            </div>
        `).join('');

        this.renderWeeklyChart();
        this.renderProgressChart();
        this.renderMuscleBars();
        this.renderStreaks();
    },

    formatKcal(value) {
        const rounded = Math.max(0, Math.round(value / 5) * 5);
        return rounded.toLocaleString('pt-BR');
    },

    renderWeeklyChart() {
        const container = document.getElementById('stats-weekly-chart');
        if (!container) return;

        const data = this.getWeeklyCounts(12);
        const total = data.reduce((sum, d) => sum + d.count, 0);

        if (total === 0) {
            container.innerHTML = '<div class="chart-empty">Nenhum treino registrado ainda</div>';
            return;
        }
        container.innerHTML = this.barChartSVG(data);
    },

    barChartSVG(data) {
        const W = 300, H = 150, padTop = 16, padBottom = 26;
        const n = data.length;
        const gap = n > 8 ? 3 : 6;
        const barW = (W - gap * (n - 1)) / n;
        const areaH = H - padTop - padBottom;
        const max = Math.max(1, ...data.map(d => d.count));

        const bars = data.map((d, i) => {
            const h = d.count > 0 ? Math.max(4, Math.round(d.count / max * areaH)) : 2;
            const x = i * (barW + gap);
            const y = padTop + areaH - h;
            const highlight = i === n - 1 ? ' bar-current' : '';
            const value = d.count > 0
                ? `<text class="chart-value" x="${(x + barW / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}">${d.count}</text>`
                : '';
            const label = (n <= 8 || i % 2 === 1 || i === 0)
                ? `<text class="chart-label" x="${(x + barW / 2).toFixed(1)}" y="${H - 8}">${d.label}</text>`
                : '';
            return `
                <rect class="bar${highlight}" x="${x.toFixed(1)}" y="${y}" width="${barW.toFixed(1)}" height="${h}" rx="2"></rect>
                ${value}${label}`;
        }).join('');

        const baseline = padTop + areaH;
        return `
            <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Treinos por semana">
                <line class="chart-grid" x1="0" y1="${baseline}" x2="${W}" y2="${baseline}"></line>
                ${bars}
            </svg>`;
    },

    renderProgressChart() {
        const select = document.getElementById('stats-exercise-select');
        const container = document.getElementById('stats-progress-chart');
        if (!select || !container) return;

        const names = this.getExerciseNames();
        if (!names.length) {
            select.innerHTML = '<option>Sem exercicios</option>';
            select.disabled = true;
            container.innerHTML = '<div class="chart-empty">Nenhum treino registrado ainda</div>';
            return;
        }

        const previous = select.value;
        select.disabled = false;
        select.innerHTML = names.map(name =>
            `<option value="${name}">${name}</option>`
        ).join('');
        if (names.includes(previous)) select.value = previous;

        this.renderProgressChartFor(select.value);
    },

    renderProgressChartFor(name) {
        const container = document.getElementById('stats-progress-chart');
        if (!container) return;

        const points = this.getExerciseProgress(name);
        if (!points.length) {
            container.innerHTML = '<div class="chart-empty">Sem dados de carga para este exercicio</div>';
            return;
        }
        container.innerHTML = this.lineChartSVG(points);
    },

    lineChartSVG(points) {
        const W = 300, H = 150;
        const padLeft = 32, padRight = 10, padTop = 14, padBottom = 26;
        const innerW = W - padLeft - padRight;
        const innerH = H - padTop - padBottom;

        const values = points.map(p => p.weight);
        let min = Math.min(...values);
        let max = Math.max(...values);
        if (min === max) {
            min = Math.max(0, min - 10);
            max = max + 5;
        } else {
            const margin = (max - min) * 0.15;
            min = Math.max(0, min - margin);
            max = max + margin;
        }

        const xAt = i => points.length === 1
            ? padLeft + innerW / 2
            : padLeft + (i / (points.length - 1)) * innerW;
        const yAt = value => padTop + innerH - ((value - min) / (max - min)) * innerH;

        const coords = points.map((p, i) => ({
            x: xAt(i),
            y: yAt(p.weight),
            weight: p.weight,
            date: new Date(p.date)
        }));

        const path = coords.map((c, i) =>
            `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`
        ).join(' ');

        const dots = coords.map(c =>
            `<circle class="chart-dot" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3"></circle>`
        ).join('');

        const first = coords[0];
        const last = coords[coords.length - 1];
        const fmtDate = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

        const gridLines = [max, (max + min) / 2, min].map(value => {
            const y = yAt(value);
            return `
                <line class="chart-grid" x1="${padLeft}" y1="${y.toFixed(1)}" x2="${W - padRight}" y2="${y.toFixed(1)}"></line>
                <text class="chart-label" x="0" y="${(y + 3).toFixed(1)}">${Math.round(value)}</text>`;
        }).join('');

        const delta = last.weight - first.weight;
        const deltaLabel = points.length > 1
            ? `<text class="chart-delta" x="${W - padRight}" y="${H - 8}" text-anchor="end">${delta >= 0 ? '+' : ''}${Math.round(delta * 10) / 10}kg</text>`
            : '';

        return `
            <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progressao de carga">
                ${gridLines}
                <path class="chart-line" d="${path}"></path>
                ${dots}
                <text class="chart-label" x="${padLeft}" y="${H - 8}">${fmtDate(first.date)}</text>
                ${coords.length > 1 ? `<text class="chart-label" x="${W - padRight}" y="${H - 8}" text-anchor="end">${fmtDate(last.date)}</text>` : ''}
                ${deltaLabel}
            </svg>`;
    },

    renderMuscleBars() {
        const container = document.getElementById('stats-muscle-bars');
        if (!container) return;

        const list = this.getMuscleCounts(30).slice(0, 6);
        if (!list.length) {
            container.innerHTML = '<div class="chart-empty">Nenhum treino registrado ainda</div>';
            return;
        }

        const max = Math.max(...list.map(item => item.count));
        container.innerHTML = list.map(item => `
            <div class="muscle-bar-row">
                <span class="muscle-bar-label">${item.label}</span>
                <div class="muscle-bar-track">
                    <div class="muscle-bar-fill" style="width: ${Math.round(item.count / max * 100)}%"></div>
                </div>
                <span class="muscle-bar-count">${item.count}</span>
            </div>
        `).join('');
    }
};
