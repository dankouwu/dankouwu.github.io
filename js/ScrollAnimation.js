
window.addEventListener('features-created', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('inView');
            }
            if (!entry.isIntersecting && entry.target.classList.contains('inView')) {
                entry.target.classList.remove('inView');
            }
        });
    }, {
        threshold: 0.6
    });

    const hiddenElements = document.querySelectorAll('.feature');
    hiddenElements.forEach((el) => observer.observe(el));
});