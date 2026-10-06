/* SETTINGS. These are the only lines you need to edit. */
window.HHS_CONFIG={
  /* 1) Paste your Google Sheet link here (File > Share > Publish to web > choose the "Events" sheet > "Comma-separated values (.csv)" > Publish > copy the link).
        Leave it empty ("") to show the built-in copy of the calendar. */
  sheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJy7dkZLKrcHezmM-jyiq2fX1UR5a0JDSFHv0TsH3wSGWDL63UEU6lKEviFd1uipgOs79yM2t441Vj/pub?gid=1633613946&single=true&output=csv",
  /* 2) Optional: a link where viewers can send you an event suggestion (a Google Form link, or mailto:calendar@yourschool.edu).
        Leave it empty ("") to hide the "Suggest an event" button. */
  submitUrl: "https://script.google.com/macros/s/AKfycbwkD4eCi1vM9KnCLEBlix1B-jpdzXECAysq-3zbfe_wY4wl0EpEv3VM3Dq05VwS0eLJ/exec",
  /* 3) Link of the Google Sheet tab that receives the Form answers ("Form Responses 1"), published the same way as above (CSV).
        Only rows whose "Add to calendar" column says Yes appear on the calendar. Leave empty ("") if you are not using it yet. */
  formSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJy7dkZLKrcHezmM-jyiq2fX1UR5a0JDSFHv0TsH3wSGWDL63UEU6lKEviFd1uipgOs79yM2t441Vj/pub?gid=269063945&single=true&output=csv",
  /* 4) Only if the Form answers show dates like 10/11/2026: "dmy" = day/month/year (default), "mdy" = month/day/year. */
  dateOrder: "mdy"
};
