# Changelog

All notable changes to **create-flutter-tsx** (the `bun create flutter-tsx`
scaffolder) are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
[Semantic Versioning](https://semver.org/) (pre-1.0: minor = features, patch = fixes).

## [0.3.3] — 2026-06-02

### Fixed

- **Every skeleton now scaffolds `tsc`-clean TypeScript** — proven by a committed
  typecheck gate in `flutter-tsx` (CI scaffolds all 20 skeletons and runs
  `tsc --noEmit`). Concretely:
  - store templates declare their state type and pass it explicitly
    (`createStore<SessionState>((set) => …)`) — required for correct inference;
  - `fetch` calls are typed (`fetch<Post[]>(url)`), so `data.json` is typed in
    `useAsync`; feed/dashboard map their typed results;
  - the wizard's text input uses `onChange` (matching the typed callback);
  - list items carry a `key`.

## [0.3.2] — 2026-06-02

### Added

- The desktop **tray** skeleton ships a dedicated, dark monochrome menubar glyph
  (`icons/tray.png` + `icons/dark/tray.png`) so the macOS template-image tinting
  renders correctly in both light and dark menubars.
- Per-target dev/build scripts for all six platforms in the generated
  `package.json`.

## [0.3.1] — 2026-06-02

### Fixed

- Scaffold brand icons were JPEGs saved with a `.png` extension — replaced with
  genuine 1024² PNGs so every platform's icon pipeline accepts them.

## [0.3.0] — 2026-06-01

### Changed

- Generated `package.json` pins `flutter-tsx@^0.3.0`, aligning fresh apps with the
  0.3.0 feature-function + `flutter analyze` gate release. All skeletons remain
  real, idiomatic apps and analyze-clean against Flutter 3.44.

## [0.2.2] — 2026-05-31

### Fixed

- **Scaffolded apps were pinned to `flutter-tsx@^0.1.0`.** By semver `^0.1.0`
  means `>=0.1.0 <0.2.0`, so every freshly created app silently installed
  flutter-tsx 0.1.0 — missing routing, state, async, tabs, and modals (all
  shipped in 0.2.0). CI never caught it because it rewrites the dependency to a
  local `file:` link. The generated `package.json` now pins `^0.2.0`, so all
  skeletons resolve the latest 0.2.x.

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
