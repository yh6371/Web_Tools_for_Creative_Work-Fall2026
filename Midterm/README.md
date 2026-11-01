# Reference Playground

An NYU ITP Web Tools midterm prototype for exploring unexpected connections among visual references.

## Run

1. Open this `reference-playground` folder in VS Code.
2. Right-click `index.html` → **Open with Live Server** (Live Server extension), or use any small local HTTP server.
3. Click **Try demo references** or drop several local image files onto the canvas.
4. Move images, select two or use **Surprise me**, write down a connection, and **Save idea**.

No build command, dependencies, backend, or AI service.

## Continue editing with Codex

- See `START_HERE_CODEX.md` for the first exact prompt.
- Codex reads `AGENTS.md` as persistent project guidance.
- `design-reference/` contains the original three visual references supplied by the project author.
- Keep the browser preview open alongside VS Code to inspect incremental changes.

## Files

- `index.html`: semantic markup and UI anchors
- `style.css`: minimal UI styles
- `script.js`: interactions, imports, drag movement, pairing, and IndexedDB persistence
- `AGENTS.md`: project scope, design requirements, functional acceptance checks
- `START_HERE_CODEX.md`: prompt and step-by-step handoff
- `design-reference/`: original visual style references

## Scope

Supports local JPG/PNG/WEBP/GIF image files (up to 15 MB each), multiple upload, desktop drag-and-drop, image arrangement, two-item selection, randomized pairing, idea notes, saved idea cards, and IndexedDB persistence.

Non-goals for Week 8: audio/PDF support, online accounts, AI analysis, complex moodboard tooling, automated idea generation.

Browser privacy: Imported files are processed locally and stored in the browser's IndexedDB; the page does not upload files to a server. Clear browser site data to remove them. Different local server origins have separate storage.
