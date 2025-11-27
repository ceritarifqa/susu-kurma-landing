/**
 * Enhances the landing page with accessible navigation, smooth scrolling,
 * scroll-triggered reveals, and header state changes.
 */
(() => {
    'use strict';

    const SELECTORS = {
        anchorLinks: 'a[href^="#"]',
        header: '.header',
        nav: '#primary-navigation',
        navToggle: '.nav-toggle',
        revealTargets: '[data-reveal]'
    };

    const prefersReducedMotion = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const shouldReduceMotion = () => Boolean(prefersReducedMotion && prefersReducedMotion.matches);

    const enableJsMode = () => {
        const body = document.body;
        if (!body) {
            return;
        }

        body.classList.remove('no-js');
        body.classList.add('js-enabled');
    };

    const focusTarget = (element) => {
        if (!element) {
            return;
        }

        const hadTabindex = element.hasAttribute('tabindex');
        if (!hadTabindex) {
            element.setAttribute('tabindex', '-1');
        }

        element.focus({ preventScroll: true });

        if (!hadTabindex) {
            element.removeAttribute('tabindex');
        }
    };

    const initSmoothScroll = () => {
        const links = document.querySelectorAll(SELECTORS.anchorLinks);
        if (!links.length) {
            return;
        }

        links.forEach((link) => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');

                if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: shouldReduceMotion() ? 'auto' : 'smooth',
                    block: 'start'
                });

                focusTarget(target);
            });
        });
    };

    const initHeaderElevation = () => {
        const header = document.querySelector(SELECTORS.header);
        if (!header) {
            return;
        }

        const toggleHeaderState = () => {
            header.classList.toggle('header--elevated', window.scrollY > 50);
        };

        toggleHeaderState();
        window.addEventListener('scroll', toggleHeaderState, { passive: true });
    };

    const initScrollReveal = () => {
        const targets = document.querySelectorAll(SELECTORS.revealTargets);
        if (!targets.length) {
            return;
        }

        targets.forEach((target) => target.classList.add('reveal'));

        if (!('IntersectionObserver' in window) || shouldReduceMotion()) {
            targets.forEach((target) => target.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        });

        targets.forEach((target) => observer.observe(target));
    };

    const initMobileNavigation = () => {
        const nav = document.querySelector(SELECTORS.nav);
        const toggle = document.querySelector(SELECTORS.navToggle);

        if (!nav || !toggle) {
            return;
        }

        const navLinks = nav.querySelectorAll('a');
        const toggleLabel = toggle.querySelector('.nav-toggle__label');
        const toggleIcon = toggle.querySelector('i');
        const isDesktopViewport = () => window.innerWidth >= 768;

        const setNavState = (desiredState) => {
            const isDesktop = isDesktopViewport();
            const isOpen = isDesktop ? false : desiredState;

            nav.classList.toggle('is-open', isOpen);
            document.body.classList.toggle('nav-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            nav.setAttribute('aria-hidden', String(!isDesktop && !isOpen));

            navLinks.forEach((link) => {
                link.tabIndex = !isDesktop && !isOpen ? -1 : 0;
            });

            if (toggleLabel) {
                toggleLabel.textContent = isOpen ? 'Tutup navigasi utama' : 'Buka navigasi utama';
            }

            if (toggleIcon) {
                toggleIcon.classList.toggle('fa-bars', !isOpen);
                toggleIcon.classList.toggle('fa-xmark', isOpen);
            }
        };

        const closeNav = () => setNavState(false);

        toggle.addEventListener('click', () => {
            if (isDesktopViewport()) {
                return;
            }

            const isOpen = nav.classList.contains('is-open');
            setNavState(!isOpen);
        });

        navLinks.forEach((link) => link.addEventListener('click', closeNav));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNav();
            }
        });

        window.addEventListener('resize', closeNav);

        setNavState(false);
    };

    const init = () => {
        enableJsMode();
        initSmoothScroll();
        initHeaderElevation();
        initScrollReveal();
        initMobileNavigation();
    };

    document.addEventListener('DOMContentLoaded', init);
})();
