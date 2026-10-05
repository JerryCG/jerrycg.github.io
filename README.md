# Guo (Jerry) Cheng — Personal Website

Minimal academic personal site for [jerrycg.github.io](https://jerrycg.github.io).

Built with plain **HTML / CSS / JS** (no build step). Content is based on the CV in `doc/`.

**Languages:** English (default) and 简体中文 via offline client-side i18n (`js/i18n.js`) — no Google Translate, works in mainland China. Preference is stored in `localStorage`.

**i18n maintenance:** Translations are hardcoded in `js/i18n.js`. Whenever English site copy changes, update the matching keys in both `en` and `zh-CN` packs.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
# Python
python -m http.server 8000

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages

This repo is a **user site** (`username.github.io`).

1. Push `main` to GitHub (`origin`).
2. In the repo: **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main` → folder `/ (root)`.
4. After a minute or two: [https://jerrycg.github.io](https://jerrycg.github.io)

## Edit content

| What | Where |
|------|--------|
| Bio, education, research, contact | `index.html` |
| Seminars | `data/seminars.json` and `seminars.html` |
| Colors, spacing, type, light/dark | `css/styles.css` |
| Scroll / nav / theme toggle | `js/main.js` |
| CV PDF | `doc/CV_Guo_Jerry_Cheng_YYYYMMDD.pdf` |
| FATF slides | `doc/fatf_slides_YYYYMMDD.pdf` |
| FATF data | `doc/FATF_4th_round_numeric_ratings_2025Jul.csv` |

## Site map

- **Home** — name, role, short intro, profiles  
- **About** — bio + education  
- **Research** — publication, working papers, WIP, thesis  
- **Seminars** (`seminars.html`) — fall talks from the series in `seminars.txt`
- **Data** (`data.html`) — curated/assembled datasets by theme (separate page) 
- **CV** — PDF download  

## Seminar reminders

`scripts/seminar-reminders.ps1` emails `chengguojerry@gmail.com` the day before each event in `data/seminars.json` (Pacific time). GitHub Actions runs it daily (`.github/workflows/seminar-reminders.yml`).

Add two repository secrets, then push to `main`:

| Secret | Value |
|--------|--------|
| `SMTP_USER` | `chengguojerry@gmail.com` |
| `SMTP_PASSWORD` | A Gmail [app password](https://myaccount.google.com/apppasswords) |

Until those secrets exist, the workflow cannot send mail. Check the selection locally with:

```powershell
.\scripts\seminar-reminders.ps1 -DryRun -AsOf 2026-10-04
```

- **Footer** — all email addresses (LinkedIn / GitHub / Scholar / ORCID appear once in the hero)  

## License

See [LICENSE](LICENSE).

