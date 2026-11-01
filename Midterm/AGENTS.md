# Reference Playground — persistent instructions for Codex

## Project
This is an NYU ITP Web Tools midterm prototype: a **client-side creative exploration tool**. It is not a commercial dashboard and not a product-commerce site.

Main user: a designer / creative technologist who collects images while developing ideas for physical objects, interactive art, industrial design, and mechanical work.

User goal: **Collect → Arrange → Surprise Me / Select → Connect → Save an idea**. The core research question is: "Can unexpected pairings of references inspire meaningful creative connections?" Unexpected should not be confused with merely random.

## Non-negotiable technology constraints
- Vanilla HTML, CSS, JavaScript only. Separate `index.html`, `style.css`, and `script.js`.
- No React/Vue/Tailwind/Bootstrap/shadcn, no UI component libraries, no external fonts or icon packages, no bundler, no backend, no AI API.
- Keep file-drop and pointer-based card dragging working on desktop; keep local persistence via IndexedDB.
- Preserve existing behavior and IDs. Small refactors are OK, but explain them and verify interactions afterward.
- Minimize code complexity; this is a student assignment, so prioritize clear code understandable in a code review.

## Design direction — MUST FOLLOW
Study the three images in `design-reference/` before redesigning. They illustrate an **editorial minimal, classic web / Swiss-grid inspired** aesthetic (not a literal design to copy):
- `01-norse-editorial.jpg`: tightly controlled typography, subtle divider lines, asymmetric restrained structure.
- `02-configurator-layout.jpg`: abundant white space, large central focus, narrow quiet utility area.
- `03-product-minimal.jpg`: unadorned product imagery, disciplined alignment and negative space.

Apply the inspiration specifically to a *creative image workspace*:
- Layout: very large image canvas taking ~75–80% of horizontal space, compact right-side connection tools. A slim header is enough. On narrow screens, panels stack.
- Color: black, white, cool-neutral grays. An optional single muted accent only if it serves selection feedback. No pastel green/blue panels.
- Type: Arial / Helvetica / system sans, regular and medium weights. Restrained sizes, uncomplicated hierarchy.
- Boundaries: 1px neutral rules; square or near-square corners. Avoid shadows and decorative cards.
- Controls: minimal rectangular buttons and basic native form fields. Buttons labeled in plain language.
- Canvas: plain neutral background, no dotted grid, gradient, animated particles or decorative shapes.
- Cards: photographs/images should dominate. Flat white thumbnails, thin borders. Clear simple A/B selected state without neon color.
- No giant hero title, huge slogans, oversized emojis, visual badges, pill chips, generic dashboards, decorative icon illustrations, or gratuitous tooltips.
- Do not add product e-commerce semantics. The user references are *style* cues only.
- Avoid UI-generated boilerplate prose. Short, useful labels only; eliminate explanatory paragraphs where they clutter the interface.

## Functionality that must survive all UI changes
1. `Add images` opens file picker; multiple local JPG/PNG/WEBP/GIF work.
2. Desktop OS file drop onto canvas imports images, without browser navigation.
3. Images can be dragged inside the canvas and remain where placed.
4. Clicking two images assigns distinct references A and B; keyboard selection should keep working.
5. `Surprise me` selects two distinct images from the board (with at least two references).
6. Two feature inputs, creative prompt switcher, and idea textarea unlock on selection.
7. `Save idea` stores and lists an idea; idea can be revisited/deleted.
8. Board references and saved ideas survive refresh via IndexedDB when available.
9. A narrow-screen layout remains usable.

## Working method
- On each task, inspect current files, change the smallest necessary code, and summarize what changed.
- Check for JavaScript console errors and visibly test image import, card pointer dragging, selection, Surprise Me, saved ideas and refresh before saying the UI works.
- Keep HTML semantic, preserve usable keyboard focus, don't disable focus rings.
- If visual browser tooling is available, take a screenshot after changes and compare the structure against the image references (not pixel-perfect replicas).
- When proposing a new feature, distinguish the Week 8 MVP from a future stretch goal; do not automatically build the stretch goal.
