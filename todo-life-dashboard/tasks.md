# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement a single-page dashboard using only `index.html`, `css/style.css`, and `js/app.js`. No backend, no frameworks, no test files. All logic lives inside a single IIFE in `app.js`, organised into five plain-object modules: `StorageModule`, `GreetingModule`, `TimerModule`, `TaskModule`, and `LinkModule`. All persistent state is stored in `localStorage`.

## Tasks

- [ ] 1. Create the HTML skeleton (`index.html`)
  - [ ] 1.1 Scaffold `index.html` with four panel sections
    - Create `index.html` at the project root with `<!DOCTYPE html>`, `<meta charset>`, `<meta name="viewport">`, and a `<link>` to `css/style.css` and `<script defer>` to `js/app.js`
    - Add four `<section>` elements: `#greeting-panel`, `#timer-panel`, `#task-panel`, `#link-panel`
    - Add DOM targets inside each panel: `#greeting-time`, `#greeting-date`, `#greeting-message`; `#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`; `#task-form`, `#task-input`, `#task-validation-msg`, `#task-list`; `#link-form`, `#link-label-input`, `#link-url-input`, `#link-validation-msg`, `#link-list`
    - _Requirements: 1.1, 1.2, 2.1, 2.7, 3.1, 4.1, 6.3_

- [ ] 2. Style the dashboard (`css/style.css`)
  - [ ] 2.1 Implement base styles and responsive grid layout
    - Define CSS custom properties (colors, spacing, font sizes) in `:root`
    - Style `body` with a dark/neutral background and a CSS Grid or Flexbox layout that places the four panels in a 2×2 grid on desktop and stacks them on mobile (max-width breakpoint)
    - Style each panel as a card with padding, border-radius, and subtle shadow
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 2.2 Style the Greeting Panel
    - Large clock display for `#greeting-time`, readable date for `#greeting-date`, prominent greeting for `#greeting-message`
    - _Requirements: 1.1, 1.2_
  - [ ] 2.3 Style the Focus Timer panel
    - Large monospace countdown for `#timer-display`
    - Style `#btn-start`, `#btn-stop`, `#btn-reset` as distinct action buttons (green/yellow/red or equivalent accessible contrast)
    - _Requirements: 2.1, 2.7_
  - [ ] 2.4 Style the To-Do List panel
    - Style `#task-form` input and submit button inline
    - Style each task item with a checkbox/toggle area, title text, edit button, and delete button
    - Apply `text-decoration: line-through` and reduced opacity to completed task titles via a `.completed` class
    - Style `#task-validation-msg` as a small red inline error message (hidden by default)
    - _Requirements: 3.6, 3.2_
  - [ ] 2.5 Style the Quick Links panel
    - Style `#link-form` with two inputs (label, URL) and a submit button
    - Style each link as a pill/button with a delete icon
    - Style `#link-validation-msg` as a small red inline error message (hidden by default)
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3. Implement `StorageModule` in `js/app.js`
  - [ ] 3.1 Create the IIFE wrapper and `StorageModule`
    - Open `js/app.js` with a top-level IIFE `(function() { ... })();`
    - Implement `StorageModule` with `KEYS: { TASKS: 'tdld_tasks', LINKS: 'tdld_links' }`, `save(key, data)` (JSON.stringify + setItem, wrapped in try/catch), and `load(key)` (getItem + JSON.parse, returns `[]` on any error or null result)
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Implement `GreetingModule` in `js/app.js`
  - [ ] 4.1 Implement `GreetingModule`
    - Add `getGreeting(hour)` pure function: returns `"Good Morning"` for 5–11, `"Good Afternoon"` for 12–17, `"Good Evening"` for 18–23 and 0–4
    - Add `render()`: reads `new Date()`, formats time as `HH:MM` (zero-padded), formats date as `Weekday, DD Month YYYY`, sets `#greeting-time`, `#greeting-date`, `#greeting-message`
    - Add `init()`: calls `render()` immediately, then `setInterval(render, 60000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Implement `TimerModule` in `js/app.js`
  - [ ] 5.1 Implement `TimerModule`
    - Add `state: { remaining: 1500, running: false, intervalId: null }`
    - Add `format(seconds)` pure function: returns zero-padded `"MM:SS"` string
    - Add `render()`: sets `#timer-display` text to `format(state.remaining)`
    - Add `start()`: guards against double-start; sets `running = true`; starts `setInterval(tick, 1000)`
    - Add `tick()`: decrements `remaining`; calls `render()`; if `remaining <= 0` calls `onComplete()`
    - Add `stop()`: clears interval, sets `running = false`
    - Add `reset()`: calls `stop()`, sets `remaining = 1500`, calls `render()`
    - Add `onComplete()`: calls `stop()`, shows notification (browser `alert` or inline element)
    - Add `init()`: calls `render()`, binds click events on `#btn-start`, `#btn-stop`, `#btn-reset`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 6. Implement `TaskModule` in `js/app.js`
  - [ ] 6.1 Implement task data operations and rendering
    - Add `state: []` (in-memory Task array)
    - Add `validate(title)`: returns `true` if `title.trim()` is non-empty
    - Add `addTask(title)`: if `!validate(title)` show `#task-validation-msg` and return; else push `{ id: crypto.randomUUID(), title: title.trim(), completed: false, createdAt: Date.now() }`, call `StorageModule.save`, call `render()`
    - Add `editTask(id, newTitle)`: if `!validate(newTitle)` restore previous title in DOM and return without saving; else update matching task's title, call `StorageModule.save`, call `render()`
    - Add `toggleTask(id)`: flip `completed` on matching task, call `StorageModule.save`, call `render()`
    - Add `deleteTask(id)`: filter out matching task, call `StorageModule.save`, call `render()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  - [ ] 6.2 Implement `TaskModule.render()` and DOM event wiring
    - `render()` clears `#task-list` and rebuilds it: for each task create a `<li>` with a toggle button (checkbox-style), a `<span>` for the title (add `.completed` class if `task.completed`), an edit button, and a delete button
    - Inline edit: clicking edit replaces the `<span>` with an `<input>` pre-filled with the title; on blur or Enter key confirm via `editTask`; on Escape cancel and restore
    - Bind submit on `#task-form` to call `addTask` with `#task-input` value; clear input on success; clear `#task-validation-msg` on input event
    - Add `init()`: loads tasks from `StorageModule.load(KEYS.TASKS)` into `state`, calls `render()`
    - _Requirements: 3.3, 3.4, 3.5, 3.10_

