/* ============================================
   BODY MAP - SVG Interativo
   Figura anatomica frente + costas com grupos
   musculares detalhados (data-muscle).
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
        const MIRROR = 'transform="matrix(-1 0 0 1 140 0)"';

        return `
            <svg class="body-map-svg" viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa muscular da semana">

                <!-- ============ FRENTE ============ -->
                <g transform="translate(8, 4)">

                    <!-- Base: cabeca, pescoco, tronco, bracos, pernas -->
                    <ellipse class="bm-base" cx="70" cy="22" rx="14" ry="17"/>
                    <path class="bm-base" d="M62 36 v12 c0 5 3 8 8 8 s8-3 8-8 v-12 z"/>
                    <path class="bm-base" d="M47 61 C43 70 41 84 42 99 C43 117 45 135 48 151 C50 164 51 173 51 181 L89 181 C89 173 90 164 92 151 C95 135 97 117 98 99 C99 84 97 70 93 61 C87 55 79 53 70 53 C61 53 53 55 47 61 Z"/>
                    <path class="bm-base" id="f-forearm-l" d="M36 141 C33 152 32 165 34 177 C35 183 38 187 42 188 L46 187 L47 142 Z"/>
                    <use href="#f-forearm-l" ${MIRROR}/>
                    <ellipse class="bm-base" id="f-hand-l" cx="40" cy="197" rx="6.5" ry="10"/>
                    <use href="#f-hand-l" ${MIRROR}/>
                    <ellipse class="bm-base" id="f-knee-l" cx="60" cy="255" rx="8" ry="7"/>
                    <use href="#f-knee-l" ${MIRROR}/>
                    <path class="bm-base" id="f-foot-l" d="M55 313 C50 314 46 317 45 321 C44 324 47 326 52 326 L63 326 L64 314 Z"/>
                    <use href="#f-foot-l" ${MIRROR}/>

                    <!-- Ombros -->
                    <g class="muscle" data-muscle="shoulders">
                        <path id="f-delt-l" d="M55 56 C46 58 38 66 35 76 C33 84 36 92 44 96 L56 90 L58 60 Z"/>
                        <use href="#f-delt-l" ${MIRROR}/>
                        <path class="muscle-detail" id="f-delt-d" d="M44 64 C40 71 38 79 39 87"/>
                        <use href="#f-delt-d" ${MIRROR}/>
                    </g>

                    <!-- Peito -->
                    <g class="muscle" data-muscle="chest">
                        <path id="f-chest-l" d="M69 63 C60 60 51 63 47 71 C44 80 45 92 53 98 C59 102 66 103 70 102 Z"/>
                        <use href="#f-chest-l" ${MIRROR}/>
                        <path class="muscle-detail" d="M70 64 V101"/>
                        <path class="muscle-detail" id="f-chest-d" d="M49 80 C56 77 63 76 69 76"/>
                        <use href="#f-chest-d" ${MIRROR}/>
                    </g>

                    <!-- Biceps -->
                    <g class="muscle" data-muscle="biceps">
                        <path id="f-bic-l" d="M46 94 C40 96 34 103 32 113 C30 124 32 135 36 141 L45 139 L46 96 Z"/>
                        <use href="#f-bic-l" ${MIRROR}/>
                        <path class="muscle-detail" id="f-bic-d" d="M39 100 C35 112 35 127 38 137"/>
                        <use href="#f-bic-d" ${MIRROR}/>
                    </g>

                    <!-- Abdomen -->
                    <g class="muscle" data-muscle="abs">
                        <path d="M55 100 C51 110 49 124 50 137 C51 149 54 158 60 163 C63 165 67 166 70 166 C73 166 77 165 80 163 C86 158 89 149 90 137 C91 124 89 110 85 100 C80 97 75 96 70 96 C65 96 60 97 55 100 Z"/>
                        <path class="muscle-detail" d="M70 97 V165"/>
                        <path class="muscle-detail" d="M54 112 C61 115 79 115 86 112"/>
                        <path class="muscle-detail" d="M53 128 C60 131 80 131 87 128"/>
                        <path class="muscle-detail" d="M54 144 C61 147 79 147 86 144"/>
                        <path class="muscle-detail" id="f-obl-d" d="M55 105 C52 115 52 127 54 137"/>
                        <use href="#f-obl-d" ${MIRROR}/>
                    </g>

                    <!-- Quadriceps -->
                    <g class="muscle" data-muscle="quadriceps">
                        <path id="f-quad-l" d="M70 163 C58 163 50 167 47 176 C44 188 46 207 49 222 C51 233 53 241 55 247 L65 247 L70 168 Z"/>
                        <use href="#f-quad-l" ${MIRROR}/>
                        <path class="muscle-detail" id="f-quad-d1" d="M59 170 C56 190 57 214 59 242"/>
                        <use href="#f-quad-d1" ${MIRROR}/>
                        <path class="muscle-detail" id="f-quad-d2" d="M51 180 C49 198 51 216 55 234"/>
                        <use href="#f-quad-d2" ${MIRROR}/>
                        <path class="muscle-detail" id="f-quad-d3" d="M64 214 C63 226 62 236 61 245"/>
                        <use href="#f-quad-d3" ${MIRROR}/>
                    </g>

                    <!-- Panturrilhas (frente) -->
                    <g class="muscle" data-muscle="calves">
                        <path id="f-calf-l" d="M55 263 C52 274 52 292 54 304 L55 313 L63 312 L64 264 Z"/>
                        <use href="#f-calf-l" ${MIRROR}/>
                        <path class="muscle-detail" id="f-calf-d" d="M58 270 C56 284 56 298 57 308"/>
                        <use href="#f-calf-d" ${MIRROR}/>
                    </g>

                    <text x="70" y="352" class="body-map-label">FRENTE</text>
                </g>

                <!-- ============ COSTAS ============ -->
                <g transform="translate(152, 4)">

                    <!-- Base -->
                    <ellipse class="bm-base" cx="70" cy="22" rx="14" ry="17"/>
                    <path class="bm-base" d="M62 36 v12 c0 5 3 8 8 8 s8-3 8-8 v-12 z"/>
                    <path class="bm-base" d="M47 61 C43 70 41 84 42 99 C43 117 45 135 48 151 C50 164 51 173 51 181 L89 181 C89 173 90 164 92 151 C95 135 97 117 98 99 C99 84 97 70 93 61 C87 55 79 53 70 53 C61 53 53 55 47 61 Z"/>
                    <path class="bm-base" d="M47 174 C45 186 46 197 49 205 L91 205 C94 197 95 186 93 174 Z"/>
                    <path class="bm-base" id="b-forearm-l" d="M36 141 C33 152 32 165 34 177 C35 183 38 187 42 188 L46 187 L47 142 Z"/>
                    <use href="#b-forearm-l" ${MIRROR}/>
                    <ellipse class="bm-base" id="b-hand-l" cx="40" cy="197" rx="6.5" ry="10"/>
                    <use href="#b-hand-l" ${MIRROR}/>
                    <ellipse class="bm-base" id="b-knee-l" cx="60" cy="255" rx="8" ry="7"/>
                    <use href="#b-knee-l" ${MIRROR}/>
                    <path class="bm-base" id="b-foot-l" d="M55 313 C50 314 46 317 45 321 C44 324 47 326 52 326 L63 326 L64 314 Z"/>
                    <use href="#b-foot-l" ${MIRROR}/>

                    <!-- Ombros -->
                    <g class="muscle" data-muscle="shoulders">
                        <path id="b-delt-l" d="M55 56 C46 58 38 66 35 76 C33 84 36 92 44 96 L56 90 L58 60 Z"/>
                        <use href="#b-delt-l" ${MIRROR}/>
                        <path class="muscle-detail" id="b-delt-d" d="M44 64 C40 71 38 79 39 87"/>
                        <use href="#b-delt-d" ${MIRROR}/>
                    </g>

                    <!-- Costas (dorso) -->
                    <g class="muscle" data-muscle="back">
                        <path id="b-back-l" d="M69 55 C60 56 51 60 46 67 C43 72 42 80 44 90 C46 101 47 112 49 123 C51 135 53 146 57 155 L69 157 Z"/>
                        <use href="#b-back-l" ${MIRROR}/>
                        <path class="muscle-detail" d="M70 56 V156"/>
                        <path class="muscle-detail" id="b-back-d1" d="M45 85 C53 95 61 99 69 100"/>
                        <use href="#b-back-d1" ${MIRROR}/>
                        <path class="muscle-detail" id="b-back-d2" d="M52 72 C57 79 59 88 58 97"/>
                        <use href="#b-back-d2" ${MIRROR}/>
                        <path class="muscle-detail" id="b-back-d3" d="M51 126 C56 136 62 145 68 151"/>
                        <use href="#b-back-d3" ${MIRROR}/>
                    </g>

                    <!-- Triceps -->
                    <g class="muscle" data-muscle="triceps">
                        <path id="b-tric-l" d="M46 94 C40 96 34 103 32 113 C30 124 32 135 36 141 L45 139 L46 96 Z"/>
                        <use href="#b-tric-l" ${MIRROR}/>
                        <path class="muscle-detail" id="b-tric-d" d="M39 100 C35 112 35 127 38 137"/>
                        <use href="#b-tric-d" ${MIRROR}/>
                    </g>

                    <!-- Gluteos -->
                    <g class="muscle" data-muscle="glutes">
                        <path id="b-glut-l" d="M70 157 C61 155 53 157 49 164 C45 172 46 184 51 191 C56 198 63 201 70 202 Z"/>
                        <use href="#b-glut-l" ${MIRROR}/>
                        <path class="muscle-detail" d="M70 158 V201"/>
                        <path class="muscle-detail" id="b-glut-d" d="M52 174 C57 183 63 189 69 192"/>
                        <use href="#b-glut-d" ${MIRROR}/>
                    </g>

                    <!-- Posterior (hamstrings) -->
                    <g class="muscle" data-muscle="hamstrings">
                        <path id="b-ham-l" d="M70 203 C57 204 50 209 48 218 C45 230 47 241 49 249 L65 249 L70 208 Z"/>
                        <use href="#b-ham-l" ${MIRROR}/>
                        <path class="muscle-detail" id="b-ham-d1" d="M55 212 C52 226 52 238 54 247"/>
                        <use href="#b-ham-d1" ${MIRROR}/>
                        <path class="muscle-detail" id="b-ham-d2" d="M62 216 C61 228 60 238 60 247"/>
                        <use href="#b-ham-d2" ${MIRROR}/>
                    </g>

                    <!-- Panturrilhas (costas) -->
                    <g class="muscle" data-muscle="calves">
                        <path id="b-calf-l" d="M64 263 C57 264 52 268 51 276 C50 286 52 298 54 306 L55 312 L63 311 L64 268 Z"/>
                        <use href="#b-calf-l" ${MIRROR}/>
                        <path class="muscle-detail" id="b-calf-d1" d="M58 267 C56 278 56 292 57 304"/>
                        <use href="#b-calf-d1" ${MIRROR}/>
                        <path class="muscle-detail" id="b-calf-d2" d="M62 272 C61 282 61 292 62 302"/>
                        <use href="#b-calf-d2" ${MIRROR}/>
                    </g>

                    <text x="70" y="352" class="body-map-label">COSTAS</text>
                </g>
            </svg>
        `;
    },

    getMuscleName(muscleId) {
        return this.muscleNames[muscleId] || muscleId;
    }
};
