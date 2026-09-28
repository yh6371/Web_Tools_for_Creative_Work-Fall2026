# Pattern Brush

This is a simple p5.js-based web tool for the Week 4 assignment.

## What it does

Hold and drag the mouse on the canvas to create a dot pattern.

The user can change:

- Brush Size
- Density
- Brush Color

The tool also includes:

- Clear button
- Download PNG button

## How it works

p5.js is used for drawing on the canvas.

The interface uses regular HTML inputs and buttons, not p5.js UI helpers such as `createSlider()`.

JavaScript event listeners connect the HTML controls to the p5.js sketch.

The canvas responds immediately while the user holds and moves the mouse.

## Files

- `index.html` — page structure and HTML controls
- `style.css` — basic styling
- `sketch.js` — p5.js drawing and interaction
- `README.md` — project description

## Run

Open the folder in VS Code and use Live Server to open `index.html`.
