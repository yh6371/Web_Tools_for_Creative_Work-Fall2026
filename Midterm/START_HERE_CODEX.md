# Start here: Codex handoff

This folder already includes the functional Reference Playground prototype and an initial understated monochrome restyle. It is **not** claimed to be finished; keep refining with Codex locally.

## First action in VS Code
1. Open **this entire folder** (File > Open Folder), not just `index.html`.
2. Open `index.html` using Live Server. Keep browser next to editor.
3. Install / open the **Codex** extension for VS Code, sign in using your ChatGPT account.
4. Open the Codex panel and paste the initial task below. Codex will read `AGENTS.md` when operating in this folder.

## First prompt to paste into Codex

```
We are continuing an existing NYU ITP midterm project named Reference Playground.

Read AGENTS.md first, then inspect the current HTML/CSS/JS and all 3 images in design-reference/.

Task: Refine the existing interface into a distinctly editorial, minimal, classic front-end look inspired by the attached image references. I dislike generic AI-generated dashboard aesthetics.

Priorities:
1. Let the workspace and uploaded images dominate the page. Quiet, compact side panel.
2. Black / white / gray only, crisp 1px dividers, restrained type, simple rectangular controls, generous and intentional white space. No colored panels, gradients, decorative iconography, pill buttons, drop shadows, or big hero copy.
3. Keep all existing functionality. Do NOT rewrite the application or introduce frameworks / dependencies.
4. Improve the actual usability: selected A/B state, legibility, click-vs-drag behavior, responsive layout.

Please inspect the project, describe a short plan, modify files directly, and verify in the browser if possible. Summarize changes and any untested behavior.
```

## Suggested small follow-up prompts

- "Simplify only the right panel. Use fewer labels and more whitespace. Do not change JavaScript behavior."
- "Inspect and fix card drag/select edge cases without changing appearance. Verify with pointer interactions."
- "Try a more editorial layout: slimmer header, canvas 80% width, narrow tools. Compare against design-reference/."
- "Improve the Surprise Me workflow: emphasize the chosen pair without adding visual decoration."
- "Add a reversible selection clearing action while preserving existing saved ideas. Keep styling minimal."

**Scope reminder:** The project is a tool to explore connections, not a tool to automatically generate ideas. Avoid adding AI or unrelated features.
