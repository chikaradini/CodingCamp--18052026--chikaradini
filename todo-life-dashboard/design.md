# Design Document: To-Do List Life Dashboard

## Overview

The To-Do List Life Dashboard is a single-page web application (SPA) delivered as a single `index.html` file with one companion CSS file (`css/style.css`) and one JavaScript file (`js/app.js`). It requires no server, no build step, and no external dependencies — it opens directly in any modern browser via the `file://` protocol.

The application is divided into four self-contained panels arranged on a responsive grid:

1. **Greeting Panel** — displays the current time, date, and a time-aware greeting.
2. **Focus Timer** — a 25-minute Pomodoro countdown with start, stop, and reset controls.
3. **To-Do List** — a full CRUD task manager persisted to Local Storage.
4. **Quick Links** — a user-defined set of URL shortcut buttons persisted to Local Storage.

All state is managed in memory during a session and flushed to `localStorage` on every mutation. On page load the application reads from `localStorage` to restore the previous session's tasks and links.

---

## Architecture

The application follows a **module pattern** inside a single IIFE (Immediately Invoked Function Expression) in `app.js`. There is no virtual DOM, no reactive framework, and no module bundler. Each feature is implemented as a plain-object module with `init()`, `render()`, and event-handler functions.

```
index.html
├── css/style.css          (all styles, single file)
└── js/app.js              (all logic, single file)
    ├── GreetingModule
    ├── TimerModule
    ├── TaskModule
    ├── LinkModule
    └── StorageModule
```

### Data Flow

```
User Interaction
      │
      ▼
Event Handler (in module)
      │
      ├─► Mutate in-memory state
      │
      ├─► StorageModule.save(key, data)   ──► localStorage
      │
      └─► render()  ──► DOM update
```

On page load:

```
DOMContentLoaded
      │
      ├─► GreetingModule.init()   (starts clock interval)
      ├─► TimerModule.init()      (resets timer display)
      ├─► TaskModule.init()       ──► StorageModule.load('tasks') ──► render()
      └─► LinkModule.init()       ──► StorageModule.load('links') ──► render()
```

---

## Components and Interfaces

### GreetingModule

Responsible for the time/date display and greeting message.

```js
GreetingModule = {
  init()        // starts setInterval every 60 s; calls render() immediately
  render()      // reads Date(), updates #greeting-time, #greeting-date, #greeting-message
  getGreeting(hour: number): string  // pure function: returns "Good Morning/Afternoon/Evening"
}
```

**DOM targets:** `#greeting-time`, `#greeting-date`, `#greeting-message`

---

### TimerModule

Manages the Pomodoro countdown.

```js
TimerModule = {
  state: { remaining: 1500, running: false, intervalId: null }

  init()        // sets display to 25:00, binds button events
  start()       // sets running=true, starts setInterval every 1 s
  stop()        // clears interval, sets running=false
  reset()       // calls stop(), sets remaining=1500, updates display
  tick()        // decrements remaining; if 0 calls onComplete()
  onComplete()  // stops timer, shows notification
  format(seconds: number): string  // pure: "MM:SS"
  render()      // updates #timer-display
}
```

**DOM targets:** `#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`

---

### TaskModule

Manages the to-do list.

```js
TaskModule = {
  state: Task[]   // in-memory array

  init()                          // loads from storage, renders
  addTask(title: string)          // validates, creates Task, saves, renders
  editTask(id: string, title: string)  // validates, updates, saves, renders
  toggleTask(id: string)          // flips complete flag, saves, renders
  deleteTask(id: string)          // removes from array, saves, renders
  render()                        // rebuilds #task-list DOM
  validate(title: string): boolean
}
```

**DOM targets:** `#task-input`, `#task-form`, `#task-list`, `#task-validation-msg`

---

### LinkModule

Manages quick-access URL buttons.

```js
LinkModule = {
  state: Link[]

  init()                              // loads from storage, renders
  addLink(label: string, url: string) // validates, creates Link, saves, renders
  deleteLink(id: string)              // removes, saves, renders
  render()                            // rebuilds #link-list DOM
  validateUrl(url: string): boolean   // checks http:// or https:// prefix
  validateLabel(label: string): boolean
}
```

**DOM targets:** `#link-label-input`, `#link-url-input`, `#link-form`, `#link-list`, `#link-validation-msg`

---

### StorageModule

Thin wrapper around `localStorage` with error handling.

```js
StorageModule = {
  KEYS: { TASKS: 'tdld_tasks', LINKS: 'tdld_links' }

  save(key: string, data: any): void   // JSON.stringify + setItem
  load(key: string): any               // getItem + JSON.parse; returns [] on error
}
```

---

## Data Models

### Task

```js
{
  id:        string,   // crypto.randomUUID() or Date.now().toString()
  title:     string,   // non-empty, trimmed
  completed: boolean,  // false on creation
  createdAt: number    // Date.now() timestamp
}
```

### Link

```js
{
  id:    string,  // crypto.randomUUID() or Date.now().toString()
  label: string,  // non-empty, trimmed display text
  url:   string   // must start with "http://" or "https://"
}
```

### Local Storage Layout

| Key          | Value                  |
|--------------|------------------------|
| `tdld_tasks` | `JSON.stringify(Task[])` |
| `tdld_links` | `JSON.stringify(Link[])` |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting message correctness

*For any* hour value in [0, 23], `getGreeting(hour)` SHALL return exactly one of "Good Morning", "Good Afternoon", or "Good Evening", and the returned value SHALL match the time-range rules defined in Requirements 1.3–1.5.

