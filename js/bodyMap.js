/* ============================================
   BODY MAP - SVG Interativo
   Frente + costas com MuscleMap (MIT) paths.
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

    groupMap: {
        TRAPEZIUS: 'back',
        LATS: 'back',
        RHOMBOIDS: 'back',
        BACK_LOWER: 'back',
        CHEST: 'chest',
        SHOULDERS_FRONT: 'shoulders',
        SHOULDERS_SIDE: 'shoulders',
        SHOULDERS_REAR: 'shoulders',
        BICEPS: 'biceps',
        TRICEPS: 'triceps',
        CORE: 'abs',
        OBLIQUES: 'abs',
        QUADS: 'quadriceps',
        HAMSTRINGS: 'hamstrings',
        GLUTES: 'glutes',
        ABDUCTORS: 'glutes',
        CALVES: 'calves'
    },

    sex: null,
    activeMuscles: [],

    mount(containerId, muscles = []) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.sex = typeof Storage !== 'undefined' && Storage.getBodySex
            ? Storage.getBodySex()
            : 'male';
        this.activeMuscles = muscles || [];
        container.innerHTML = this.getSvgMarkup();
        this.applyActive(container);
    },

    setActive(containerId, muscles) {
        this.activeMuscles = muscles || [];
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!container.querySelector('svg')) {
            container.innerHTML = this.getSvgMarkup();
        }
        this.applyActive(container);
    },

    setSex(sex) {
        this.sex = sex === 'female' ? 'female' : 'male';
        if (typeof Storage !== 'undefined' && Storage.setBodySex) {
            Storage.setBodySex(this.sex);
        }
        document.querySelectorAll('#body-map-container, #complete-body-map-container')
            .forEach(el => {
                if (el.querySelector('svg')) {
                    el.innerHTML = this.getSvgMarkup();
                }
            });
        this.applyActive();
    },

    applyActive(root) {
        const roots = root
            ? [root]
            : Array.from(document.querySelectorAll('#body-map-container, #complete-body-map-container'));
        const list = this.activeMuscles || [];
        roots.forEach(container => {
            if (!container) return;
            container.querySelectorAll('[data-muscle]').forEach(el => {
                const muscle = el.getAttribute('data-muscle');
                el.classList.toggle('active', list.includes(muscle));
            });
        });
    },

    getSvgMarkup() {
        const sex = this.sex === 'female' ? 'female' : 'male';
        const front = typeof BodyPaths !== 'undefined' ? BodyPaths[sex + '-front'] : null;
        const back = typeof BodyPaths !== 'undefined' ? BodyPaths[sex + '-back'] : null;
        if (!front || !back) return '';

        const W = 1024;
        const H = 1536;
        const vb = `0 0 ${W * 2} ${H}`;

        return `
            <svg class="body-map-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa muscular da semana">
                <g class="body-map-view" transform="translate(0,0)">
                    ${this.renderView(front)}
                    <text x="${front.centerX}" y="${H - 30}" class="body-map-label">FRENTE</text>
                </g>
                <g class="body-map-view" transform="translate(${W},0)">
                    ${this.renderView(back)}
                    <text x="${back.centerX}" y="${H - 30}" class="body-map-label">COSTAS</text>
                </g>
            </svg>
        `;
    },

    renderView(diagram) {
        const outline = (diagram.outline || []).map(p => {
            return `<path class="bm-base" d="${p.d}"></path>`;
        }).join('');

        const muscles = (diagram.muscles || []).map(m => {
            const appGroup = this.groupMap[m.group];
            if (!appGroup) {
                return `<path class="muscle muscle-idle" d="${m.d}"></path>`;
            }
            return `<path class="muscle" data-muscle="${appGroup}" d="${m.d}"></path>`;
        }).join('');

        return outline + muscles;
    },

    getMuscleName(muscleId) {
        return this.muscleNames[muscleId] || muscleId;
    }
};
