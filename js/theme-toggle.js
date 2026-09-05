/* ============================================================
   NEXUS Theme Toggle
   Reads and toggles data-theme on <body>.
   Priority: localStorage → prefers-color-scheme → dark (default).
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'nexus-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  /**
   * Determine initial theme from storage or system preference.
   * @returns {'dark' | 'light'}
   */
  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) {
      return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return LIGHT;
    }
    return DARK; // default
  }

  /**
   * Apply theme to <body> and update toggle button state.
   * @param {string} theme
   */
  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update toggle button aria-label and icon
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      const isDark = theme === DARK;
      toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

      // Swap icon visibility
      const sunIcon = toggleBtn.querySelector('.icon-sun');
      const moonIcon = toggleBtn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';
      }
    }
  }

  /**
   * Toggle between light and dark themes.
   */
  function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
  }

  // --- Initialize on DOM ready ---
  function init() {
    // Apply initial theme
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Bind toggle button
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // Bind hamburger menu
    const hamburgerBtn = document.getElementById('nav-hamburger');
    const mobilePanel = document.getElementById('nav-mobile-panel');

    if (hamburgerBtn && mobilePanel) {
      hamburgerBtn.addEventListener('click', function () {
        const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));
        mobilePanel.setAttribute('aria-hidden', String(isOpen));

        // Prevent body scroll when menu is open
        if (!isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
    }

    // Category chips scroll fade indicators
    const chipsContainer = document.querySelector('.category-chips');
    const chipsList = document.querySelector('.category-chips__list');

    if (chipsContainer && chipsList) {
      function updateChipsFade() {
        const scrollLeft = chipsList.scrollLeft;
        const scrollWidth = chipsList.scrollWidth;
        const clientWidth = chipsList.clientWidth;

        if (scrollLeft > 4) {
          chipsContainer.classList.add('category-chips--fade-left');
        } else {
          chipsContainer.classList.remove('category-chips--fade-left');
        }

        if (scrollLeft + clientWidth < scrollWidth - 4) {
          chipsContainer.classList.add('category-chips--fade-right');
        } else {
          chipsContainer.classList.remove('category-chips--fade-right');
        }
      }

      chipsList.addEventListener('scroll', updateChipsFade);
      // Initial check
      updateChipsFade();
      // Re-check on resize
      window.addEventListener('resize', updateChipsFade);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
