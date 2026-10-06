# HHS Academic & Event Calendar : Google Sheet edition

Viewers only **see** the calendar. **You** add, change and remove events in a Google Sheet, and the calendar updates by itself.

## Files
| File | What it is | Edit? |
|---|---|---|
| `HHS-Calendar-Events-Template.xlsx` | The sheet to upload to Google Sheets (already holds all 2026-27 events) | Upload once |
| `config.js` | **Your settings**: Events sheet link, Form responses link, Suggest-an-event link | Yes, once |
| `index.html`, `css/styles.css`, `js/app.js` | The website | No |
| `data/fallback.js` | Built-in copy, used only if the sheet cannot be reached | No |

## Step 1. Create your Google Sheet
1. Open Google Drive → **New → File upload** → choose `HHS-Calendar-Events-Template.xlsx`.
2. Open it with **Google Sheets** (right-click → Open with → Google Sheets), then **File → Save as Google Sheets**.
3. The sheet called **Events** is the calendar. Read the **Instructions** and **Lists** sheets once.
4. Keep the sharing of the sheet itself on **Restricted** so only you can edit.

## Step 2. Publish the Events sheet (read-only link)
1. **File → Share → Publish to web**.
2. In the first list choose **Events** (not "Entire document"). In the second choose **Comma-separated values (.csv)**.
3. Press **Publish** and copy the link.
4. Open `config.js` in Notepad and paste the link between the quotes of `sheetUrl: ""`. Save. (The form-answers link goes in `formSheetUrl`, see "Event suggestions" below.)

## Step 3. Put the website online
Upload the whole folder to GitHub (Settings → Pages → Deploy from a branch → main / root). Your link is `https://YOURNAME.github.io/REPOSITORY/`.
In **Google Sites**: Insert → Embed → By URL → paste the link, height about **1300 px**.

## Everyday work: change events
Edit the **Events** sheet. One row = one event.
- Dates: `YYYY-MM-DD` (e.g. 2026-10-15). End date only for ranges.
- Type, Stream, Include weekends, Internal: use the drop-downs.
- Campuses / Classes: leave empty for "all", otherwise type names from the **Lists** sheet, separated by commas.
- To delete an event, delete its row. Changes show on the calendar within about 5 minutes (Google refreshes published sheets slowly).

## Classes and campuses
Every class has its own name: Pre-Nur, Nur, Prep, I, II, III ... XI, IX-AKU, X-AKU, XI-AKU. In the **Classes** column type single classes or ranges, separated by commas, for example `IV`, `III-V, VIII` or `IX-AKU`. `Pre-School` means Pre-Nur, Nur and Prep. Empty = all classes.
- Which classes each campus has is set in `js/app.js` (`CAMPUS_CLASSES`, STEP 3) and listed on the **Lists** sheet of the template.
- When a viewer picks a campus, the **Class** list shows only that campus's classes, and an event meant for classes the campus does not have (and with no campus named) is hidden for that campus.
- An event with a campus typed in the **Campuses** column always shows for that campus.
- If a campus opens a new class, add its letter to that campus in `CAMPUS_CLASSES`.

## Internal events
Set **Internal = Yes** for events meant for campus/internal use (e.g. head-office events for a campus).
- Viewers do **not** see them by default.
- They tick the **🔒 Internal** button above the calendar to see them together with the other events. Internal events carry an "Internal" tag. The button only appears when at least one Internal event exists.
- **Not a security lock:** a published sheet can be read by anyone with the link, internal rows included. Do not put confidential information in it. If you need real privacy, keep those events in a separate, restricted sheet.

## New academic year
No new file needed: add rows dated July of the new year onward. The **Academic year** list updates by itself. Check Eid, Chehlum and Ramazan dates every year.

## Event suggestions from the Google Form (already linked)
Your form "Suggest An Event" is set in `config.js` (`suggestUrl`), so a **Suggest an event** button appears on the calendar. Answers become events like this:

1. **Link the form to a sheet:** open the form → **Responses** tab → **Link to Sheets** → choose **Select existing spreadsheet** → pick your calendar sheet. A tab called **Form Responses 1** is created next to **Events**.
2. **Add the approval column:** in **Form Responses 1**, in the first empty column to the right of the form columns, type the heading **Add to calendar**. Select the cells below it (e.g. K2:K1000) → **Insert → Dropdown** → items **Yes** and **No**.
3. **Fix the date format (recommended):** click the column letters of *Start Date* and *End Date* → **Format → Number → Custom date and time** → choose `2026-12-31` style (yyyy-mm-dd). This removes any day/month confusion.
4. **Publish that tab:** **File → Share → Publish to web** → choose **Form Responses 1** and **CSV** → Publish → copy the link into `formSheetUrl` in `config.js`.

**How it works every day:** a suggestion arrives as a new row. Check it (fix typos right in the row if needed), then set **Add to calendar = Yes**. It appears on the calendar within about 5 minutes. Set it to **No** or delete the row and it disappears. Rows with an empty or No value are never shown.

The page understands your form's exact answers: *Type* (Sports/Others, Holiday, Academic, Event, Exams), *Streams* (Both, Matric, O Levels), *Campus* (every campus ticked), *Class* (single classes such as I, II, IX AKU-EB are grouped into Pre-School, I-II, III-V, VI-VIII, IX-XI), *Include weekends* and *Internal Campus Event* (Yes = shown only when viewers tick **Internal**). Because the form needs an End Date, one-day events simply use the same date twice.

Tips: add an optional question "Your name / campus / contact" to the form so you can follow up (the calendar ignores it). If dates ever look swapped (e.g. 4 Mar shown as 3 Apr), set `dateOrder` in `config.js` to `"mdy"` or `"dmy"`.

## If something looks wrong
Open the calendar link with `?check=1` at the end (e.g. `.../index.html?check=1`). A note under the calendar shows where the data came from (sheet / saved copy / built-in copy) and lists any rows that could not be read (bad date, unknown campus name).
- "Built-in copy" = `sheetUrl` is empty or wrong.
- "Last saved copy" = the sheet could not be reached; the page shows the last good version from that browser.
