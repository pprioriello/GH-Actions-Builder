# GitHub Actions Builder

A visual, drag-and-drop editor for building GitHub Actions workflows. Configure triggers, jobs, and steps through a clean UI and get a ready-to-use YAML file — no manual editing required.

## Features

### Workflow Configuration
- Set a workflow name and configure one or more event triggers: `push`, `pull_request`, `workflow_dispatch`, `schedule`, `release`
- Filter branches per trigger (push / pull_request)
- Add multiple cron expressions for the `schedule` trigger
- Define workflow-level `permissions` (contents, pull-requests, packages, etc.)

### Jobs
- Create multiple jobs, each with its own runner OS (`ubuntu-latest`, `windows-latest`, `macos-latest`)
- Set job dependencies via `needs` to control execution order
- Reorder jobs by drag-and-drop

### Steps
- 70+ pre-built steps across 15 categories (CI, Docker, Cloud, Security, Notifications, and more)
- Drag steps from the sidebar onto any job, reorder them, or move them between jobs
- Configure each step through a dedicated panel:
  - Custom name, `uses` / `run` fields
  - `with:` inputs (action parameters)
  - `env:` variables
  - `if:` condition
- Insert GitHub context variables (`github.*`, `secrets.*`, etc.) via one-click chips

### YAML Preview
- Live YAML generation — updates instantly as you edit
- One-click copy to clipboard
- Download as a `.yml` file ready to drop into `.github/workflows/`

### Validation
- Built-in linter that checks for common mistakes:
  - Missing triggers, jobs, or step names
  - Circular job dependencies
  - Missing setup steps (Node, Python, Go, Rust, Java, .NET)
  - Missing Docker login before push
  - Missing cloud auth before deploy steps
  - Duplicate job/step names
  - Empty `run` or `uses` fields

### Saved Workflows
- Save the current workflow by name
- Load or delete saved workflows from the Settings panel
- Start fresh with "New Workflow"

### Theming
- 10 built-in themes: 5 light/dark pairs (Default, Warm, Purple, Teal, Rose)
- Toggle between light and dark variants in the Settings panel

### Persistence
- The current workflow (name, triggers, config, jobs) and selected theme are automatically saved to `localStorage` — your work survives page refreshes

### Mobile Support
- Fully responsive layout optimised for phones
- Touch drag-and-drop for reordering steps and jobs
- Bottom sheet for adding steps (searchable catalog with descriptions)
- Bottom sheet for configuring a selected step
- Two-tab navigation: Canvas and YAML preview

## Tech Stack

- **React 18** — UI and state management (`useReducer` + Context)
- **Vite 6** — dev server and build tool
- **Tailwind CSS v4** — utility styles via `@tailwindcss/vite` plugin
- No runtime dependencies beyond React

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Canvas.jsx            # Scrollable workflow canvas
│   ├── TriggerSection.jsx    # Trigger toggles + branch/cron/permissions config
│   ├── JobCard.jsx           # Individual job card with drag handle
│   ├── StepItem.jsx          # Step row with drag, select, delete
│   ├── DropZone.jsx          # Drop target at the bottom of each job
│   ├── Sidebar.jsx           # Step catalog (desktop)
│   ├── ConfigPanel.jsx       # Step configuration panel (desktop + mobile sheet)
│   ├── YamlPreview.jsx       # Live YAML output panel
│   ├── Topbar.jsx            # App header with workflow name and settings
│   ├── MobileNav.jsx         # Bottom navigation tabs (mobile)
│   ├── MobileStepPickerSheet.jsx  # Bottom sheet step catalog (mobile)
│   ├── SettingsPanel.jsx     # Theme picker and saved workflows
│   └── ValidationOverlay.jsx # Validation results overlay
├── contexts/
│   └── AppContext.jsx        # Global state, reducer, and localStorage sync
├── data/
│   └── catalog.js            # Step catalog definitions and defaults
├── hooks/
│   ├── useIsMobile.js        # Responsive breakpoint hook
│   └── useTouchDrag.js       # Touch drag-and-drop hook
└── utils/
    ├── yaml.js               # YAML generation
    └── validation.js         # Workflow validation rules
```
