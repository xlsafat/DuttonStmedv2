/*
 * Language bootstrap — sets the RTL/LTR direction and lang attribute as
 * early as possible (before the stylesheet applies) so there's no flash of
 * the wrong text direction. Must stay dependency-free so it can run
 * synchronously inline in <head>, same pattern as theme-init.js.
 * The actual text swap happens later in js/i18n.js, once the DOM and the
 * translation dictionary have loaded.
 */
(function () {
  'use strict';
  try {
    var lang = localStorage.getItem('dsmp-language');
    if (lang !== 'ar') { lang = 'en'; }
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  } catch (e) {}
})();
