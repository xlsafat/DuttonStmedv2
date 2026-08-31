/*
 * Content loader — pulls editable site content from a published Google Sheet
 * and fills it into any element marked with data-content-key.
 *
 * Nothing here can break the site: if the sheet URL below isn't set yet, or
 * the fetch fails for any reason (offline, sheet unpublished, typo), every
 * page simply keeps showing its normal hard-coded text. This only ever
 * overwrites content after a successful, valid response.
 *
 * SETUP — see CONTENT-EDITING.md in the project root for full instructions.
 * The short version:
 *   1. Make a copy of the Google Sheet template (columns: key, value).
 *   2. File > Share > Publish to web > select the sheet > CSV > Publish.
 *   3. Paste the published CSV URL below.
 */
(function () {
  'use strict';

  // ====================== CONFIGURE THIS ======================
  var SHEET_CSV_URL = '';
  // ==============================================================

  if (!SHEET_CSV_URL) {
    return;
  }

  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      var next = text[i + 1];

      if (inQuotes) {
        if (c === '"' && next === '"') {
          field += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && next === '\n') {
          i++;
        }
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += c;
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function toDataMap(rows) {
    var data = {};
    if (!rows.length) {
      return data;
    }
    var header = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    var keyCol = header.indexOf('key');
    var valueCol = header.indexOf('value');
    if (keyCol === -1 || valueCol === -1) {
      return data;
    }
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var key = (r[keyCol] || '').trim();
      if (!key) {
        continue;
      }
      data[key] = (r[valueCol] || '').trim();
    }
    return data;
  }

  function applyContent(data) {
    document.querySelectorAll('[data-content-key]').forEach(function (el) {
      var key = el.getAttribute('data-content-key');
      var value = data[key];
      if (value === undefined || value === '') {
        return;
      }
      el.textContent = value;
    });

    document.querySelectorAll('[data-content-attr]').forEach(function (el) {
      // Format: data-content-attr="href:contact_phone_href"
      var spec = el.getAttribute('data-content-attr');
      var parts = spec.split(':');
      var attr = parts[0];
      var key = parts[1];
      var value = data[key];
      if (value === undefined || value === '') {
        return;
      }
      el.setAttribute(attr, value);
    });
  }

  fetch(SHEET_CSV_URL, { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Sheet fetch failed: ' + res.status);
      }
      return res.text();
    })
    .then(function (text) {
      var data = toDataMap(parseCSV(text));
      applyContent(data);
    })
    .catch(function (err) {
      // Silent by design for visitors; visible in devtools for whoever set it up.
      console.warn('[content.js] Using default page content —', err.message);
    });
})();
