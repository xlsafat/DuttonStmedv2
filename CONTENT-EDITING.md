# Editing Website Content

This site's content (phone, hours, services, FAQ, etc.) is written directly
into the HTML files — it used to be pulled live from a Google Sheet, but that
was removed because a stale, out-of-date Sheet kept silently overriding
correct website text with old information.

## How to make a change now

There's no sheet to edit anymore. To change any text on the site (hours, a
phone number, a service description, a FAQ answer, anything), either:

- **Ask for help making the change** — describe what should change and
  where, and it gets edited directly in the HTML, tested, and committed.
- **Edit the HTML yourself**, if you're comfortable with that — the text you
  want to change is usually visible as plain text inside the relevant
  `.html` file (`index.html`, `service.html`, `afterhours.html`, etc.).

Either way, a change needs to be **committed and pushed to GitHub** to go
live (unlike the old sheet, which updated instantly) — ask for a push once a
change is made, or run `git push` yourself if you're doing it directly.

## Why this changed

The sheet was meant to let non-technical edits happen without touching code.
In practice, rows were often left with old values (wrong hours, an old email
address, etc.) for weeks without being updated, and because the sheet always
took priority over the website's own text, those stale rows kept silently
showing the wrong information to visitors — including once during active
hours information that could matter in a genuine emergency. Static text in
the code can't go stale the same way: every change is deliberate, reviewed,
and takes effect for everyone at once.
