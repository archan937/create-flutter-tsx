# Changelog

All notable changes to **create-flutter-tsx** (the `bun create flutter-tsx`
scaffolder) are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
[Semantic Versioning](https://semver.org/) (pre-1.0: minor = features, patch = fixes).

## [0.2.1] — 2026-05-31

### Documentation

- README skeleton catalog updated: the recommended `starter` per target, plus
  accurate per-skeleton descriptions (tabs → `<TabView>`, drawer → hamburger,
  feed/dashboard → live `useAsync`/`fetch`, auth → session store).

## [0.2.0] — 2026-05-31

### Added

- **Serious "starter" skeleton per target** (the new recommended default), each a
  real-app setup — not a toy — that builds end-to-end:
  - **mobile** — `<TabView>` shell + a `createStore` session store +
    `useAsync`/`fetch` feed + a modal sheet.
  - **desktop** — a system-tray / menubar app (`config/tray.ts` →
    `window_manager` + `tray_manager` bootstrap) with a store-backed window.
  - **web** — file-based routing (real URLs) + session store + `useAsync`/`fetch`
    dashboard + modal.

### Changed

- **Whole catalog upgraded to real-app quality** and verified (every skeleton
  scaffolds → transpiles → builds; the tray app via `flutter analyze`):
  - `tabs` now uses `<TabView>` instead of hand-rolled `useState` page-switching.
  - `drawer` is a proper hamburger-drawer app (AppBar + Drawer) that switches
    real content.
  - `feed` loads live data with `useAsync` + `fetch`.
  - `auth-tabs` / `auth-dash` use a session store; `dashboard` loads live data.
- Stack-navigation skeletons (e.g. `list-detail`) use file-based routing +
  `useNavigate`.

## [0.1.0] — 2026-05-30

Initial public release.

### Added

- `bun create flutter-tsx` — interactive scaffolder: pick a target
  (mobile/desktop/web) and a skeleton, get a ready-to-run Flutter.tsx project.
- Per-target skeleton catalog (blank, tabs, drawer, list-detail, feed, wizard,
  auth-tabs; desktop and web variants).
- Base project scaffolding: typed `config/*.ts`, app icons, legal pages,
  Prettier/ESLint config, locales.
