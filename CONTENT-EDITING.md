# Editing Website Content (No Coding Needed)

This site is hosted on GitHub Pages, which only serves plain files — there's
no real "backend" server it can talk to. To still let you edit the important
business info (phone, hours, services, FAQ, etc.) without touching code, the
site reads that content from a **Google Sheet** every time a page loads. If
the sheet is unreachable for any reason, every page just falls back to its
normal built-in text — nothing ever breaks.

## One-time setup (takes about 5 minutes)

### 1. Create your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new blank
   spreadsheet**.
2. Open **File → Import → Upload**, and upload the file
   [`content-template.csv`](content-template.csv) from this project.
3. When asked how to import, choose **Replace current sheet**.

You now have a two-column sheet: `key` and `value`. Every row is one piece of
text on the website. **Never rename or delete anything in the `key` column**
— that's how the site finds each piece of content. Only edit the `value`
column.

### 2. Publish the sheet so the website can read it

1. In Google Sheets: **File → Share → Publish to web**.
2. Under "Link", make sure the correct sheet (tab) is selected.
3. Change the format dropdown from "Web page" to **Comma-separated values
   (.csv)**.
4. Click **Publish**, and confirm.
5. Copy the URL it gives you — it looks like:
   `https://docs.google.com/spreadsheets/d/e/XXXXXXXXXXXX/pub?output=csv`

### 3. Connect the website to your sheet

1. Open `js/content.js` in this project.
2. Find this line near the top:
   ```js
   var SHEET_CSV_URL = '';
   ```
3. Paste your published URL between the quotes:
   ```js
   var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/XXXXXXXXXXXX/pub?output=csv';
   ```
4. Save the file, commit, and push to GitHub as usual.

That's it — the site is now live-connected to your sheet.

## Editing content going forward

Just open your Google Sheet, change the text in the `value` column, and
refresh the website. **No commit, no push, no waiting for a deploy** — the
page fetches the sheet fresh every time someone visits, so changes appear
immediately (it can take Google a minute or two to refresh its own published
copy after you save).

## What you can edit

| Sheet keys | What it controls |
|---|---|
| `contact_phone`, `contact_fax`, `contact_email`, `contact_address` | Shown in the header, footer, and contact pages on every page |
| `contact_phone_href`, `contact_email_href` | The actual `tel:`/`mailto:` links behind the phone/email — keep these in the exact format shown (`tel:+61...`, `mailto:...`) |
| `hours_mon` … `hours_sun`, `hours_summary`, `hours_afterhours_note` | Regular opening hours shown on the homepage |
| `afterhours_weekday`, `afterhours_weekend` | Hours shown on the dedicated After Hours page |
| `fees_note` | The billing/fees paragraph on the homepage |
| `svc1_title`/`svc1_desc` … `svc10_title`/`svc10_desc` | The 10 general services (shown on both the homepage and Services page) |
| `spc1_title`/`spc1_desc` … `spc5_title`/`spc5_desc` | The 5 Specialist Services |
| `ah1_title`/`ah1_desc` … `ah5_title`/`ah5_desc` | The 5 Allied Health Services |
| `faq1_q` … `faq7_q` | All 7 FAQ questions (homepage and Contact page) |
| `faq1_a`, `faq2_a`, `faq5_a`, `faq6_a`, `faq7_a` | 5 of the 7 FAQ answers |

### What's intentionally NOT in the sheet

- **FAQ answers #3 and #4** ("Is care available outside these hours?" and
  "How do I make an appointment?") contain live links (to the After Hours
  page, HotDoc, and your phone number). Editing these from a plain text
  sheet would silently break those links, so they're edited directly in the
  HTML instead — ask for help if they need to change.
- **Adding or removing an entire service/FAQ card** isn't supported by the
  sheet — the number of cards is fixed in the page's HTML. The sheet can
  only change the *text* of the existing cards. Adding a new card needs a
  small code change.
- Page headings, navigation labels, and everything not listed in the table
  above are still plain text in the HTML files, same as before.

## Troubleshooting

- **Nothing on the site is updating** — double-check the published CSV URL
  in `js/content.js` is correct, and that you published the *value* column
  correctly (open the URL directly in a browser — it should download or
  show plain comma-separated text, not a sign-in page).
- **A specific row isn't working** — the `key` in your sheet must match
  exactly (no extra spaces, correct spelling) one of the keys listed above.
- Check your browser's console (F12) on the live site — if the sheet can't
  be reached, you'll see a friendly warning there, and the page will just
  show its normal default text.
