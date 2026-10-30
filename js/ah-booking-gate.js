/*
 * Shows/hides the After Hours "Book Online" button based on whether the
 * After Hours service is currently running, using the visitor's own
 * device-local time (same convention as js/theme.js) — no timezone is
 * hardcoded, and public holidays are NOT detected (treated as a normal
 * weekday), consistent with how this was scoped.
 *
 * Hours (must stay in sync with the After Hours table on this page):
 *   Mon-Fri  6:00 PM - 11:00 PM
 *   Sat      12:00 PM - 3:00 PM
 *   Sun      8:00 AM - 3:00 PM
 */
(function () {
  'use strict';

  var WINDOWS = {
    0: [8 * 60, 15 * 60],  // Sunday
    1: [18 * 60, 23 * 60], // Monday
    2: [18 * 60, 23 * 60], // Tuesday
    3: [18 * 60, 23 * 60], // Wednesday
    4: [18 * 60, 23 * 60], // Thursday
    5: [18 * 60, 23 * 60], // Friday
    6: [12 * 60, 15 * 60]  // Saturday
  };

  function isAfterHoursOpen() {
    var now = new Date();
    var win = WINDOWS[now.getDay()];
    var minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= win[0] && minutes < win[1];
  }

  function update() {
    var btn = document.getElementById('ah-book-online-btn');
    if (!btn) return;
    btn.hidden = !isAfterHoursOpen();
  }

  function init() {
    update();
    setInterval(update, 60000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) update();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
