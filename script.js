document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const teAmoPhrase = 'TE AMO';
    const fontSize = 16;
    const unionFactor = 0.6;
    const columnSpacing = fontSize * teAmoPhrase.length * unionFactor;
    const columns = Math.floor(canvas.width / columnSpacing);

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = {
            y: Math.random() * (canvas.height / fontSize),
        };
    }

    // --- Variables para la animación de inicio estilo Matrix ---
    let animationPhase = 'initial';
    let initialAnimationTimer = 0;
    const initialPhaseDuration = 3000; // Duración de la fase inicial (3 segundos)
    const transitionPhaseDuration = 2000; // Duración de la fase de transición (2 segundos)

    const dropSpeed = 1.2; // Velocidad de caída de las frases (ajusta a tu gusto)

    function draw() {
        let trailOpacity; // Opacidad del rastro (background fillStyle)
        let resetProbability; // Probabilidad de que una gota se reinicie

        if (animationPhase === 'initial') {
            // --- AJUSTE CLAVE PARA EL RASTRO EN FASE INICIAL ---
            // Un valor más bajo (más cerca de 0) hará que el rastro sea más largo/denso y persista más.
            // Originalmente: 0.15
            trailOpacity = 0.08; // Prueba con 0.1, 0.05 si quieres aún más persistencia al inicio
            resetProbability = 0.8;
            initialAnimationTimer += animationIntervalDelay;
            if (initialAnimationTimer >= initialPhaseDuration) {
                animationPhase = 'transition';
                initialAnimationTimer = 0;
            }
        } else if (animationPhase === 'transition') {
            // --- AJUSTE CLAVE PARA EL RASTRO EN FASE DE TRANSICIÓN ---
            // Interpolamos desde el nuevo valor inicial hasta el nuevo valor normal.
            const progress = initialAnimationTimer / transitionPhaseDuration;
            const initialTrail = 0.08; // El valor que pusiste en la fase 'initial'
            const normalTrail = 0.02;  // El valor que pondremos en la fase 'normal'
            trailOpacity = initialTrail - (initialTrail - normalTrail) * progress;

            resetProbability = 0.8 + (0.98 - 0.8) * progress;
            initialAnimationTimer += animationIntervalDelay;
            if (initialAnimationTimer >= transitionPhaseDuration) {
                animationPhase = 'normal';
            }
        } else { // animationPhase === 'normal'
            // --- AJUSTE CLAVE PARA EL RASTRO EN FASE NORMAL (el efecto principal) ---
            // Un valor más bajo (más cerca de 0) hará que las frases tarden más en desaparecer.
            // Originalmente: 0.05
            trailOpacity = 0.05; // Prueba con 0.01, 0.005 si quieres aún más persistencia
            resetProbability = 0.98;
        }

        ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FF007F';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const drop = drops[i];

            ctx.fillText(teAmoPhrase, i * columnSpacing, drop.y * fontSize);
            drop.y += dropSpeed;

            if (drop.y * fontSize > canvas.height && Math.random() > resetProbability) {
                drop.y = 0;
            }
        }
    }

    const animationIntervalDelay = 75; // Velocidad general de la animación (menos FPS = más lento)

    setInterval(draw, animationIntervalDelay);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const newColumns = Math.floor(canvas.width / columnSpacing);
        drops.length = 0;
        for (let i = 0; i < newColumns; i++) {
            drops[i] = {
                y: Math.random() * (canvas.height / fontSize)
            };
        }
        animationPhase = 'initial';
        initialAnimationTimer = 0;
    });
});