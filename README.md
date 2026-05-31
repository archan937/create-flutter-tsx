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

| Flag         | Description                                                         |
| ------------ | ------------------------------------------------------------------- |
| `<name>`     | Project name / directory (positional)                               |
| `--bundleId` | Bundle ID, e.g. `com.example.myapp`                                 |
| `--target`   | `web` · `ios` · `android` · `macos` · `windows` · `linux`           |
| `--template` | App skeleton — see the catalog below (must be valid for the target) |

---

## Skeleton catalog

The picker is **target-aware** — each target offers the patterns that make sense for it. `blank` is available everywhere.

### Mobile (`--target=ios|android`)

| `--template`  | Pattern                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| `starter` ⭐  | **Recommended.** `<TabView>` shell + session store + `useAsync`/`fetch` feed + modal sheet |
| `blank`       | Single screen counter with `useState`                                                      |
| `tabs`        | Bottom navigation (`<TabView>`) across 3 screens                                           |
| `drawer`      | Hamburger drawer that switches content                                                     |
| `list-detail` | Master list → detail screen (file-based routing + `useNavigate`)                           |
| `feed`        | Scrollable card feed loaded with `useAsync` + `fetch`                                      |
| `wizard`      | Multi-step form                                                                            |
| `auth-tabs`   | Login (session store) → `<TabView>` shell                                                  |

### Desktop (`--target=macos|windows|linux`)

| `--template`      | Pattern                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `tray` ⭐         | **Recommended.** Menubar / system-tray app (`config/tray.ts` → window_manager + tray_manager) + store-backed window |
| `blank`           | Single window with a menu bar                                                                                       |
| `sidebar`         | Left sidebar with selectable items and a detail pane                                                                |
| `toolbar`         | Top toolbar with a central canvas                                                                                   |
| `three-pane`      | Sidebar + list + content pane                                                                                       |
| `tabbed-document` | Top-level content tabs                                                                                              |

### Web (`--target=web`)

| `--template` | Pattern                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `starter` ⭐ | **Recommended.** File-based routing (real URLs) + session store + `useAsync`/`fetch` dashboard + modal |
| `blank`      | Single landing page                                                                                    |
| `dashboard`  | Top nav + sidebar + live data (`useAsync`/`fetch`)                                                     |
| `marketing`  | Hero + sections + footer                                                                               |
| `sections`   | Section-based content with anchor-link navigation                                                      |
| `auth-dash`  | Login (session store) → dashboard                                                                      |

Every skeleton is a real-app setup, verified end-to-end: scaffold → transpile →
build (the tray app via `flutter analyze`), with fully `flutter analyze`-clean Dart.

---

## What gets scaffolded

On top of the chosen skeleton's `src/`, every project is seeded with the full Flutter.tsx surface:

```
my-app/
├── config/               # typed config — `satisfies` a type from flutter-tsx/config
│   ├── app.ts            #   identity: name, bundleId, target
│   ├── theme.ts          #   brand colors → generated Material 3 theme
│   ├── links.ts          #   deep links + universal links
│   ├── env.ts            #   build-time vars → --dart-define
│   └── permissions.ts    #   custom usage strings (perms are inferred from hooks)
├── src/
│   └── App.tsx           # your app (+ screens/ for multi-screen skeletons)
├── icons/
│   ├── icon.png          # 1024×1024 placeholder app icon
│   └── dark/icon.png     # dark-variant placeholder
├── locales/
│   └── en.json           # translations — read via `const t = useTranslations()`
├── legal/
│   ├── privacy.md        # TODO stubs
│   └── terms.md
├── AGENTS.md             # guidance for AI assistants working in the project
├── package.json          # depends on flutter-tsx
├── tsconfig.json         # jsxImportSource: flutter-tsx
├── .prettierrc           # matched tooling
├── eslint.config.js
└── .gitignore
```

Config is **typed TypeScript**, not config files to memorize: editing `config/theme.ts`
gives you autocomplete and compile-time checks. Permissions are **inferred** from the
hooks you use (`useCamera()` adds the camera permission automatically). Nothing here is
locked in — delete what you don't need.

All six targets (web · iOS · Android · macOS · Windows · Linux) are first-class.
Cross-platform values live once in `config/app.ts` + the semantic surfaces and fan out
to every platform. For the rare OS-specific bits — signing/notarization,
`deploymentTarget`, FCM files — add an optional `config/platforms/<os>.ts`; the actual
credential files live in a gitignored `signing/<os>/` directory, referenced by path.

---

## Programmatic API

The scaffolder is also importable:

```ts
import {
  runInit,
  scaffoldBase,
  scaffoldSkeleton,
  SKELETON_CATALOG,
} from 'create-flutter-tsx';

// drive the CLI with an argv array
await runInit([
  'my-app',
  '--target=web',
  '--template=dashboard',
  '--bundleId=com.example.app',
]);

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

MIT © Paul Engel
