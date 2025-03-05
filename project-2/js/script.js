document.addEventListener('DOMContentLoaded', () => {
    console.log('Front page loaded');

    // Navigation handling
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            const title = option.querySelector('h2').textContent;
            if (title === '>_Terminal') {
                window.location.href = 'terminal.html';
            }
            // Placeholder for future options (Visualizer, Game)
        });

        // Hover effects
        option.addEventListener('mouseenter', () => {
            option.style.background = '#0f0';
            option.style.color = '#000';
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'none';
            option.style.color = '#0f0';
        });
    });
});