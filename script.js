document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');

    // La meta viewport en HTML ya ayuda con la escalabilidad
    // Pero el canvas necesita redimensionarse a las dimensiones del dispositivo
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const teAmoPhrase = 'TE AMO';
    // Podrías ajustar fontSize y unionFactor aquí para móviles si las frases se ven muy grandes o muy pequeñas.
    // Por ejemplo, usar vw (viewport width) o vh (viewport height) para fontSize
    // o tener un fontSize diferente para pantallas pequeñas.
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

    // --- Parámetros de Velocidad y Persistencia ---
    const dropSpeed = 1.2; 
    const animationIntervalDelay = 75; 

    // --- Parámetros de Opacidad y Reinicio ---
    const initialTrailOpacity = 0.05; 
    const initialResetProbability = 0.0001; 

    const normalTrailOpacity = 0.05; 
    const normalResetProbability = 0.98; 

    // --- Control de la Animación de Inicio ---
    let animationPhase = 'initial';
    let initialAnimationTimer = 0;
    const initialPhaseDuration = 3000; 
    const transitionPhaseDuration = 1000; 

    // --- Variables para el efecto de clic/toque ---
    const explosionParticles = []; 
    const explosionChars = 'TEAMO!@#$%^&*()_+=-{}[]|:;<>,./?'; 
    let clickText = null; 

    function createExplosion(x, y) {
        const numParticles = 50; 
        const maxSpeed = 8; 
        const particleLifetime = 60; 

        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2; 
            const speed = Math.random() * maxSpeed; 
            explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed, 
                vy: Math.sin(angle) * speed, 
                char: explosionChars.charAt(Math.floor(Math.random() * explosionChars.length)), 
                opacity: 1, 
                lifetime: particleLifetime, 
                initialLifetime: particleLifetime 
            });
        }
    }

    function createClickText(x, y) {
        clickText = {
            x: x,
            y: y,
            text: teAmoPhrase,
            opacity: 1,
            lifetime: 80, 
            initialLifetime: 80
        };
    }

    // --- Event Listener para el clic (desktops) ---
    canvas.addEventListener('click', (event) => {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        createExplosion(mouseX, mouseY);
        createClickText(mouseX, mouseY);
    });

    // --- NUEVO: Event Listener para el toque (móviles) ---
    canvas.addEventListener('touchstart', (event) => {
        // Prevenir el comportamiento por defecto (ej. scroll o zoom con el toque)
        event.preventDefault(); 
        // Acceder a las coordenadas del primer toque
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        createExplosion(touchX, touchY);
        createClickText(touchX, touchY);
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
        ctx.font = `${fontSize * 0.8}px monospace`; 
        for (let i = explosionParticles.length - 1; i >= 0; i--) {
            const p = explosionParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.lifetime--;
            p.opacity = p.lifetime / p.initialLifetime; 

            ctx.fillStyle = `rgba(255, 0, 127, ${p.opacity})`; 
            ctx.fillText(p.char, p.x, p.y);

            if (p.lifetime <= 0) {
                explosionParticles.splice(i, 1); 
            }
        }

        // 4. Dibuja el texto "TE AMO" del clic
        if (clickText && clickText.opacity > 0) {
            clickText.lifetime--;
            clickText.opacity = clickText.lifetime / clickText.initialLifetime;

            ctx.fillStyle = `rgba(255, 0, 127, ${clickText.opacity})`; 
            ctx.font = `bold ${fontSize * 1.2}px monospace`; 
            ctx.textAlign = 'center'; 
            ctx.fillText(clickText.text, clickText.x, clickText.y);
            ctx.textAlign = 'left'; 

            if (clickText.lifetime <= 0) {
                clickText = null; 
            }
        }
    }

    setInterval(draw, animationIntervalDelay);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Recalcular columnas y re-inicializar gotas para el nuevo tamaño
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