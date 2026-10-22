/*
 * Theme bootstrap — must run before CSS paints to avoid a flash of the
 * wrong theme. Deliberately tiny and dependency-free (no jQuery) so it can
 * execute synchronously as the very first thing in <head>, before the
 * stylesheet link. The full interactive logic (toggle UI, live re-check)
 * lives in js/theme.js, loaded later with the other scripts.
 */
(function () {
  'use strict';
  var KEY = 'dsmp-theme-preference';
  try {
    var pref = localStorage.getItem(KEY);
    if (pref !== 'light' && pref !== 'dark' && pref !== 'auto') {
      pref = 'auto';
    }
    var theme = pref;
    if (pref === 'auto') {
      var hour = new Date().getHours();
      theme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — default to light,
    // same as every page already looked before this feature existed.
  }
})();
