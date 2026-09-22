/* ============================================
   APP - Logica Principal
   ============================================ */

const App = {
    currentScreen: 'welcome',
    previousScreen: 'main',

    init() {
        Timer.init();
        Workout.init();
        History.init();
        BodyMap.mount('body-map-container');

        // Unlock audio on first user gesture (mobile requirement)
        const unlockAudio = () => {
            AudioAlert.ensure();
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        // Welcome button
        document.getElementById('btn-start').addEventListener('click', () => {
            this.startApp();
        });

        // Add workout button
        document.getElementById('btn-add-workout').addEventListener('click', () => {
            Workout.showCreateWorkoutModal();
        });

        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                this.navigateToTab(tab);
            });
        });

        // Timer back button
        document.getElementById('btn-back-timer').addEventListener('click', () => {
            Timer.stop();
            this.showScreen(this.previousScreen);
        });

        // Timer callback
        Timer.onFinish(() => {
            this.showToast('Descanso finalizado! Volte ao treino.');
        });

        // Check if welcomed
        if (Storage.isWelcomed()) {
            this.showScreen('main');
            this.renderWorkouts();
            this.updateBodyMap();
        } else {
            this.showScreen('welcome');
        }

        this.registerServiceWorker();
    },

    startApp() {
        Storage.setWelcomed();
        this.showScreen('main');
        this.renderWorkouts();
        this.updateBodyMap();
    },

    navigateToTab(tab) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-tab') === tab);
        });

        if (tab === 'timer') {
            this.previousScreen = 'main';
            this.showScreen('timer');
        } else if (tab === 'history') {
            History.show();
        } else {
            this.showScreen('main');
        }
    },

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
            window.scrollTo(0, 0);
        }

        // Show/hide bottom nav
        const nav = document.getElementById('bottom-nav');
        const noNavScreens = ['welcome', 'workout', 'timer', 'workout-complete'];
        if (noNavScreens.includes(screenName)) {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'flex';
        }

        // Update nav active state
        if (screenName === 'main' || screenName === 'history') {
            document.querySelectorAll('.nav-item').forEach(item => {
                const tab = item.getAttribute('data-tab');
                item.classList.toggle('active', tab === screenName);
            });
        }

        // Refresh data on main screen
        if (screenName === 'main') {
            this.renderWorkouts();
            this.updateBodyMap();
        }

        // Refresh history
        if (screenName === 'history') {
            History.render();
        }
    },

    renderWorkouts() {
        const container = document.getElementById('workouts-list');
        const workouts = Storage.getWorkouts();

        const muscleIcons = {
            chest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M6 8c0 0 2-2 6-2s6 2 6 2M6 16c0 0 2 2 6 2s6-2 6-2"/></svg>',
            back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 6 4 12s4 10 8 10 8-4 8-10S16 2 12 2z"/><path d="M12 2v20"/></svg>',
            shoulders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 8h4M16 8h4M6 16l-2 4M18 16l2 4"/></svg>',
            biceps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16c0-4 2-8 6-8h4c4 0 6 4 6 8"/></svg>',
            triceps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16c0-4 2-8 6-8h4c4 0 6 4 6 8"/><path d="M12 8v8"/></svg>',
            quadriceps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v16M16 4v16M8 12h8"/></svg>',
            hamstrings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v16M16 4v16M8 12h8"/></svg>',
            glutes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="4"/><circle cx="15" cy="12" r="4"/></svg>',
            abs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="4" width="8" height="16" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>',
            calves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v12c0 2 1 4 3 4s3-2 3-4V4"/></svg>'
        };

        // Default icon for workouts without exercises
        const defaultIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 10v4M20 10v4M6 8v8M18 8v8M2 11v2M22 11v2"/></svg>';

        container.innerHTML = workouts.map(workout => {
            const exercises = Storage.getExercises(workout.id);
            const exerciseCount = exercises.length;
            const workoutMuscles = Workout.getWorkoutMuscles(workout.id);
            const primaryMuscle = workoutMuscles[0];
            const icon = primaryMuscle ? (muscleIcons[primaryMuscle] || defaultIcon) : defaultIcon;
            const subtitle = workout.subtitle || (exerciseCount > 0 ? `${exerciseCount} exercicio${exerciseCount !== 1 ? 's' : ''}` : 'Toque para configurar');

            return `
                <div class="workout-card" onclick="Workout.openWorkout('${workout.id}')">
                    <div class="workout-card-icon">${icon}</div>
                    <div class="workout-card-info">
                        <div class="workout-card-name">${workout.name}</div>
                        <div class="workout-card-muscles">${subtitle}</div>
                    </div>
                    <div class="workout-card-meta">
                        <button class="workout-card-edit" onclick="event.stopPropagation(); Workout.showEditWorkoutModal('${workout.id}')" title="Editar treino">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <span class="workout-card-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateBodyMap() {
        const activeMuscles = Workout.getActiveMusclesForWeek();
        BodyMap.setActive('body-map-container', activeMuscles);
    },

    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
