import confetti from 'canvas-confetti';

export const useCelebration = () => {
    const celebrate = (type: 'default' | 'fireworks' | 'stars' = 'default') => {
        const duration = 3000;
        const end = Date.now() + duration;

        if (type === 'fireworks') {
            // Fireworks effect
            const interval = setInterval(() => {
                if (Date.now() > end) {
                    clearInterval(interval);
                    return;
                }

                confetti({
                    particleCount: 50,
                    startVelocity: 30,
                    spread: 360,
                    origin: {
                        x: Math.random(),
                        y: Math.random() * 0.5,
                    },
                    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
                });
            }, 250);
        } else if (type === 'stars') {
            // Star burst effect
            const defaults = {
                spread: 360,
                ticks: 100,
                gravity: 0,
                decay: 0.94,
                startVelocity: 30,
                colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1'],
            };

            confetti({
                ...defaults,
                particleCount: 50,
                scalar: 1.2,
                shapes: ['star'],
            });

            confetti({
                ...defaults,
                particleCount: 25,
                scalar: 0.75,
                shapes: ['circle'],
            });
        } else {
            // Default confetti burst
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#9775FA'];

            // Left side burst
            confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors,
            });

            // Right side burst
            confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors,
            });

            // Center burst after delay
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 100,
                    origin: { x: 0.5, y: 0.5 },
                    colors,
                });
            }, 200);
        }
    };

    return { celebrate };
};
