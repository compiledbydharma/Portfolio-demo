export function initAccessibility({ onReturn, onContact }) {
    const btnReturn = document.getElementById('btn-return');
    const btnContact = document.getElementById('btn-contact');
    const contactPill = document.getElementById('contact-pill');

    if (btnReturn) {
        btnReturn.addEventListener('click', onReturn);
    }
    if (btnContact) {
        btnContact.addEventListener('click', onContact);
    }
    if (contactPill) {
        contactPill.addEventListener('click', () => {
            navigator.clipboard?.writeText('justprayag2008@gmail.com');
        });
    }

    // Show fallback UI after 8 seconds
    const fallbackUI = document.getElementById('fallback-ui');
    let timer = setTimeout(() => {
        fallbackUI.classList.add('visible');
    }, 8000);

    // Hide on interaction
    const hide = () => {
        fallbackUI.classList.remove('visible');
        clearTimeout(timer);
    };

    // We'll attach these to global events from main
    window.__hideFallbackUI = hide;

    // Listen for user interaction to hide
    document.addEventListener('click', hide);
    document.addEventListener('touchstart', hide);
}

export function showFallbackUI() {
    document.getElementById('fallback-ui').classList.add('visible');
}

export function hideFallbackUI() {
    document.getElementById('fallback-ui').classList.remove('visible');
}

