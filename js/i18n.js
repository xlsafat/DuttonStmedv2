/*
 * Language engine — English / Arabic switcher with RTL support.
 *
 * How it coordinates with the rest of the site:
 * - Every translatable element carries data-i18n="<key>" (text/markup) and/or
 *   data-i18n-attr="attr:key;attr2:key2" (attributes like placeholder).
 * - The first time an element is translated, its current English markup is
 *   cached in memory — this captures whatever is already on screen, which
 *   may already include content.js's Google Sheet text. Switching back to
 *   English restores that cache.
 * - content.js (the Sheet-driven content loader) is language-aware: it skips
 *   writing to the DOM while Arabic is active, and exposes
 *   window.DSMP_reapplySheetContent() so this file can ask it to re-apply
 *   the live Sheet text the moment the visitor switches back to English
 *   (instead of relying on a possibly-stale cached snapshot).
 * - js/lang-init.js sets the lang/dir attributes before paint, so there's no
 *   flash of the wrong *direction*. The text itself swaps once this file and
 *   the dictionary (js/i18n-ar.js) have loaded — a brief, normal moment of
 *   English text is expected on a fresh load with Arabic already saved.
 */
(function () {
  'use strict';

  var KEY = 'dsmp-language';
  var DICT = window.DSMP_AR_DICT || {};
  var originalHtml = new WeakMap();
  var originalAttrs = new WeakMap();

  function getLang() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'ar' || v === 'en') return v;
    } catch (e) {}
    return 'en';
  }

  function setLang(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {}
  }

  function translateTextNodes(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!originalHtml.has(el)) {
        originalHtml.set(el, el.innerHTML);
      }
      if (lang === 'ar') {
        var translation = DICT[key];
        if (translation !== undefined) {
          el.innerHTML = translation;
        }
      } else {
        el.innerHTML = originalHtml.get(el);
      }
    });
  }

  function translateAttrs(lang) {
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      var pairs = spec.split(';').filter(Boolean);
      var cache = originalAttrs.get(el);
      if (!cache) {
        cache = {};
        originalAttrs.set(el, cache);
      }
      pairs.forEach(function (pair) {
        var idx = pair.indexOf(':');
        var attr = pair.slice(0, idx);
        var key = pair.slice(idx + 1);
        if (cache[attr] === undefined) {
          cache[attr] = el.getAttribute(attr) || '';
        }
        if (lang === 'ar' && DICT[key] !== undefined) {
          el.setAttribute(attr, DICT[key]);
        } else {
          el.setAttribute(attr, cache[attr]);
        }
      });
    });
  }

  function updateSwitcherUI(lang) {
    var toggle = document.getElementById('lang-toggle');
    if (!toggle) return;
    toggle.querySelectorAll('[data-lang-option]').forEach(function (opt) {
      var isActive = opt.getAttribute('data-lang-option') === lang;
      opt.classList.toggle('is-active', isActive);
      opt.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    var label = toggle.querySelector('[data-lang-label]');
    if (label) {
      label.textContent = lang === 'ar' ? 'AR' : 'EN';
    }
    var btn = document.getElementById('lang-toggle-btn');
    if (btn) {
      btn.setAttribute('aria-label', lang === 'ar' ? 'اللغة: العربية' : 'Language: English');
    }
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    translateTextNodes(lang);
    translateAttrs(lang);

    if (lang === 'en' && window.DSMP_reapplySheetContent) {
      window.DSMP_reapplySheetContent();
    }

    updateSwitcherUI(lang);
  }

  function closeMenu() {
    var menu = document.getElementById('lang-toggle-menu');
    var btn = document.getElementById('lang-toggle-btn');
    if (menu) menu.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function init() {
    applyLang(getLang());

    document.querySelectorAll('[data-lang-option]').forEach(function (optBtn) {
      optBtn.addEventListener('click', function () {
        var chosen = optBtn.getAttribute('data-lang-option');
        setLang(chosen);
        applyLang(chosen);
        closeMenu();
      });
    });

    var toggleBtn = document.getElementById('lang-toggle-btn');
    var menu = document.getElementById('lang-toggle-menu');
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

    window.addEventListener('storage', function (e) {
      if (e.key === KEY) applyLang(getLang());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
