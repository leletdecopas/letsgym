/* ============================================
   BODY MAP - SVG Interativo
   ============================================ */

const BodyMap = {
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

    mount(containerId, muscles = []) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = this.getSvgMarkup();
        this.setActive(containerId, muscles);
    },

    setActive(containerId, muscles) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const list = muscles || [];
        container.querySelectorAll('.muscle').forEach(group => {
            const muscle = group.getAttribute('data-muscle');
            group.classList.toggle('active', list.includes(muscle));
        });
    },

    getSvgMarkup() {
        return `
            <svg class="body-map-svg" viewBox="0 0 270 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa muscular da semana">
                <!-- FRENTE -->
                <g transform="translate(5, 0)">
                    <ellipse cx="80" cy="24" rx="16" ry="19" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <path d="M74 40v9c0 4 3 7 6 7s6-3 6-7v-9" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Ombros -->
                    <path class="muscle" data-muscle="shoulders" d="M47 60c3-8 11-13 21-12l6 4v20l-20 4c-9-1-13-8-7-16z"/>
                    <path class="muscle" data-muscle="shoulders" d="M113 60c-3-8-11-13-21-12l-6 4v20l20 4c9-1 13-8 7-16z"/>

                    <!-- Peito -->
                    <path class="muscle" data-muscle="chest" d="M53 76c7-4 15-6 21-5v6h6v34c-14 3-27 0-33-8-5-8-3-22 6-27z"/>
                    <path class="muscle" data-muscle="chest" d="M107 76c-7-4-15-6-21-5v6h-6v34c14 3 27 0 33-8 5-8 3-22-6-27z"/>

                    <!-- Biceps -->
                    <path class="muscle" data-muscle="biceps" d="M50 76c-8 3-14 12-17 24-2 10-2 22 1 32l14 2 5-28 4-24z"/>
                    <path class="muscle" data-muscle="biceps" d="M110 76c8 3 14 12 17 24 2 10 2 22-1 32l-14 2-5-28-4-24z"/>

                    <!-- Antebraos -->
                    <path d="M36 132c-3 10-4 22-2 32l2 10 12-2-1-40z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <path d="M124 132c3 10 4 22 2 32l-2 10-12-2 1-40z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Maos -->
                    <ellipse cx="40" cy="180" rx="7" ry="11" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="120" cy="180" rx="7" ry="11" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Abdomen -->
                    <path class="muscle" data-muscle="abs" d="M53 111h27v54c-13 3-24 2-30-4-5-6-3-38 3-50z"/>
                    <path class="muscle" data-muscle="abs" d="M107 111H80v54c13 3 24 2 30-4 5-6 3-38-3-50z"/>

                    <!-- Quadriceps -->
                    <path class="muscle" data-muscle="quadriceps" d="M53 165c9 3 19 4 27 4v2c-1 24-5 52-9 66l-24 4c-7-18-6-52 6-76z"/>
                    <path class="muscle" data-muscle="quadriceps" d="M107 165c-9 3-19 4-27 4v2c1 24 5 52 9 66l24 4c7-18 6-52-6-76z"/>

                    <!-- Joelhos -->
                    <ellipse cx="63" cy="246" rx="8" ry="7" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="97" cy="246" rx="8" ry="7" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Panturrilhas -->
                    <path class="muscle" data-muscle="calves" d="M51 252c6-1 12-1 17 0 1 12-2 28-5 40l-16 3c-4-12-2-31 4-43z"/>
                    <path class="muscle" data-muscle="calves" d="M109 252c-6-1-12-1-17 0-1 12 2 28 5 40l16 3c4-12 2-31-4-43z"/>

                    <!-- Pes -->
                    <path d="M50 294c6-2 12-2 16 0l1 8c-6 3-14 3-20 1l3-9z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <path d="M110 294c-6-2-12-2-16 0l-1 8c6 3 14 3 20 1l-3-9z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <text x="80" y="316" class="body-map-label">FRENTE</text>
                </g>

                <!-- COSTAS -->
                <g transform="translate(130, 0)">
                    <ellipse cx="80" cy="24" rx="16" ry="19" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <path d="M74 40v9c0 4 3 7 6 7s6-3 6-7v-9" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Ombros -->
                    <path class="muscle" data-muscle="shoulders" d="M47 60c3-8 11-13 21-12l6 4v20l-20 4c-9-1-13-8-7-16z"/>
                    <path class="muscle" data-muscle="shoulders" d="M113 60c-3-8-11-13-21-12l-6 4v20l20 4c9-1 13-8 7-16z"/>

                    <!-- Costas -->
                    <path class="muscle" data-muscle="back" d="M53 76c7-4 15-6 21-5v6h6v70c-16 3-32-2-38-12-6-12-3-52 11-59z"/>
                    <path class="muscle" data-muscle="back" d="M107 76c-7-4-15-6-21-5v6h-6v70c16 3 32-2 38-12 6-12 3-52-11-59z"/>

                    <!-- Triceps -->
                    <path class="muscle" data-muscle="triceps" d="M50 76c-8 3-14 12-17 24-2 10-2 22 1 32l14 2 5-28 4-24z"/>
                    <path class="muscle" data-muscle="triceps" d="M110 76c8 3 14 12 17 24 2 10 2 22-1 32l-14 2-5-28-4-24z"/>

                    <!-- Antebraos -->
                    <path d="M36 132c-3 10-4 22-2 32l2 10 12-2-1-40z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <path d="M124 132c3 10 4 22 2 32l-2 10-12-2 1-40z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Maos -->
                    <ellipse cx="40" cy="180" rx="7" ry="11" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="120" cy="180" rx="7" ry="11" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Gluteos -->
                    <path class="muscle" data-muscle="glutes" d="M53 150c8 3 18 5 27 5v4c-1 12-4 24-8 32l-22 3c-6-12-6-33 3-44z"/>
                    <path class="muscle" data-muscle="glutes" d="M107 150c-8 3-18 5-27 5v4c1 12 4 24 8 32l22 3c6-12 6-33-3-44z"/>

                    <!-- Posterior -->
                    <path class="muscle" data-muscle="hamstrings" d="M53 194c7 2 15 3 22 3l5 1c-1 20-5 44-8 58l-24 4c-6-16-5-46 5-66z"/>
                    <path class="muscle" data-muscle="hamstrings" d="M107 194c-7 2-15 3-22 3l-5 1c1 20 5 44 8 58l24 4c6-16 5-46-5-66z"/>

                    <!-- Joelhos -->
                    <ellipse cx="66" cy="264" rx="7" ry="6" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <ellipse cx="94" cy="264" rx="7" ry="6" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <!-- Panturrilhas -->
                    <path class="muscle" data-muscle="calves" d="M52 268c5-1 11-1 15 0 2 10 1 22-2 32l-14 2c-4-10-4-25 1-34z"/>
                    <path class="muscle" data-muscle="calves" d="M108 268c-5-1-11-1-15 0-2 10-1 22 2 32l14 2c4-10 4-25-1-34z"/>

                    <!-- Pes -->
                    <path d="M52 300c5-2 11-2 15 0l1 7c-5 3-13 3-18 1l2-8z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>
                    <path d="M108 300c-5-2-11-2-15 0l-1 7c5 3 13 3 18 1l-2-8z" fill="#12121A" stroke="#2A2A35" stroke-width="1"/>

                    <text x="80" y="316" class="body-map-label">COSTAS</text>
                </g>
            </svg>
        `;
    },

    getMuscleName(muscleId) {
        return this.muscleNames[muscleId] || muscleId;
    }
};
