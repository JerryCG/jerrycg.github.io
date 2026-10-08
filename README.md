# Guo (Jerry) Cheng — Personal Website

Minimal academic personal site for [jerrycg.github.io](https://jerrycg.github.io).

Built with plain **HTML / CSS / JS** (no build step). Content is based on the CV in `doc/`.

**Languages:** English (default) and 简体中文. Site chrome (nav, buttons, bio) is offline in `js/i18n.js`. Seminar titles and abstracts are translated live when you switch to Chinese. Preference is stored in `localStorage`.

**i18n maintenance:** For pages other than seminar *content*, update both `en` and `zh-CN` packs in `js/i18n.js` when English copy changes. Do not add per-talk Chinese to the seminar list.

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
| Seminars | `seminars.txt` (series list), `seminars.html`, `js/seminar-live.js` |
| Colors, spacing, type, light/dark | `css/styles.css` |
| Scroll / nav / theme toggle | `js/main.js` |
| CV PDF | `doc/CV_Guo_Jerry_Cheng_YYYYMMDD.pdf` |
| FATF slides | `doc/fatf_slides_YYYYMMDD.pdf` |
| FATF data | `doc/FATF_4th_round_numeric_ratings_2025Jul.csv` |

## Site map

- **Home** — name, role, short intro, profiles  
- **About** — bio + education  
- **Research** — publication, working papers, WIP, thesis  
- **Seminars** (`seminars.html`) — talks loaded live from the series in `seminars.txt`
- **Data** (`data.html`) — curated/assembled datasets by theme (separate page) 
- **CV** — PDF download  

- **Footer** — all email addresses (LinkedIn / GitHub / Scholar / ORCID appear once in the hero)  

## License

See [LICENSE](LICENSE).

