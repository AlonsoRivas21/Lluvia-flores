document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const teAmoPhrase = 'TE AMO';
    const fontSize = 16; // Tamaño de fuente para la lluvia (ajusta a tu gusto)
    const unionFactor = 0.6; // Ajusta este valor para unir más o menos las columnas
    const columnSpacing = fontSize * teAmoPhrase.length * unionFactor;
    const columns = Math.floor(canvas.width / columnSpacing);

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = {
            y: Math.random() * (canvas.height / fontSize),
        };
    }

    // --- Parámetros de Velocidad y Persistencia ---
    const dropSpeed = 1.2; // Velocidad de caída de las frases (más pequeño = más lento)
    const animationIntervalDelay = 75; // Velocidad general de la animación (más grande = menos FPS = más lento)

    // --- Parámetros de Opacidad y Reinicio ---
    const initialTrailOpacity = 0.05; // Opacidad del rastro durante la fase inicial (más alto = más denso)
    const initialResetProbability = 0.0001; // Probabilidad de reinicio en fase inicial (más bajo = menos reinicios)

    const normalTrailOpacity = 0.05; // Opacidad del rastro en fase normal (más bajo = más persistente)
    const normalResetProbability = 0.98; // Probabilidad de reinicio en fase normal (más alto = más reinicios)

    // --- Control de la Animación de Inicio ---
    let animationPhase = 'initial';
    let initialAnimationTimer = 0;
    const initialPhaseDuration = 3000; // Duración de la fase inicial (3 segundos)
    const transitionPhaseDuration = 1000; // Duración de la fase de transición (1 segundo)

    // --- Nuevas variables para el efecto de clic ---
    const explosionParticles = []; // Array para almacenar las partículas de la explosión
    const explosionChars = 'TEAMO'; // Caracteres para la explosión
    let clickText = null; // Objeto para el texto "TE AMO" que aparece al hacer clic

    // --- Función para crear partículas de explosión ---
    function createExplosion(x, y) {
        const numParticles = 50; // Número de partículas en la explosión
        const maxSpeed = 8; // Velocidad máxima de las partículas
        const particleLifetime = 60; // Cuántos frames durará la partícula (aproximadamente)

        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2; // Ángulo aleatorio
            const speed = Math.random() * maxSpeed; // Velocidad aleatoria
            explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed, // Velocidad en X
                vy: Math.sin(angle) * speed, // Velocidad en Y
                char: explosionChars.charAt(Math.floor(Math.random() * explosionChars.length)), // Carácter aleatorio
                opacity: 1, // Opacidad inicial
                lifetime: particleLifetime, // Vida útil
                initialLifetime: particleLifetime // Para calcular la opacidad
            });
        }
    }

    // --- Función para dibujar el texto "TE AMO" al hacer clic ---
    function createClickText(x, y) {
        clickText = {
            x: x,
            y: y,
            text: teAmoPhrase,
            opacity: 1,
            lifetime: 60, // Cuántos frames durará el texto "TE AMO" (aproximadamente)
            initialLifetime: 100
        };
    }

    // --- Event Listener para el clic ---
    canvas.addEventListener('click', (event) => {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        createExplosion(mouseX, mouseY);
        createClickText(mouseX, mouseY);
    });


    function draw() {
        let trailOpacity;
        let resetProbability;

        if (animationPhase === 'initial') {
            trailOpacity = 0.05;
            resetProbability = 0.0001;
            initialAnimationTimer += animationIntervalDelay;
            if (initialAnimationTimer >= initialPhaseDuration) {
                animationPhase = 'transition';
                initialAnimationTimer = 0;
            }
        } else if (animationPhase === 'transition') {
            const progress = initialAnimationTimer / transitionPhaseDuration;
            const initialTrail = 0.08;
            const normalTrail = 0.02;
            trailOpacity = initialTrail - (initialTrail - normalTrail) * progress;

            resetProbability = 0.8 + (0.98 - 0.8) * progress;
            initialAnimationTimer += animationIntervalDelay;
            if (initialAnimationTimer >= transitionPhaseDuration) {
                animationPhase = 'normal';
            }
        } else { // animationPhase === 'normal'
            trailOpacity = 0.05;
            resetProbability = 0.98;
        }

        // 1. Dibuja el fondo transparente para el rastro (base de la animación)
        ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Dibuja la lluvia de frases "TE AMO" (la animación principal)
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

        // 3. Dibuja y actualiza las partículas de explosión
        ctx.font = `${fontSize * 0.8}px monospace`; // Un poco más pequeñas
        for (let i = explosionParticles.length - 1; i >= 0; i--) {
            const p = explosionParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.lifetime--;
            p.opacity = p.lifetime / p.initialLifetime; // Disminuye la opacidad

            ctx.fillStyle = `rgba(255, 0, 127, ${p.opacity})`; // Rosa brillante con opacidad variable
            ctx.fillText(p.char, p.x, p.y);

            if (p.lifetime <= 0) {
                explosionParticles.splice(i, 1); // Elimina la partícula si ya no es visible
            }
        }

        // 4. Dibuja el texto "TE AMO" del clic
        if (clickText && clickText.opacity > 0) {
            clickText.lifetime--;
            clickText.opacity = clickText.lifetime / clickText.initialLifetime;

            ctx.fillStyle = `rgba(255, 0, 127, ${clickText.opacity})`; // Blanco brillante para el texto del clic
            ctx.font = `bold ${fontSize * 2}px sans-serif`; // Más grande y en negrita
            ctx.textAlign = 'center'; // Centra el texto en el punto del clic
            ctx.fillText(clickText.text, clickText.x, clickText.y);
            ctx.textAlign = 'left'; // Restaura la alineación por defecto para la lluvia

            if (clickText.lifetime <= 0) {
                clickText = null; // Elimina el texto si ya no es visible
            }
        }
    }

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
        // Limpiar partículas y texto al redimensionar
        explosionParticles.length = 0;
        clickText = null;
    });
});