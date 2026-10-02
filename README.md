# HHS Academic & Event Calendar

A calendar website that needs **no server and no database**. Everything is plain files.

## What each file does
| File | Purpose | Edit it? |
|---|---|---|
| `index.html` | The page layout | Rarely |
| `css/styles.css` | Colours and look | Only to change the design |
| `js/app.js` | The program (numbered STEP comments) | Rarely |
| `data/years.js` | The list of academic years | When a new year is added |
| `data/2026-27.js` | **All events of that year** | **Yes, every year** |

One data file per year means old years are never lost: they stay in the folder and appear in the **Academic year** list on the page.

## Change events (the easy way, no code)
1. Open the page. Use **+ Add event**, **Edit**, **Remove**, or **Import / Export events** (Excel template or PDF).
2. These changes are saved in *your browser only*. To make them permanent for everyone:
   **Import / Export events → Step 3 → Download data file** and replace the file in the `data` folder.
3. Press **Clear** when the page asks, so nothing shows twice.

## Change events (by hand)
Open `data/2026-27.js` in Notepad. One event per line:

    {"d":"2026-10-15","t":"Science Fair","k":"E","c":["OLG","OLC"],"lv":"cd"},

- `d` start date (YYYY-MM-DD)   `e` end date (optional)   `we`:1 = a range also covers Sat/Sun
- `t` title   `k` type: A Academic, X Exams, H Holiday, E Event, S Sports/Other
- `st` stream: "OL" or "M" (leave out = both)   `c` campus codes (leave out = all)   `lv` class letters (leave out = all)
- Every line ends with a comma **except the last one**. Keep the quotes. To delete an event, delete its line.
- Campus codes and class letters are listed in `js/app.js` (STEP 3 and STEP 4).

## Start a new academic year
1. Open the page, press **Import / Export events**, Step 1: choose the year (e.g. 2027), tick *Copy this year's calendar forward* if you want a starting point, press **Download new-year files**.
2. You receive `2027-28.js` and `years.js`. Put **both** into the `data` folder (replace `years.js`).
3. Open the page: **Academic year** now offers 2027-28. Check Eid, Chehlum and Ramazan dates (marked "(verify date)").
4. Add the real events with the Excel template or a PDF upload, then download the data file again (Step 3) and replace it.

The page opens on the year that contains today's date automatically.

## Publish on GitHub Pages
1. Create a **public** repository and upload everything in this folder (keep the folders).
2. **Settings → Pages → Deploy from a branch → main / (root) → Save.**
3. Your link: `https://YOURNAME.github.io/REPOSITORY/`
4. To update later: open the data file on GitHub, click the pencil icon, edit, **Commit changes**.

## Show it in Google Sites
**Insert → Embed → By URL** and paste your GitHub Pages link. Set the box height to about **1300 px**. Inside Google Sites the page switches to a fixed-height layout (click a day for details) and hides the Add / Import buttons. Open the plain link to use those.

## Good habits
- Keep a copy of the whole folder (GitHub keeps the history for you).
- Do not edit `js/app.js` unless you know JavaScript; ask for help instead.
- Browser-saved changes live only in that browser until you download the data file.
