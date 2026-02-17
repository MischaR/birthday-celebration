document.addEventListener('DOMContentLoaded', () => {
    // Scroll snap: only on scroll end, past midpoint (50%) - avoids "pushed back" feeling
    const SNAP_THRESHOLD = 0.5; // 50% - must scroll past midpoint to commit
    const sections = document.querySelectorAll('.hero, .video-section, .intro-section, .timeline-item, .love-note-section, .present-section');
    let isSnapping = false;
    let snapTimeout;
    let lastScrollY = window.scrollY || 0;

    function snapToSection(index) {
        if (index < 0 || index >= sections.length) return;
        isSnapping = true;
        sections[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => { isSnapping = false; }, 900);
    }

    function trySnap() {
        if (isSnapping) return;
        const vh = window.innerHeight;
        const midPx = vh * SNAP_THRESHOLD;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollingDown = scrollY > lastScrollY;
        lastScrollY = scrollY;

        if (scrollingDown) {
            let snapTo = -1;
            for (let i = 0; i < sections.length; i++) {
                const rect = sections[i].getBoundingClientRect();
                if (rect.top < midPx) snapTo = i;
            }
            if (snapTo >= 0) {
                const rect = sections[snapTo].getBoundingClientRect();
                const elCenter = rect.top + rect.height / 2;
                if (Math.abs(elCenter - vh / 2) > vh * 0.08) snapToSection(snapTo);
            }
        } else {
            let snapTo = -1;
            for (let i = sections.length - 1; i >= 0; i--) {
                const rect = sections[i].getBoundingClientRect();
                if (rect.bottom > vh - midPx) snapTo = i;
            }
            if (snapTo >= 0) {
                const rect = sections[snapTo].getBoundingClientRect();
                const elCenter = rect.top + rect.height / 2;
                if (Math.abs(elCenter - vh / 2) > vh * 0.08) snapToSection(snapTo);
            }
        }
    }

    let scrollEndTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(trySnap, 200);
    }, { passive: true });

    // Video loading states
    const youtubeLoading = document.getElementById('youtube-loading');
    const loveVideoLoading = document.getElementById('love-video-loading');
    const loveVideo = document.querySelector('.love-note-section video');
    const youtubeIframe = document.querySelector('.video-wrapper iframe');

    function hideLoading(el) {
        if (el) {
            el.classList.add('loaded');
            el.setAttribute('aria-hidden', 'true');
        }
    }

    if (loveVideo) {
        loveVideo.addEventListener('canplay', () => hideLoading(loveVideoLoading), { once: true });
        loveVideo.addEventListener('loadeddata', () => hideLoading(loveVideoLoading), { once: true });
    }

    if (youtubeIframe) {
        youtubeIframe.addEventListener('load', () => hideLoading(youtubeLoading), { once: true });
        setTimeout(() => hideLoading(youtubeLoading), 5000);
    }

    // Scroll Reveal Animation - progressive reveal with intersection ratio
    const revealThresholds = [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1];
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: revealThresholds });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // Scroll blend effect - sections fade/scale based on distance from center (only when revealed)
    const blendSections = document.querySelectorAll('.hero, .intro-section, .video-section, .timeline-item, .love-note-section, .present-section');
    let blendRaf = null;

    function updateScrollBlend() {
        const vh = window.innerHeight;
        const center = vh / 2;
        blendSections.forEach(section => {
            const isRevealed = section.classList.contains('visible') || section.classList.contains('hero');
            if (!isRevealed) return;
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - center);
            const maxDistance = vh * 0.9;
            const blend = Math.max(0.75, 1 - (distance / maxDistance) * 0.25);
            const scale = 0.98 + blend * 0.02;
            section.style.setProperty('--scroll-blend', blend);
            section.style.setProperty('--scroll-scale', scale);
        });
        blendRaf = null;
    }

    window.addEventListener('scroll', () => {
        if (!blendRaf) blendRaf = requestAnimationFrame(updateScrollBlend);
    }, { passive: true });
    updateScrollBlend();

    // Fireworks Animation
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let fireworks = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Warm celebratory colors for fireworks
    const colors = ['#f5d04c', '#ff6b6b', '#7a6ff0'];

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 4 + 1;
            this.vx = Math.cos(angle) * velocity;
            this.vy = Math.sin(angle) * velocity;
            this.life = 100;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // gravity
            this.life -= 1;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Firework {
        constructor() {
            this.x = Math.random() * width;
            this.y = height;
            this.targetY = Math.random() * (height * 0.5);
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = -Math.random() * 10 - 10;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.exploded = false;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.15; // gravity

            if (this.vy >= 0 || this.y <= this.targetY) {
                this.explode();
                return false; // remove firework
            }
            return true;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        explode() {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    function animate() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fades out the fireworks
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';

        if (window.scrollY < window.innerHeight && Math.random() < 0.05) {
            fireworks.push(new Firework());
        }

        fireworks = fireworks.filter(fw => {
            fw.draw();
            return fw.update();
        });

        particles = particles.filter(p => {
            p.update();
            p.draw();
            return p.alpha > 0;
        });

        requestAnimationFrame(animate);
    }

    // Expose celebration function globally
    window.celebrate = function () {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                fireworks.push(new Firework());
            }, i * 200);
        }
    };

    // Floating emojis
    const emojis = ['❤️', '✨', '💙', '💛', '🥂', '🌸', '✈️', '🌴'];
    const container = document.body;

    function createFloatingEmoji() {
        const el = document.createElement('div');
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const size = Math.random() * 20 + 20;
        el.textContent = emoji;
        el.className = 'floating-emoji';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.fontSize = size + 'px';
        el.style.lineHeight = '1';
        el.style.animationDuration = Math.random() * 10 + 10 + 's';
        el.style.animationDelay = Math.random() * 5 + 's';

        container.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 20000);
    }

    for (let i = 0; i < 15; i++) {
        setTimeout(createFloatingEmoji, i * 500);
    }

    setInterval(createFloatingEmoji, 1500);

    animate();

    // Parse all emoji on the page with Twemoji (fixes flag emojis on Windows)
    if (typeof twemoji !== 'undefined') {
        twemoji.parse(document.body, {
            folder: 'svg',
            ext: '.svg'
        });
    }
});

