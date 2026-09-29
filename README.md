# Voilà website

Static website for Voilà Design Pte Ltd, a Singapore interior design studio.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Pages

- `index.html` home (scroll hero, selected works, films, reviews)
- `about.html` about, process, Instagram
- `portfolio.html` films, projects, gallery
- `project.html?p=<slug>` single project
- `contact.html` contact details, booking form, map

## Content

- `assets/js/data.js` projects, films, gallery and Google reviews. Regenerate with `python3 tools/build_data.py`.
- `assets/js/instagram.js` Instagram posts. Set `VOILA_IG_FEED` to a JSON feed URL (for example from behold.so) to always show the latest posts.
- `assets/css/style.css` all styles.
- `assets/js/main.js` all interactions.
