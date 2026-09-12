/* ============================================================
   NEXUS Authentication Logic
   Handles:
   - Sign In / Sign Up tab switching
   - Form validation for both modes
   - Password visibility toggle
   - Demo localStorage auth state
   - Nav auth-state updates (avatar on home page)

   ⚠ WARNING: This is a frontend-only demo using localStorage.
   Do NOT use this for real authentication. Replace with a
   proper backend auth system (OAuth, JWT, etc.) in production.
   ============================================================ */

(function () {
  'use strict';

  // --- Constants ---
  var AUTH_KEY = 'nexus-auth';

  // ============================================================
  // Demo Auth Utilities (localStorage only — NOT secure)
  // Exposed on window.NexusAuth so other team scripts can
  // check auth state without duplicating logic.
  // ============================================================

  /**
   * Retrieve current auth state from localStorage.
   * @returns {object|null} Parsed user object or null
   */
  function getAuthState() {
    try {
      var data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Persist demo auth state to localStorage.
   * @param {object} user
   */
  function setAuthState(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }

  /**
   * Clear demo auth state.
   */
  function clearAuthState() {
    localStorage.removeItem(AUTH_KEY);
  }

  // Expose auth utilities for other team scripts
  window.NexusAuth = {
    getAuthState: getAuthState,
    setAuthState: setAuthState,
    clearAuthState: clearAuthState
  };

  // ============================================================
  // Validation Helpers
  // ============================================================

  /**
   * Validate name field.
   * @param {string} value
   * @returns {string} Error message or empty string
   */
  function validateName(value) {
    var trimmed = value.trim();
    if (!trimmed) {
      return 'Name is required';
    }
    if (trimmed.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return '';
  }

  /**
   * Validate email/username field.
   * @param {string} value
   * @returns {string} Error message or empty string
   */
  function validateEmail(value) {
    var trimmed = value.trim();
    if (!trimmed) {
      return 'Email or username is required';
    }
    if (trimmed.indexOf('@') !== -1) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmed)) {
        return 'Please enter a valid email address';
      }
    } else if (trimmed.length < 3) {
      return 'Username must be at least 3 characters';
    }
    return '';
  }

  /**
   * Validate strict email (for sign-up).
   * @param {string} value
   * @returns {string} Error message or empty string
   */
  function validateStrictEmail(value) {
    var trimmed = value.trim();
    if (!trimmed) {
      return 'Email is required';
    }
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  /**
   * Validate password field.
   * @param {string} value
   * @returns {string} Error message or empty string
   */
  function validatePassword(value) {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  /**
   * Show or clear an error on a form field.
   * @param {string} fieldId  - ID of the .auth__field container
   * @param {string} errorId  - ID of the .auth__error element
   * @param {string} message  - Error text (empty to clear)
   */
  function showFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);

    if (field) {
      if (message) {
        field.classList.add('auth__field--error');
      } else {
        field.classList.remove('auth__field--error');
      }
    }
    if (error) {
      error.textContent = message || '';
    }
  }

  // ============================================================
  // Password Visibility Toggle
  // ============================================================

  function initPasswordToggle(toggleId, inputId) {
    var toggle = document.getElementById(toggleId);
    var input = document.getElementById(inputId);
    if (!toggle || !input) return;

    toggle.addEventListener('click', function () {
      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggle.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password'
      );

      var eyeIcon = toggle.querySelector('.icon-eye');
      var eyeOffIcon = toggle.querySelector('.icon-eye-off');
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.style.display = isPassword ? 'none' : 'block';
        eyeOffIcon.style.display = isPassword ? 'block' : 'none';
      }
    });
  }

  // ============================================================
  // Tab Switching (Sign In ↔ Sign Up)
  // ============================================================

  function initTabs() {
    var tabSignin = document.getElementById('tab-signin');
    var tabSignup = document.getElementById('tab-signup');
    var panelSignin = document.getElementById('panel-signin');
    var panelSignup = document.getElementById('panel-signup');

    if (!tabSignin || !tabSignup || !panelSignin || !panelSignup) return;

    function activateTab(activeTab, inactiveTab, activePanel, inactivePanel) {
      activeTab.classList.add('auth__tab--active');
      activeTab.setAttribute('aria-selected', 'true');
      inactiveTab.classList.remove('auth__tab--active');
      inactiveTab.setAttribute('aria-selected', 'false');

      activePanel.classList.remove('auth__panel--hidden');
      inactivePanel.classList.add('auth__panel--hidden');
    }

    tabSignin.addEventListener('click', function () {
      activateTab(tabSignin, tabSignup, panelSignin, panelSignup);
    });

    tabSignup.addEventListener('click', function () {
      activateTab(tabSignup, tabSignin, panelSignup, panelSignin);
    });
  }

  // ============================================================
  // Sign-In Form
  // ============================================================

  function initSigninForm() {
    var form = document.getElementById('signin-form');
    if (!form) return;

    var emailInput = document.getElementById('signin-email');
    var passwordInput = document.getElementById('signin-password');
    var submitBtn = document.getElementById('signin-submit');

    // Clear errors on input
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        showFieldError('field-signin-email', 'error-signin-email', '');
      });
    }
    if (passwordInput) {
      passwordInput.addEventListener('input', function () {
        showFieldError('field-signin-password', 'error-signin-password', '');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput ? emailInput.value : '';
      var password = passwordInput ? passwordInput.value : '';

      // Validate
      var emailError = validateEmail(email);
      var passwordError = validatePassword(password);

      showFieldError('field-signin-email', 'error-signin-email', emailError);
      showFieldError('field-signin-password', 'error-signin-password', passwordError);

      if (emailError || passwordError) {
        if (emailError && emailInput) {
          emailInput.focus();
        } else if (passwordError && passwordInput) {
          passwordInput.focus();
        }
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('auth__submit--loading');

      // Simulate network delay (demo only)
      setTimeout(function () {
        var displayName = email.indexOf('@') !== -1
          ? email.split('@')[0]
          : email;
        var user = {
          email: email,
          displayName: displayName,
          initial: (displayName[0] || 'U').toUpperCase(),
          signedInAt: new Date().toISOString()
        };

        setAuthState(user);
        window.location.href = 'index.html';
      }, 1200);
    });
  }

  // ============================================================
  // Sign-Up Form
  // ============================================================

  function initSignupForm() {
    var form = document.getElementById('signup-form');
    if (!form) return;

    var nameInput = document.getElementById('signup-name');
    var emailInput = document.getElementById('signup-email');
    var passwordInput = document.getElementById('signup-password');
    var confirmInput = document.getElementById('signup-confirm');
    var submitBtn = document.getElementById('signup-submit');

    // Clear errors on input
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        showFieldError('field-signup-name', 'error-signup-name', '');
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        showFieldError('field-signup-email', 'error-signup-email', '');
      });
    }
    if (passwordInput) {
      passwordInput.addEventListener('input', function () {
        showFieldError('field-signup-password', 'error-signup-password', '');
      });
    }
    if (confirmInput) {
      confirmInput.addEventListener('input', function () {
        showFieldError('field-signup-confirm', 'error-signup-confirm', '');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = nameInput ? nameInput.value : '';
      var email = emailInput ? emailInput.value : '';
      var password = passwordInput ? passwordInput.value : '';
      var confirm = confirmInput ? confirmInput.value : '';

      // Validate all fields
      var nameError = validateName(name);
      var emailError = validateStrictEmail(email);
      var passwordError = validatePassword(password);
      var confirmError = '';

      if (!confirm) {
        confirmError = 'Please confirm your password';
      } else if (confirm !== password) {
        confirmError = 'Passwords do not match';
      }

      showFieldError('field-signup-name', 'error-signup-name', nameError);
      showFieldError('field-signup-email', 'error-signup-email', emailError);
      showFieldError('field-signup-password', 'error-signup-password', passwordError);
      showFieldError('field-signup-confirm', 'error-signup-confirm', confirmError);

      if (nameError || emailError || passwordError || confirmError) {
        // Focus first field with error
        if (nameError && nameInput) nameInput.focus();
        else if (emailError && emailInput) emailInput.focus();
        else if (passwordError && passwordInput) passwordInput.focus();
        else if (confirmError && confirmInput) confirmInput.focus();
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('auth__submit--loading');

      // Simulate network delay (demo only)
      setTimeout(function () {
        var displayName = name.trim().split(' ')[0];
        var user = {
          email: email.trim(),
          displayName: displayName,
          fullName: name.trim(),
          initial: (displayName[0] || 'U').toUpperCase(),
          signedInAt: new Date().toISOString()
        };

        setAuthState(user);
        window.location.href = 'index.html';
      }, 1200);
    });
  }

  // ============================================================
  // Signed-In Status Bar (on auth.html)
  // ============================================================

  function initSignedInStatus() {
    var statusBar = document.getElementById('auth-status');
    if (!statusBar) return;

    var auth = getAuthState();
    if (!auth) return;

    // Show the status bar
    var nameEl = document.getElementById('auth-status-name');
    if (nameEl) {
      nameEl.textContent = auth.fullName || auth.displayName || auth.email;
    }
    statusBar.removeAttribute('hidden');

    // Hide the tab toggle and forms when already signed in
    var tabs = document.querySelector('.auth__tabs');
    var panelSignin = document.getElementById('panel-signin');
    var panelSignup = document.getElementById('panel-signup');
    if (tabs) tabs.style.display = 'none';
    if (panelSignin) panelSignin.style.display = 'none';
    if (panelSignup) panelSignup.style.display = 'none';

    // Bind sign-out button
    var signoutBtn = document.getElementById('btn-signout');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', function () {
        clearAuthState();
        window.location.reload();
      });
    }
  }

  // ============================================================
  // Nav Auth State (runs on any page with the avatar button)
  // ============================================================

  function updateNavAuthState() {
    var avatar = document.getElementById('btn-profile');
    if (!avatar) return;

    var auth = getAuthState();

    if (auth) {
      // Signed in — show user initial
      avatar.textContent = auth.initial || 'U';
      avatar.setAttribute('aria-label', 'Signed in as ' + (auth.displayName || 'User'));
      avatar.onclick = function () {
        window.location.href = 'auth.html';
      };
    } else {
      // Not signed in — show person icon and link to auth
      avatar.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
        'style="width:16px;height:16px;">' +
        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="12" cy="7" r="4"/>' +
        '</svg>';
      avatar.setAttribute('aria-label', 'Sign in');
      avatar.onclick = function () {
        window.location.href = 'auth.html';
      };
    }
  }

  // ============================================================
  // Placeholder Features (social, forgot)
  // ============================================================

  function initPlaceholders() {
    // Social sign-in buttons — UI only
    var socialBtns = document.querySelectorAll('.auth__social-btn');
    for (var i = 0; i < socialBtns.length; i++) {
      socialBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
      });
    }

    // Forgot password
    var forgotLink = document.getElementById('link-forgot');
    if (forgotLink) {
      forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
      });
    }
  }

  // ============================================================
  // Initialize
  // ============================================================

  function init() {
    // Auth page features
    initTabs();
    initPasswordToggle('signin-password-toggle', 'signin-password');
    initPasswordToggle('signup-password-toggle', 'signup-password');
    initSigninForm();
    initSignupForm();
    initSignedInStatus();
    initPlaceholders();

    // Nav auth state (works on any page with btn-profile)
    updateNavAuthState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
