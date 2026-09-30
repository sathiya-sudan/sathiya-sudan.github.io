# sathiya-sudan.github.io

Personal AI Engineer portfolio — vanilla HTML/CSS/JS, no build step, hosted on GitHub Pages.

## Edit content
Everything lives in [`data/portfolio.json`](data/portfolio.json). Edit, commit, push — the site updates in ~1 minute.

- Any text containing `[PLACEHOLDER]` shows an amber "placeholder" badge on the site until you replace it.
- Empty arrays (`"publications": []`) hide that block/section automatically.
- Project images: drop files in `assets/projects/` and set `"image": "assets/projects/name.png"` (16:9 works best).
- Résumé: save as `assets/resume.pdf`. Photo: set `profile.photo` to e.g. `assets/me.jpg`.

## Preview locally
```bash
python3 -m http.server 8765
```
Then open http://localhost:8765 (opening index.html directly won't load the JSON).

## Structure
```
index.html          page shell
css/style.css       theme tokens (dark/light), components, effects
js/main.js          renders sections from JSON + interactions (filters, modal, ⌘K, tilt, spotlight)
js/neural.js        hero neural-network canvas
data/portfolio.json all content
```

## Update the CV
Edit `cv.html`, then (with the local server running) regenerate the PDF:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=5000 --print-to-pdf=assets/Sathiya_Sudan_CV.pdf http://localhost:8765/cv.html
```