**Validates: Requirements 1.3, 1.4, 1.5**

---

### Property 2: Timer format is always MM:SS

*For any* integer number of seconds in [0, 1500], `TimerModule.format(seconds)` SHALL return a string matching the pattern `MM:SS` where MM and SS are zero-padded two-digit numbers.

**Validates: Requirements 2.7**

---

### Property 3: Adding a valid task grows the list by one

*For any* task list of length N and any non-empty, non-whitespace-only title string, calling `addTask(title)` SHALL result in a task list of length N + 1, and the new task SHALL have `completed = false`.

**Validates: Requirements 3.1**

---

### Property 4: Whitespace-only titles are always rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), calling `addTask(title)` SHALL leave the task list unchanged and SHALL not persist any new entry to Local Storage.

**Validates: Requirements 3.2**

---

### Property 5: Edit with empty title discards the change

*For any* existing task with a non-empty title T, calling `editTask(id, '')` or `editTask(id, whitespace)` SHALL leave the task's title equal to T and SHALL not persist a changed title.

**Validates: Requirements 3.5**

---

### Property 6: Toggle is an involution (round-trip)

*For any* task, toggling its completion state twice SHALL return the task to its original `completed` value.

**Validates: Requirements 3.6, 3.7**

---

### Property 7: Task persistence round-trip

*For any* collection of tasks saved via `StorageModule.save(KEYS.TASKS, tasks)`, calling `StorageModule.load(KEYS.TASKS)` SHALL return a collection that is deeply equal to the saved collection.

**Validates: Requirements 3.9, 3.10, 5.1**

---

### Property 8: Link URL validation rejects non-HTTP(S) URLs

*For any* string that does not begin with `"http://"` or `"https://"`, `LinkModule.validateUrl(url)` SHALL return `false`, and `addLink` SHALL not add the link to the collection.

**Validates: Requirements 4.3**

---

### Property 9: Link persistence round-trip

*For any* collection of links saved via `StorageModule.save(KEYS.LINKS, links)`, calling `StorageModule.load(KEYS.LINKS)` SHALL return a collection that is deeply equal to the saved collection.

**Validates: Requirements 4.6, 4.7, 5.2**

---

### Property 10: StorageModule graceful degradation

*For any* corrupted or missing Local Storage value, `StorageModule.load(key)` SHALL return an empty array `[]` and SHALL not throw an unhandled exception.

**Validates: Requirements 5.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Empty/whitespace task title on add | Show `#task-validation-msg`, do not mutate state |
| Empty/whitespace task title on edit | Discard edit, restore previous title, hide validation message |
| Missing label or URL on link add | Show `#link-validation-msg`, do not mutate state |
| URL without http/https prefix | Show `#link-validation-msg`, do not mutate state |
| `localStorage` unavailable (SecurityError) | `StorageModule.load` catches exception, returns `[]`; `StorageModule.save` catches and silently fails |
| `JSON.parse` error on load | Caught in `StorageModule.load`, returns `[]` |
| Timer reaches 00:00 | Auto-stop, display browser `alert()` or inline notification |

All validation messages are cleared when the user begins typing in the relevant input field.

---

## Testing Strategy

Because this project has **no test files** (per constraints), the Testing Strategy section documents the correctness properties as manual verification checklists and describes how automated tests *would* be structured if added in the future.

### Manual Verification Checklist

**Greeting Panel**
- [ ] Open at 08:00 → "Good Morning" displayed
- [ ] Open at 14:00 → "Good Afternoon" displayed
- [ ] Open at 20:00 → "Good Evening" displayed
- [ ] Time updates every minute without page reload

**Focus Timer**
- [ ] Page load shows 25:00
- [ ] Start → countdown ticks every second
- [ ] Stop → countdown pauses, value retained
- [ ] Reset → returns to 25:00 regardless of state
- [ ] Countdown reaches 00:00 → stops and notifies user

**To-Do List**
- [ ] Add valid task → appears in list, persisted to localStorage
- [ ] Add empty/whitespace task → rejected with validation message
- [ ] Edit task → inline edit, save updates title
- [ ] Edit to empty → title restored, no change persisted
- [ ] Toggle complete → strikethrough applied/removed
- [ ] Toggle twice → returns to original state
- [ ] Delete task → removed from list and localStorage
- [ ] Reload page → tasks restored from localStorage

**Quick Links**
- [ ] Add valid label + http(s) URL → button appears, persisted
- [ ] Add missing label or URL → rejected with validation message
- [ ] Add URL without http/https → rejected with validation message
- [ ] Click link button → opens URL in new tab
- [ ] Delete link → removed from panel and localStorage
- [ ] Reload page → links restored from localStorage

**Data Persistence**
- [ ] Corrupt localStorage value manually → app loads with empty state, no crash

### Future Automated Testing (if test files were permitted)

The correctness properties defined above map directly to property-based tests using a library such as [fast-check](https://github.com/dubzzz/fast-check) (JavaScript):

- **Properties 1–2**: Pure function tests — `getGreeting` and `format` have no side effects and are trivially testable with arbitrary inputs.
- **Properties 3–6**: Task mutation tests — generate arbitrary task arrays and titles, assert invariants after each operation.
- **Properties 7, 9**: Round-trip serialization tests — generate arbitrary Task/Link arrays, save then load, assert deep equality.
- **Property 8**: URL validation tests — generate arbitrary strings, assert `validateUrl` returns false for non-http(s) inputs.
- **Property 10**: Fault injection tests — mock `localStorage` to throw or return garbage, assert graceful fallback.

Each property test would be configured to run a minimum of 100 iterations.
