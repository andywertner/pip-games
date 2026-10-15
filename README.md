# Pip's jobs

Three Blockly games about telling a helper what to do. Pip paints signs, stamps changes, and delivers packages. The answers are blocks, not a live AI.

Sign, Stamps, and Route each have 10 levels. Progress and the teacher unlock are stored in the browser.

The teacher unlock password is `admin`. It opens the chosen level and every level before it in that game.

## Play locally

```
npm ci
npm test
npm run build
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/. The build targets Chrome 96 so Chromebooks on Chrome 103 can run it.

## Site

GitHub Pages serves the `main` branch at https://andywertner.github.io/pip-games/.

The `generated/` folder is the built site. After changing the games, run `npm run build` and commit `generated/` along with the source.
