// Theme Switching (with smooth cross-fade transition)
function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
        document.body.dataset.theme = theme;
    }
}

function setTheme(theme, animate = true) {
    localStorage.setItem('theme', theme); // Save preference

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduceMotion) {
        applyTheme(theme);
        return;
    }

    if (document.startViewTransition) {
        // Modern browsers: smooth cross-fade of the whole page
        document.startViewTransition(() => applyTheme(theme));
    } else {
        // Fallback: animate colours on every element for a short moment
        const root = document.documentElement;
        root.classList.add('theme-transition');
        applyTheme(theme);
        setTimeout(() => root.classList.remove('theme-transition'), 600);
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
