/* ============================================
   EXERCISE CATALOG - Lista embutida de exercicios
   Sugestoes para o campo de nome no modal de exercicio.
   muscle: chest | back | shoulders | biceps | triceps |
           quadriceps | hamstrings | glutes | abs | calves
   ============================================ */

const ExerciseCatalog = [
    // Peito
    { name: 'Supino Reto', muscle: 'chest' },
    { name: 'Supino Reto com Halteres', muscle: 'chest' },
    { name: 'Supino Inclinado', muscle: 'chest' },
    { name: 'Supino Inclinado com Halteres', muscle: 'chest' },
    { name: 'Supino Declinado', muscle: 'chest' },
    { name: 'Supino Close', muscle: 'chest' },
    { name: 'Supino na Máquina', muscle: 'chest' },
    { name: 'Crucifixo', muscle: 'chest' },
    { name: 'Crucifixo Inclinado', muscle: 'chest' },
    { name: 'Crucifixo com Cabo', muscle: 'chest' },
    { name: 'Peck Deck', muscle: 'chest' },
    { name: 'Flexão de Braço', muscle: 'chest' },
    { name: 'Pullover com Barra', muscle: 'chest' },
    { name: 'Pullover na Máquina', muscle: 'chest' },

    // Costas
    { name: 'Remada Curvada', muscle: 'back' },
    { name: 'Remada com Halteres', muscle: 'back' },
    { name: 'Remada Unilateral', muscle: 'back' },
    { name: 'Remada Sentada na Polia', muscle: 'back' },
    { name: 'Remada na Máquina', muscle: 'back' },
    { name: 'Puxada Frontal', muscle: 'back' },
    { name: 'Puxada Aberta', muscle: 'back' },
    { name: 'Puxada com Triângulo', muscle: 'back' },
    { name: 'Barra Fixa', muscle: 'back' },
    { name: 'Barra Fixa com Peso', muscle: 'back' },
    { name: 'Levantamento Terra', muscle: 'back' },
    { name: 'Encolhimento de Ombros', muscle: 'back' },
    { name: 'Remada Cavalinho', muscle: 'back' },

    // Ombros
    { name: 'Desenvolvimento com Barra', muscle: 'shoulders' },
    { name: 'Desenvolvimento com Halteres', muscle: 'shoulders' },
    { name: 'Desenvolvimento na Máquina', muscle: 'shoulders' },
    { name: 'Desenvolvimento Arnold', muscle: 'shoulders' },
    { name: 'Elevação Lateral', muscle: 'shoulders' },
    { name: 'Elevação Frontal', muscle: 'shoulders' },
    { name: 'Elevação Posterior', muscle: 'shoulders' },
    { name: 'Remada Vertical', muscle: 'shoulders' },
    { name: 'Crucifixo Inverso', muscle: 'shoulders' },
    { name: 'Elevação Lateral na Polia', muscle: 'shoulders' },

    // Biceps
    { name: 'Rosca Direta', muscle: 'biceps' },
    { name: 'Rosca com Halteres', muscle: 'biceps' },
    { name: 'Rosca Alternada', muscle: 'biceps' },
    { name: 'Rosca Martelo', muscle: 'biceps' },
    { name: 'Rosca Concentrada', muscle: 'biceps' },
    { name: 'Rosca Scott', muscle: 'biceps' },
    { name: 'Rosca na Polia', muscle: 'biceps' },
    { name: 'Rosca com Barra W', muscle: 'biceps' },
    { name: 'Rosca Inclinada', muscle: 'biceps' },

    // Triceps
    { name: 'Tríceps na Polia com Corda', muscle: 'triceps' },
    { name: 'Tríceps na Polia Reto', muscle: 'triceps' },
    { name: 'Tríceps Testa', muscle: 'triceps' },
    { name: 'Tríceps Coice', muscle: 'triceps' },
    { name: 'Tríceps na Máquina', muscle: 'triceps' },
    { name: 'Mergulho nas Paralelas', muscle: 'triceps' },
    { name: 'Rosca Francesa', muscle: 'triceps' },
    { name: 'Extensão de Tríceps com Halteres', muscle: 'triceps' },

    // Quadriceps
    { name: 'Agachamento Livre', muscle: 'quadriceps' },
    { name: 'Agachamento na Smith', muscle: 'quadriceps' },
    { name: 'Agachamento com Halteres', muscle: 'quadriceps' },
    { name: 'Agachamento Sumô', muscle: 'quadriceps' },
    { name: 'Leg Press 45°', muscle: 'quadriceps' },
    { name: 'Leg Press Horizontal', muscle: 'quadriceps' },
    { name: 'Cadeira Extensora', muscle: 'quadriceps' },
    { name: 'Hack Squat', muscle: 'quadriceps' },
    { name: 'Afundo com Halteres', muscle: 'quadriceps' },
    { name: 'Passada com Barra', muscle: 'quadriceps' },

    // Posterior
    { name: 'Stiff', muscle: 'hamstrings' },
    { name: 'Stiff Rumiano', muscle: 'hamstrings' },
    { name: 'Levantamento Terra Romeno', muscle: 'hamstrings' },
    { name: 'Mesa Flexora', muscle: 'hamstrings' },
    { name: 'Cadeira Flexora', muscle: 'hamstrings' },
    { name: 'Flexora Deitada', muscle: 'hamstrings' },
    { name: 'Bom Dia com Barra', muscle: 'hamstrings' },
    { name: 'Nordic Curl', muscle: 'hamstrings' },

    // Gluteos
    { name: 'Hip Thrust', muscle: 'glutes' },
    { name: 'Ponte de Glúteo', muscle: 'glutes' },
    { name: 'Elevação Pélvica na Máquina', muscle: 'glutes' },
    { name: 'Abdução de Quadril', muscle: 'glutes' },
    { name: 'Extensão de Quadril na Polia', muscle: 'glutes' },
    { name: 'Glúteo na Máquina', muscle: 'glutes' },

    // Abdomen
    { name: 'Abdominal Supra', muscle: 'abs' },
    { name: 'Abdominal Infra', muscle: 'abs' },
    { name: 'Abdominal na Polia', muscle: 'abs' },
    { name: 'Abdominal na Máquina', muscle: 'abs' },
    { name: 'Elevação de Pernas', muscle: 'abs' },
    { name: 'Crunch na Máquina', muscle: 'abs' },
    { name: 'Prancha', muscle: 'abs' },
    { name: 'Prancha Lateral', muscle: 'abs' },
    { name: 'V-Ups', muscle: 'abs' },
    { name: 'Russian Twist', muscle: 'abs' },
    { name: 'Bicycle Crunch', muscle: 'abs' },

    // Panturrilha
    { name: 'Elevação de Panturrilha em Pé', muscle: 'calves' },
    { name: 'Elevação de Panturrilha Sentado', muscle: 'calves' },
    { name: 'Panturrilha na Leg Press', muscle: 'calves' },
    { name: 'Panturrilha na Máquina', muscle: 'calves' }
];
