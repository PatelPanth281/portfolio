// Theme Switching (circular "ripple" reveal that spreads from the clicked button)
function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
        document.body.dataset.theme = theme;
    }
}

// Remember where the theme button is, so the ripple starts from it
let themeOrigin = { x: window.innerWidth - 80, y: 40 };
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-switcher button');
    if (btn) {
        const r = btn.getBoundingClientRect();
        themeOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
}, true);

function setTheme(theme, animate = true) {
    localStorage.setItem('theme', theme); // Save preference

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduceMotion) {
        applyTheme(theme);
        return;
    }

    if (document.startViewTransition) {
        const { x, y } = themeOrigin;
        // Radius big enough to cover the farthest corner of the screen
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => applyTheme(theme));

        transition.ready.then(() => {
            const duration = 1000;
            const easing = 'cubic-bezier(0.65, 0, 0.35, 1)';

            // New theme expands as a circle from the button
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration, easing, pseudoElement: '::view-transition-new(root)' }
            );

            // Old theme gently shrinks back and blurs for a sense of depth
            document.documentElement.animate(
                {
                    transform: ['scale(1)', 'scale(0.96)'],
                    filter: ['blur(0px) brightness(1)', 'blur(6px) brightness(0.8)']
                },
                { duration, easing, fill: 'forwards', pseudoElement: '::view-transition-old(root)' }
            );
        });
    } else {
        // Fallback: fade colours on every element for a short moment
        const root = document.documentElement;
        root.classList.add('theme-transition');
        applyTheme(theme);
        setTimeout(() => root.classList.remove('theme-transition'), 800);
    }
}

// Load saved theme or default to dark (no animation on first load)
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme, false);

// Smooth Scrolling
function scrollToSection(sectionId) {
    document.querySelector(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Add event listeners to nav links for smooth scroll
document.querySelectorAll('.sticky-nav ul a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href');
        scrollToSection(sectionId);
    });
});

// Contact Form Handler (using Formspree)
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default submission

        const formData = new FormData(form);
        const endpoint = form.getAttribute('action'); // Your Formspree URL

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Tell Formspree to respond with JSON
                }
            });

            if (response.ok) {
                status.innerHTML = '<p style="color: #4d8dff;">Thanks for reaching out! I\'ll get back to you soon.</p>';
                status.style.display = 'block';
                form.reset(); // Clear the form
            } else {
                status.innerHTML = '<p style="color: #e05555;">Oops! Something went wrong. Please try again.</p>';
                status.style.display = 'block';
            }
        } catch (error) {
            status.innerHTML = '<p style="color: #e05555;">Network error. Please check your connection and try again.</p>';
            status.style.display = 'block';
        }
    });
}

// Keep page content below the fixed header (handles nav wrapping on small screens)
function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
        document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }
}
updateHeaderHeight();
window.addEventListener('load', updateHeaderHeight);
window.addEventListener('resize', updateHeaderHeight);
