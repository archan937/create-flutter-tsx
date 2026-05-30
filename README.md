# create-flutter-tsx

Scaffold a new [Flutter.tsx](https://www.npmjs.com/package/flutter-tsx) project — write your app in TSX, ship it everywhere Flutter runs.

```sh
bun create flutter-tsx my-app
```

`create-flutter-tsx` runs a short interview (target → app kind), then lands a working, themed, internationalized project on disk — every reusable surface seeded and ready for `bun run dev`.

---

## Quick start

```sh
# interactive
bun create flutter-tsx my-app

# or non-interactive (CI-safe — all prompts skipped)
bun create flutter-tsx my-app \
  --bundleId=com.example.myapp \
  --target=ios \
  --template=tabs

cd my-app
bun install
bun run dev
```

Other package managers work too via the `create-*` convention:

```sh
npm create flutter-tsx@latest my-app   # note the `--` before flags: … my-app -- --target=ios
pnpm create flutter-tsx my-app
yarn create flutter-tsx my-app
```

> This scaffolder is standalone — it has **no** `flutter-tsx` dependency, so it runs on a clean machine before anything is installed. The generated project depends on `flutter-tsx`.

---

## The interview

```
my-app
  → What kind of device are you building for?   web | mobile | desktop
      mobile  → iOS | Android
      desktop → macOS | Windows | Linux
  → What kind of app?                           ← target-aware skeleton picker
  → scaffolding…
```

Every prompt has a flag escape hatch; pass all three and the run is fully non-interactive.

| Flag | Description |
| --- | --- |
| `<name>` | Project name / directory (positional) |
| `--bundleId` | Bundle ID, e.g. `com.example.myapp` |
| `--target` | `web` · `ios` · `android` · `macos` · `windows` · `linux` |
| `--template` | App skeleton — see the catalog below (must be valid for the target) |

---

## Skeleton catalog

The picker is **target-aware** — each target offers the patterns that make sense for it. `blank` is available everywhere.

### Mobile (`--target=ios|android`)

| `--template` | Pattern |
| --- | --- |
| `blank` | Single screen counter with `useState` |
| `tabs` | Bottom navigation across 3 screens |
| `drawer` | Left-side burger drawer navigation |
| `list-detail` | Master list that navigates to a detail screen |
| `feed` | Scrollable card feed |
| `wizard` | Multi-step form |
| `auth-tabs` | Login screen that leads into a tabbed app |

### Desktop (`--target=macos|windows|linux`)

| `--template` | Pattern |
| --- | --- |
| `blank` | Single window with a menu bar |
| `tray` | Menubar / system-tray app (uses `tray_manager`) |
| `sidebar` | Left sidebar with selectable items and a detail pane |
| `toolbar` | Top toolbar with a central canvas |
| `three-pane` | Sidebar + list + content pane |
| `tabbed-document` | Top-level content tabs |

### Web (`--target=web`)

| `--template` | Pattern |
| --- | --- |
| `blank` | Single landing page |
| `dashboard` | Top nav + sidebar + cards/stats |
| `marketing` | Hero + sections + footer |
| `sections` | Section-based content with anchor-link navigation |
| `auth-dash` | Login screen that leads to a dashboard |

Every skeleton is verified to transpile to clean Dart (`dart analyze`, zero errors).

---

## What gets scaffolded

On top of the chosen skeleton's `src/`, every project is seeded with the full Flutter.tsx surface:

```
my-app/
├── app.toml              # identity — name, bundleId, target
├── src/
│   └── App.tsx           # your app (+ screens/ for multi-screen skeletons)
├── icons/
│   ├── icon.png          # 1024×1024 placeholder app icon
│   └── dark/icon.png     # dark-variant placeholder
├── theme.toml            # brand colors (primary = #54a4ff)
├── locales/
│   └── en.json           # seeded with the keys the skeleton uses
├── legal/
│   ├── privacy.md        # TODO stubs
│   └── terms.md
├── permissions.toml      # every key commented — uncomment what you need
├── links.toml            # deep-link / universal-link config (commented)
├── .env                  # build-time env vars
├── package.json          # depends on flutter-tsx
├── tsconfig.json         # jsxImportSource: flutter-tsx
├── .prettierrc           # matched tooling
├── eslint.config.js
└── .gitignore
```

Nothing here is locked in — delete what you don't need.

---

## Programmatic API

The scaffolder is also importable:

```ts
import { runInit, scaffoldBase, scaffoldSkeleton, SKELETON_CATALOG } from 'create-flutter-tsx';

// drive the CLI with an argv array
await runInit(['my-app', '--target=web', '--template=dashboard', '--bundleId=com.example.app']);

// or scaffold pieces directly into a directory
scaffoldBase('/path/to/my-app');
scaffoldSkeleton('/path/to/my-app', 'tabs', 'mobile');
```

`SKELETON_CATALOG` is a `Record<'mobile' | 'desktop' | 'web', SkeletonDef[]>` you can introspect.

---

## Development

```sh
bun install
bun run build      # compile + bundle → dist/
bun run typecheck
bun test
bun run quality    # typecheck + format + lint + test:coverage
```

Run the local build end-to-end:

```sh
bun run build
bun dist/bin/create-flutter-tsx.js my-app --target=web --template=dashboard --bundleId=com.example.app
```

## License

MIT
