/*
 * Theme engine — Auto/Light/Dark preference, persisted in localStorage.
 * "Auto" follows the visitor's local device time: 6:00 AM–5:59 PM is Light,
 * 6:00 PM–5:59 AM is Dark. Re-checked every minute and whenever the tab
 * regains focus, so a page left open overnight updates itself without a
 * reload. The initial (pre-paint) theme is set by js/theme-init.js — this
 * file takes over from there for everything interactive.
 */
(function () {
  'use strict';

  var KEY = 'dsmp-theme-preference';
  var CHECK_INTERVAL_MS = 60 * 1000;

  function getPreference() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark' || v === 'auto') {
        return v;
      }
    } catch (e) {}
    return 'auto';
  }

  function setPreference(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {}
  }

  function computeAutoTheme() {
    var hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  }

  function effectiveTheme(pref) {
    return pref === 'auto' ? computeAutoTheme() : pref;
  }

  function updateToggleUI(pref, theme) {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.setAttribute('aria-label', 'Theme: ' + pref + ' (currently showing ' + theme + ')');
    }

    var icon = toggle.querySelector('[data-theme-icon]');
    if (icon) {
      icon.className = 'theme-toggle-icon ' + (theme === 'dark' ? 'icofont-moon' : 'icofont-sun');
    }

    toggle.querySelectorAll('[data-theme-option]').forEach(function (opt) {
      var isActive = opt.getAttribute('data-theme-option') === pref;
      opt.classList.toggle('is-active', isActive);
      opt.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  function applyTheme(pref) {
    var theme = effectiveTheme(pref);
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleUI(pref, theme);
  }

  function closeMenu() {
    var menu = document.getElementById('theme-toggle-menu');
    var btn = document.getElementById('theme-toggle-btn');
    if (menu) menu.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function init() {
    applyTheme(getPreference());

    document.querySelectorAll('[data-theme-option]').forEach(function (optBtn) {
      optBtn.addEventListener('click', function () {
        var chosen = optBtn.getAttribute('data-theme-option');
        setPreference(chosen);
        applyTheme(chosen);
        closeMenu();
      });
    });

    var toggleBtn = document.getElementById('theme-toggle-btn');
    var menu = document.getElementById('theme-toggle-menu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = menu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && e.target !== toggleBtn) {
          closeMenu();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeMenu();
          toggleBtn.focus();
        }
      });
    }

    // Auto mode needs to cross the 6am/6pm boundary live, without a reload.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) applyTheme(getPreference());
    });
    setInterval(function () {
      applyTheme(getPreference());
    }, CHECK_INTERVAL_MS);

    // Keep every open tab in sync when the preference changes in one of them.
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) applyTheme(getPreference());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