// Present Game Logic (Global Scope)
let wrongAttempts = 0;

function handleCardClick(element) {
    if (element.classList.contains('disabled')) return;

    const type = element.getAttribute('data-type');
    const instruction = document.querySelector('.game-instruction');
    const correctCard = document.querySelector('.card[data-type="correct"]');

    if (type === 'wrong') {
        // Shake animation
        element.classList.add('shake');
        element.style.background = '#ffe6e6';
        wrongAttempts++;

        // Brief "try again" feedback, then specific message
        const heading = element.querySelector('h3').innerText;
        instruction.innerText = "Try again! 💭";
        instruction.style.color = "";

        const messages = {
            'Guidebook': "Nice guess, but not this one! 🗺️",
            'Jacket': "Not quite. Think heart, not weather! ☀️",
            'Luggage': "Close, but this journey needs something deeper. ✨",
            'Camera': "Good idea, but there's a better answer. 📸"
        };
        const specificMessage = messages[heading] || "Not quite! Try another one.";

        setTimeout(() => {
            instruction.innerText = specificMessage;
        }, 400);

        // Disable card after shake
        setTimeout(() => {
            element.classList.remove('shake');
            element.classList.add('disabled');
            element.style.opacity = '0.5';
            element.style.cursor = 'default';
        }, 500);

        // Check availability - show hint after 3 wrong (with 4 wrong options)
        if (wrongAttempts >= 3) {
            // If 2 wrong, highlight correct one
            correctCard.style.transition = "all 0.5s ease";
            correctCard.style.boxShadow = "0 0 30px var(--accent-gold)";
            correctCard.style.transform = "scale(1.1)";
            instruction.innerText = "Hint: The answer is simple and timeless... ❤️";
        }

    } else if (type === 'correct') {
        triggerSuccess(element);
    }
}

function triggerSuccess(card) {
    const instruction = document.querySelector('.game-instruction');
    const cards = document.querySelectorAll('.card');
    const ticket = document.getElementById('ticket-reveal');

    // 1. Update text
    instruction.innerText = "You guessed it. Love is always the best travel companion. ❤️✈️";
    instruction.style.color = "var(--accent-red)";
    instruction.style.fontWeight = "bold";

    // Re-parse emojis for dynamic content
    if (typeof twemoji !== 'undefined') {
        twemoji.parse(instruction, { folder: 'svg', ext: '.svg' });
    }

    // 2. Hide wrong cards
    cards.forEach(c => {
        if (c !== card) {
            c.style.opacity = '0';
            c.style.transform = 'scale(0)';
            c.style.pointerEvents = 'none';
        }
    });

    // 3. Explode correct card
    card.style.transition = "transform 0.5s ease";
    card.style.transform = "scale(1.5) rotate(360deg)";

    setTimeout(() => {
        card.style.opacity = '0';
        card.style.display = 'none';

        // Hide container to remove extra margin/gap
        document.querySelector('.game-container').style.display = 'none';

        // Reduce instruction margin
        document.querySelector('.game-instruction').style.marginBottom = '20px';

        // Show Ticket
        ticket.classList.remove('hidden');
        ticket.classList.add('visible');

        // Scroll to ticket smoothly
        ticket.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Enable Fireworks for Finale (Fix to viewport)
        const canvas = document.getElementById('fireworksCanvas');
        canvas.classList.add('fireworks-fixed');

        // Celebration!
        if (window.celebrate) window.celebrate();
        if (typeof launchConfetti === 'function') launchConfetti();

    }, 600);
}

function launchConfetti() {
    const confettiSvg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="6" fill="#ff6b6b"/><circle cx="18" cy="18" r="8" fill="#f5d04c"/></svg>');
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const size = Math.random() * 20 + 24;
            const conf = document.createElement('img');
            conf.src = confettiSvg;
            conf.alt = '';
            conf.style.position = 'fixed';
            conf.style.left = x + 'px';
            conf.style.bottom = '0px';
            conf.style.width = size + 'px';
            conf.style.height = size + 'px';
            conf.style.objectFit = 'contain';
            conf.style.transition = "all 2s ease-out";
            conf.style.zIndex = "9999";
            conf.style.pointerEvents = 'none';
            document.body.appendChild(conf);

            setTimeout(() => {
                conf.style.transform = `translateY(-${Math.random() * 80 + 20}vh) rotate(${Math.random() * 720}deg)`;
                conf.style.opacity = '0';
            }, 50);

            setTimeout(() => conf.remove(), 2500);
        }, i * 50);
    }
}
