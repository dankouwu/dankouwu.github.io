class Navbar extends HTMLElement {
    constructor() {
        super();
        this.isInitialized = false;
    }

    async connectedCallback() {
        if (this.isInitialized) {
            return;
        }
        try {
            const response = await fetch('./components/Navbar/navbar.html');
            if (!response.ok) throw new Error(`Failed to load navbar: ${response.status}`);
            const html = await response.text();
            this.innerHTML = html;

            const tryInit = () => {
                if (this.init()) {
                    this.isInitialized = true;
                } else {
                    setTimeout(tryInit, 50);
                }
            };
            tryInit();
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }

    init() {
        const menuBtn = this.querySelector('.menu');
        const mobileNav = this.querySelector('.mobileNavigation');
        const navWrapper = this.querySelector('.navWrapper');

        if (!menuBtn || !mobileNav || !navWrapper) {
            return false;
        }

        this.updateStats();

        const toggleMenu = (forceState) => {
            const isOpen = mobileNav.classList.contains('open');
            const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

            if (shouldOpen) {
                mobileNav.classList.add('open');
                menuBtn.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                mobileNav.classList.remove('open');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        menuBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        };

        window.addEventListener('click', (e) => {
            const isOpen = mobileNav.classList.contains('open');
            if (isOpen && !mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        });

        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach((link) => {
            link.onclick = () => {
                toggleMenu(false);
            };
        });

        const handleScroll = () => {
            if (window.scrollY > 50) {
                navWrapper.classList.add('notTop');
            } else {
                navWrapper.classList.remove('notTop');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        if (window.lucide) {
            window.lucide.createIcons();
        }

        return true;
    }

    updateStats() {
        if (typeof storageService === 'undefined') {
            return;
        }

        const data = storageService.load();

        if (!data || !data.user) {
            return;
        }

        const user = data.user;
        const levelElement = this.querySelector('.currentLevel');
        const xpFill = this.querySelector('.globalXpFill');
        const streakCountElement = this.querySelector('.streakCount');

        if (levelElement) levelElement.textContent = user.level;

        if (xpFill && typeof rpgService !== 'undefined') {
            const xpNeeded = rpgService.getXpToNextLevel(user.level);
            const percent = Math.min((user.xp / xpNeeded) * 100, 100);
            xpFill.style.width = `${percent}%`;
        }

        if (streakCountElement && data.activeHabits) {
            const maxStreak = data.activeHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
            streakCountElement.textContent = maxStreak;
        }
    }
}

if (!customElements.get('app-navbar')) {
    customElements.define('app-navbar', Navbar);
}