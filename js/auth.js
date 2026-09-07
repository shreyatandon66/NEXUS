/* ============================================================
   NEXUS Authentication Logic
   Handles sign-in form validation, password toggle, demo
   localStorage auth, and nav auth-state updates.

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

  // ============================================================
  // Validation
  // ============================================================

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
   * @param {string} fieldId  - ID of the .signin__field container
   * @param {string} errorId  - ID of the .signin__error element
   * @param {string} message  - Error text (empty to clear)
   */
  function showFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);

    if (field) {
      if (message) {
        field.classList.add('signin__field--error');
      } else {
        field.classList.remove('signin__field--error');
      }
    }
    if (error) {
      error.textContent = message || '';
    }
  }

  // ============================================================
  // Password Visibility Toggle
  // ============================================================

  function initPasswordToggle() {
    var toggle = document.getElementById('password-toggle');
    var input = document.getElementById('signin-password');
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
  // Sign-In Form
  // ============================================================

  function initForm() {
    var form = document.getElementById('signin-form');
    if (!form) return;

    var emailInput = document.getElementById('signin-email');
    var passwordInput = document.getElementById('signin-password');
    var submitBtn = document.getElementById('signin-submit');

    // Clear errors on input
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        showFieldError('field-email', 'error-email', '');
      });
    }
    if (passwordInput) {
      passwordInput.addEventListener('input', function () {
        showFieldError('field-password', 'error-password', '');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput ? emailInput.value : '';
      var password = passwordInput ? passwordInput.value : '';

      // Validate both fields
      var emailError = validateEmail(email);
      var passwordError = validatePassword(password);

      showFieldError('field-email', 'error-email', emailError);
      showFieldError('field-password', 'error-password', passwordError);

      if (emailError || passwordError) {
        // Focus first field with an error
        if (emailError && emailInput) {
          emailInput.focus();
        } else if (passwordError && passwordInput) {
          passwordInput.focus();
        }
        return;
      }

      // --- Loading state ---
      submitBtn.disabled = true;
      submitBtn.classList.add('signin__submit--loading');

      // Simulate network delay (demo only)
      setTimeout(function () {
        // Build demo user object
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
  // Signed-In Status Bar (on signin.html)
  // ============================================================

  function initSignedInStatus() {
    var statusBar = document.getElementById('signin-status');
    if (!statusBar) return;

    var auth = getAuthState();
    if (!auth) return;

    // Show the status bar
    var nameEl = document.getElementById('signin-status-name');
    if (nameEl) {
      nameEl.textContent = auth.displayName || auth.email;
    }
    statusBar.removeAttribute('hidden');

    // Bind sign-out button
    var signoutBtn = document.getElementById('btn-signout');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', function () {
        clearAuthState();
        // Hide status bar and re-enable form
        statusBar.setAttribute('hidden', '');
        updateNavAuthState();
      });
    }
  }

  // ============================================================
  // Nav Auth State (runs on any page with the avatar)
  // ============================================================

  function updateNavAuthState() {
    var avatar = document.getElementById('btn-profile');
    if (!avatar) return;

    var auth = getAuthState();

    if (auth) {
      // Signed in — show user initial
      avatar.textContent = auth.initial || 'U';
      avatar.setAttribute('aria-label', 'Signed in as ' + auth.displayName);
      avatar.onclick = function () {
        window.location.href = 'signin.html';
      };
    } else {
      // Not signed in — show person icon and link to signin
      avatar.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
        'style="width:16px;height:16px;">' +
        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="12" cy="7" r="4"/>' +
        '</svg>';
      avatar.setAttribute('aria-label', 'Sign in');
      avatar.onclick = function () {
        window.location.href = 'signin.html';
      };
    }
  }

  // ============================================================
  // Placeholder Features (social, forgot, create account)
  // ============================================================

  function initPlaceholders() {
    // Social sign-in buttons — UI only
    var socialBtns = document.querySelectorAll('.signin__social-btn');
    for (var i = 0; i < socialBtns.length; i++) {
      socialBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        // No-op: placeholder only
      });
    }

    // Forgot password
    var forgotLink = document.getElementById('link-forgot');
    if (forgotLink) {
      forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
      });
    }

    // Create account
    var createLink = document.getElementById('link-create-account');
    if (createLink) {
      createLink.addEventListener('click', function (e) {
        e.preventDefault();
      });
    }
  }

  // ============================================================
  // Initialize
  // ============================================================

  function init() {
    initPasswordToggle();
    initForm();
    initSignedInStatus();
    initPlaceholders();
    updateNavAuthState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