- [ ] 7. Checkpoint — verify core modules
  - Open `index.html` in a browser; confirm greeting displays correct time and message, timer starts/stops/resets, tasks can be added/toggled/deleted and survive a page reload.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement `LinkModule` in `js/app.js`
  - [ ] 8.1 Implement link data operations and rendering
    - Add `state: []` (in-memory Link array)
    - Add `validateLabel(label)`: returns `true` if `label.trim()` is non-empty
    - Add `validateUrl(url)`: returns `true` if `url` starts with `"http://"` or `"https://"`
    - Add `addLink(label, url)`: if either validation fails show `#link-validation-msg` and return; else push `{ id: crypto.randomUUID(), label: label.trim(), url }`, call `StorageModule.save`, call `render()`
    - Add `deleteLink(id)`: filter out matching link, call `StorageModule.save`, call `render()`
    - Add `render()`: clears `#link-list` and rebuilds it; for each link create a `<li>` with an `<a target="_blank">` button styled as a pill and a delete button
    - Bind submit on `#link-form` to call `addLink`; clear inputs on success; clear `#link-validation-msg` on input events
    - Add `init()`: loads links from `StorageModule.load(KEYS.LINKS)` into `state`, calls `render()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 9. Wire all modules and finalise `js/app.js`
  - [ ] 9.1 Bootstrap all modules on `DOMContentLoaded`
    - At the bottom of the IIFE add a `DOMContentLoaded` listener that calls `StorageModule` (no init needed), `GreetingModule.init()`, `TimerModule.init()`, `TaskModule.init()`, `LinkModule.init()` in order
    - Verify no global variables leak outside the IIFE (check `window` namespace)
    - _Requirements: 6.1, 6.2, 6.4_

- [ ] 10. Final checkpoint — full integration
  - Open `index.html` via `file://` in Chrome, Firefox, and Edge; verify all four panels render and function correctly; verify localStorage persistence survives reload; verify corrupted localStorage key falls back to empty state without errors.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- No test files are created (per project constraints); correctness is verified manually using the checklist in `design.md`
- `crypto.randomUUID()` is available in all modern browsers; fall back to `Date.now().toString() + Math.random()` if needed for older targets
- All validation messages (`#task-validation-msg`, `#link-validation-msg`) should be cleared on the relevant `input` event so they don't linger after the user starts correcting their input
- The `.completed` CSS class drives the strikethrough visual; toggling the class in `render()` is sufficient — no inline styles needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "4.1", "5.1"] },
    { "id": 3, "tasks": ["6.1", "8.1"] },
    { "id": 4, "tasks": ["6.2"] },
    { "id": 5, "tasks": ["9.1"] }
  ]
}
```
