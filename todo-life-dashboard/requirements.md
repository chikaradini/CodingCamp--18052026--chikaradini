# Requirements Document

## Introduction

The To-Do List Life Dashboard is a standalone web application built with HTML, CSS, and Vanilla JavaScript. It provides a personal productivity hub accessible directly in the browser with no backend or installation required. All user data is persisted client-side via the browser's Local Storage API. The dashboard combines four core features: a time-aware greeting, a Pomodoro-style focus timer, a task management list, and a quick-access links panel.

## Glossary

- **Dashboard**: The single-page web application that hosts all four feature panels.
- **Greeting_Panel**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The Pomodoro-style countdown timer component with start, stop, and reset controls.
- **Task_List**: The UI component that manages the collection of user tasks.
- **Task**: A single to-do item with a title, completion state, and unique identifier.
- **Quick_Links**: The UI component that displays and manages user-defined shortcut buttons to external URLs.
- **Link**: A single quick-access entry consisting of a label and a URL.
- **Local_Storage**: The browser's built-in client-side key-value storage API used to persist all user data.
- **Session**: A single 25-minute Pomodoro focus interval.

---

## Requirements

### Requirement 1: Time and Date Greeting

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I am immediately oriented and welcomed.

#### Acceptance Criteria

1. THE Greeting_Panel SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Panel SHALL display the current date in a human-readable format (e.g., Monday, 19 May 2025).
3. WHEN the current local time is between 05:00 and 11:59, THE Greeting_Panel SHALL display the message "Good Morning".
4. WHEN the current local time is between 12:00 and 17:59, THE Greeting_Panel SHALL display the message "Good Afternoon".
5. WHEN the current local time is between 18:00 and 04:59, THE Greeting_Panel SHALL display the message "Good Evening".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00) on page load.
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down in one-second intervals.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and restore the display to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and notify the user that the session has ended.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks, so that I can track and manage my personal to-do items across browser sessions.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task title, THE Task_List SHALL add a new Task with a unique identifier and an incomplete state.
2. IF the user submits an empty or whitespace-only task title, THEN THE Task_List SHALL reject the submission and display an inline validation message.
3. WHEN the user activates the edit control on a Task, THE Task_List SHALL allow the user to modify the Task title inline.
4. WHEN the user confirms an edited Task title that is non-empty, THE Task_List SHALL save the updated title.
5. IF the user confirms an edited Task title that is empty or whitespace-only, THEN THE Task_List SHALL discard the edit and restore the previous title.
6. WHEN the user activates the complete control on an incomplete Task, THE Task_List SHALL mark the Task as complete and apply a visual distinction (e.g., strikethrough).
7. WHEN the user activates the complete control on a complete Task, THE Task_List SHALL mark the Task as incomplete and remove the visual distinction.
8. WHEN the user activates the delete control on a Task, THE Task_List SHALL remove the Task from the list permanently.
9. WHEN any Task is added, edited, completed, or deleted, THE Task_List SHALL persist the updated task collection to Local_Storage.
10. WHEN the Dashboard loads, THE Task_List SHALL retrieve and render all previously saved Tasks from Local_Storage.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to add and manage shortcut buttons to my favourite websites, so that I can open them quickly from the dashboard without typing URLs.

#### Acceptance Criteria

1. WHEN the user submits a valid label and a valid URL, THE Quick_Links SHALL add a new Link and display it as a clickable button.
2. IF the user submits a missing label or a missing URL, THEN THE Quick_Links SHALL reject the submission and display an inline validation message.
3. IF the user submits a URL that does not begin with "http://" or "https://", THEN THE Quick_Links SHALL reject the submission and display an inline validation message.
4. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
5. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link from the panel permanently.
6. WHEN any Link is added or deleted, THE Quick_Links SHALL persist the updated link collection to Local_Storage.
7. WHEN the Dashboard loads, THE Quick_Links SHALL retrieve and render all previously saved Links from Local_Storage.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my tasks and quick links to be automatically saved in the browser, so that my data is available every time I return to the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL store all Task data under a single, consistent Local_Storage key.
2. THE Dashboard SHALL store all Link data under a single, consistent Local_Storage key.
3. IF Local_Storage is unavailable or returns a parse error, THEN THE Dashboard SHALL initialise with an empty Task collection and an empty Link collection without throwing an unhandled error.

---

### Requirement 6: Technology and Compatibility

**User Story:** As a user, I want the dashboard to work in any modern browser without installation or a server, so that I can use it immediately by opening a single HTML file.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE Dashboard SHALL function correctly when opened as a local file (file:// protocol) in Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL use a single CSS file located at css/style.css and a single JavaScript file located at js/app.js.
4. THE Dashboard SHALL load and render all content within 2 seconds on a standard desktop machine with no network dependency.
