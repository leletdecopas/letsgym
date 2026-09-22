/* ============================================
   BODY MAP - SVG Interativo
   ============================================ */

const BodyMap = {
    container: null,
    activeMuscles: [],

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

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
    },

    setActive(muscles) {
        this.activeMuscles = muscles || [];
        this.updateHighlights();
    },

    render() {
        this.container.innerHTML = `
            <svg class="body-map-svg" viewBox="0 0 180 320" xmlns="http://www.w3.org/2000/svg">
                <!-- Frente -->
                <g transform="translate(10, 0)">
                    <!-- Cabeca -->
                    <ellipse cx="80" cy="22" rx="18" ry="20" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Pescoco -->
                    <rect x="73" y="40" width="14" height="10" rx="4" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Ombros -->
                    <path class="muscle" data-muscle="shoulders" d="M38 55 Q42 50 55 52 L73 55 L73 72 L48 76 Q35 72 38 55Z"/>
                    <path class="muscle" data-muscle="shoulders" d="M122 55 Q118 50 105 52 L87 55 L87 72 L112 76 Q125 72 122 55Z"/>

                    <!-- Peito -->
                    <path class="muscle" data-muscle="chest" d="M48 76 L73 72 L80 72 L80 108 L48 112 Q40 108 48 76Z"/>
                    <path class="muscle" data-muscle="chest" d="M112 76 L87 72 L80 72 L80 108 L112 112 Q120 108 112 76Z"/>

                    <!-- Bracos - Biceps -->
                    <path class="muscle" data-muscle="biceps" d="M48 76 L35 80 L28 115 L32 140 L45 140 L48 112Z"/>
                    <path class="muscle" data-muscle="biceps" d="M112 76 L125 80 L132 115 L128 140 L115 140 L112 112Z"/>

                    <!-- Bracos - Triceps -->
                    <path class="muscle" data-muscle="triceps" d="M32 140 L28 115 L24 145 L26 165 L42 165 L45 140Z"/>
                    <path class="muscle" data-muscle="triceps" d="M128 140 L132 115 L136 145 L134 165 L118 165 L115 140Z"/>

                    <!-- Maos -->
                    <ellipse cx="32" cy="175" rx="8" ry="11" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="128" cy="175" rx="8" ry="11" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Abdomen -->
                    <path class="muscle" data-muscle="abs" d="M48 112 L80 108 L80 165 L50 168 Q42 160 48 112Z"/>
                    <path class="muscle" data-muscle="abs" d="M112 112 L80 108 L80 165 L110 168 Q118 160 112 112Z"/>

                    <!-- Quadriceps -->
                    <path class="muscle" data-muscle="quadriceps" d="M50 168 L80 165 L76 235 L48 240 Q40 225 50 168Z"/>
                    <path class="muscle" data-muscle="quadriceps" d="M110 168 L80 165 L84 235 L112 240 Q120 225 110 168Z"/>

                    <!-- Joelhos -->
                    <ellipse cx="58" cy="248" rx="10" ry="8" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="102" cy="248" rx="10" ry="8" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Panturrilhas -->
                    <path class="muscle" data-muscle="calves" d="M48 253 L66 253 L64 290 L44 294 Q38 280 48 253Z"/>
                    <path class="muscle" data-muscle="calves" d="M112 253 L94 253 L96 290 L116 294 Q122 280 112 253Z"/>

                    <!-- Pes -->
                    <ellipse cx="54" cy="302" rx="12" ry="8" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="106" cy="302" rx="12" ry="8" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <text x="80" y="318" class="body-map-label">FRENTE</text>
                </g>

                <!-- Costas -->
                <g transform="translate(100, 0)">
                    <!-- Cabeca -->
                    <ellipse cx="80" cy="22" rx="18" ry="20" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Pescoco -->
                    <rect x="73" y="40" width="14" height="10" rx="4" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Ombros -->
                    <path class="muscle" data-muscle="shoulders" d="M38 55 Q42 50 55 52 L73 55 L73 72 L48 76 Q35 72 38 55Z"/>
                    <path class="muscle" data-muscle="shoulders" d="M122 55 Q118 50 105 52 L87 55 L87 72 L112 76 Q125 72 122 55Z"/>

                    <!-- Costas -->
                    <path class="muscle" data-muscle="back" d="M48 76 L73 72 L80 72 L80 155 L48 158 Q40 150 48 76Z"/>
                    <path class="muscle" data-muscle="back" d="M112 76 L87 72 L80 72 L80 155 L112 158 Q120 150 112 76Z"/>

                    <!-- Bracos -->
                    <path class="muscle" data-muscle="triceps" d="M48 76 L35 80 L28 115 L32 140 L45 140 L48 112Z"/>
                    <path class="muscle" data-muscle="triceps" d="M112 76 L125 80 L132 115 L128 140 L115 140 L112 112Z"/>

                    <!-- Bracos inferiores -->
                    <path class="muscle" data-muscle="biceps" d="M32 140 L28 115 L24 145 L26 165 L42 165 L45 140Z"/>
                    <path class="muscle" data-muscle="biceps" d="M128 140 L132 115 L136 145 L134 165 L118 165 L115 140Z"/>

                    <!-- Gluteos -->
                    <path class="muscle" data-muscle="glutes" d="M48 158 L80 155 L80 190 L48 193 Q40 185 48 158Z"/>
                    <path class="muscle" data-muscle="glutes" d="M112 158 L80 155 L80 190 L112 193 Q120 185 112 158Z"/>

                    <!-- Posterior -->
                    <path class="muscle" data-muscle="hamstrings" d="M48 193 L80 190 L76 235 L48 240 Q40 225 48 193Z"/>
                    <path class="muscle" data-muscle="hamstrings" d="M112 193 L80 190 L84 235 L112 240 Q120 225 112 193Z"/>

                    <!-- Panturrilhas -->
                    <path class="muscle" data-muscle="calves" d="M48 253 L66 253 L64 290 L44 294 Q38 280 48 253Z"/>
                    <path class="muscle" data-muscle="calves" d="M112 253 L94 253 L96 290 L116 294 Q122 280 112 253Z"/>

                    <text x="80" y="318" class="body-map-label">COSTAS</text>
                </g>
            </svg>
        `;

        this.updateHighlights();
    },

    updateHighlights() {
        if (!this.container) return;
        const muscleGroups = this.container.querySelectorAll('.muscle');
        muscleGroups.forEach(group => {
            const muscle = group.getAttribute('data-muscle');
            if (this.activeMuscles.includes(muscle)) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        });
    },

    getMuscleName(muscleId) {
        return this.muscleNames[muscleId] || muscleId;
    }
};
