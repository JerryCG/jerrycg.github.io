# Guo (Jerry) Cheng — Personal Website

Minimal academic personal site for [jerrycg.github.io](https://jerrycg.github.io).

Built with plain **HTML / CSS / JS** (no build step). Content is based on the CV in `doc/`.

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

## Add your photo

1. Save a square-ish headshot as:

   ```
   assets/img/profile.jpg
   ```

2. Refresh the page. The monogram placeholder is replaced automatically.

Tips: ~600×600 px or larger, face centered. JPG or PNG both work (update the `src` in `index.html` if you use PNG).

## Edit content

| What | Where |
|------|--------|
| Bio, education, research | `index.html` |
| Colors, spacing, type | `css/styles.css` |
| Scroll / nav behavior | `js/main.js` |
| CV PDF | `doc/CV_Guo_Jerry_Cheng.pdf` |

## Site map

- **Home** — name, role, short intro, social links  
- **About** — bio + education  
- **Research** — publication & work in progress  
- **CV** — PDF download  

## License

See [LICENSE](LICENSE).
