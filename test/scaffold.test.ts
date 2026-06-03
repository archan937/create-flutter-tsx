import './helpers/resemble.js';

import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  scaffoldBase,
  scaffoldSkeleton,
  SKELETON_CATALOG,
  type SkeletonDef,
  type TargetCategory,
  targetCategory,
} from '@src/scaffold.js';

const mkTmp = (): string => mkdtempSync(join(tmpdir(), 'fsx-scaffold-'));

describe('targetCategory', () => {
  test('ios → mobile', () => expect(targetCategory('ios')).toBe('mobile'));
  test('android → mobile', () =>
    expect(targetCategory('android')).toBe('mobile'));
  test('mobile → mobile', () =>
    expect(targetCategory('mobile')).toBe('mobile'));
  test('macos → desktop', () =>
    expect(targetCategory('macos')).toBe('desktop'));
  test('windows → desktop', () =>
    expect(targetCategory('windows')).toBe('desktop'));
  test('linux → desktop', () =>
    expect(targetCategory('linux')).toBe('desktop'));
  test('desktop → desktop', () =>
    expect(targetCategory('desktop')).toBe('desktop'));
  test('web → web', () => expect(targetCategory('web')).toBe('web'));
});

describe('SKELETON_CATALOG', () => {
  test('blank is valid for every target category', () => {
    const cats: TargetCategory[] = ['mobile', 'desktop', 'web'];
    for (const cat of cats) {
      expect(SKELETON_CATALOG[cat].some((s) => s.name === 'blank')).toBe(true);
    }
  });

  test('tabs is in mobile but not web', () => {
    expect(SKELETON_CATALOG.mobile.some((s) => s.name === 'tabs')).toBe(true);
    expect(SKELETON_CATALOG.web.some((s) => s.name === 'tabs')).toBe(false);
  });

  test('tray is in desktop but not mobile or web', () => {
    expect(SKELETON_CATALOG.desktop.some((s) => s.name === 'tray')).toBe(true);
    expect(SKELETON_CATALOG.mobile.some((s) => s.name === 'tray')).toBe(false);
    expect(SKELETON_CATALOG.web.some((s) => s.name === 'tray')).toBe(false);
  });

  test('dashboard is in web but not mobile or desktop', () => {
    expect(SKELETON_CATALOG.web.some((s) => s.name === 'dashboard')).toBe(true);
    expect(SKELETON_CATALOG.mobile.some((s) => s.name === 'dashboard')).toBe(
      false,
    );
    expect(SKELETON_CATALOG.desktop.some((s) => s.name === 'dashboard')).toBe(
      false,
    );
  });

  test('all skeletons have name, label, description, and non-empty files', () => {
    for (const skeletons of Object.values(
      SKELETON_CATALOG,
    ) as SkeletonDef[][]) {
      for (const s of skeletons) {
        expect(s.name).toBeTruthy();
        expect(s.label).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(Object.keys(s.files).length).toBeGreaterThan(0);
        expect(s.files['src/App.tsx']).toBeTruthy();
        expect(s.files['locales/en.json']).toBeTruthy();
      }
    }
  });
});

describe('scaffoldBase', () => {
  test('writes all surface files (typed config/*.ts + assets)', () => {
    const dir = mkTmp();
    scaffoldBase(dir);

    expect(() => readFileSync(join(dir, 'config', 'theme.ts'))).not.toThrow();
    expect(() =>
      readFileSync(join(dir, 'config', 'permissions.ts')),
    ).not.toThrow();
    expect(() => readFileSync(join(dir, 'config', 'links.ts'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'config', 'env.ts'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'legal', 'privacy.md'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'legal', 'terms.md'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'AGENTS.md'))).not.toThrow();
  });

  test('writes icon placeholder PNGs', () => {
    const dir = mkTmp();
    scaffoldBase(dir);

    const icon = readFileSync(join(dir, 'icons', 'icon.png'));
    const darkIcon = readFileSync(join(dir, 'icons', 'dark', 'icon.png'));
    expect(icon.length).toBeGreaterThan(100);
    expect(darkIcon.length).toBeGreaterThan(100);
  });

  test('config/theme.ts is the typed brand-color template', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(readFileSync(join(dir, 'config', 'theme.ts'), 'utf-8')).toResemble(`
      import type { Theme } from 'flutter-tsx/config';

      // Brand colors → a full Material 3 theme is generated and applied to your
      // MaterialApp. A single primary color seeds the whole scheme.
      export default {
        light: { primary: '#54a4ff' },
        // dark: { primary: '#0d1117' },
      } satisfies Theme;
    `);
  });

  test('config/permissions.ts is the typed (empty) template', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(
      readFileSync(join(dir, 'config', 'permissions.ts'), 'utf-8'),
    ).toResemble(`
      import type { Permissions } from 'flutter-tsx/config';

      // Permissions are inferred from the hooks you use (e.g. useCamera() → camera),
      // so most apps need nothing here. Add an entry only to customize the iOS usage
      // description shown in the system prompt.
      export default {
        // camera: 'Scan QR codes in the app.',
      } satisfies Permissions;
    `);
  });

  test('config/links.ts is the typed (empty) template', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(readFileSync(join(dir, 'config', 'links.ts'), 'utf-8')).toResemble(`
      import type { Links } from 'flutter-tsx/config';

      // Deep links + universal/app links — one declaration, both platforms.
      export default {
        // scheme: 'myapp',              // myapp://...
        // domains: ['app.example.com'], // https://... universal links
      } satisfies Links;
    `);
  });

  test('config/env.ts is the typed (empty) template', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(readFileSync(join(dir, 'config', 'env.ts'), 'utf-8')).toResemble(`
      import type { EnvConfig } from 'flutter-tsx/config';

      // Build-time values → passed to the app as --dart-define. Because this is
      // TypeScript, you can read process.env here for secrets and provide defaults.
      export default {
        // API_URL: process.env.API_URL ?? 'https://api.example.com',
      } satisfies EnvConfig;
    `);
  });

  test('AGENTS.md guides AI assistants (write TSX, never edit .fsx/)', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8')).toResemble(`
      # Working in this project (for AI assistants)

      This is a **Flutter.tsx** app: you write **TSX**, and \`fsx dev\` transpiles it to
      Dart and runs Flutter. Follow these rules:

      - **Write TSX, never Dart.** Widgets and hooks come from \`flutter-tsx\`
        (\`import { Scaffold, Column, Text, useState } from 'flutter-tsx'\`). App code
        lives in \`src/\`.
      - **Never edit generated output.** \`.fsx/\` (the generated Flutter project,
        including \`lib/*.dart\`) is produced by the tool — changes there are
        overwritten. Never hand-edit \`ios/\`, \`android/\`, \`Info.plist\`,
        \`AndroidManifest.xml\`, etc.
      - **Config is typed TypeScript** in \`config/*.ts\` (\`satisfies\` a type from
        \`flutter-tsx/config\`): \`config/app.ts\` (identity), \`config/theme.ts\`,
        \`config/links.ts\`, \`config/env.ts\`, \`config/permissions.ts\`,
        \`config/release.ts\`. Edit these, not native files.
      - **Permissions are inferred** from the hooks you use (\`useCamera()\` adds the
        camera permission automatically). \`config/permissions.ts\` is only for custom
        usage strings.
      - **Assets are semantic files**: app icon at \`icons/icon.png\`, translations in
        \`locales/*.json\` (read via \`const t = useTranslations()\`), legal docs in
        \`legal/\`.
      - **Run it:** \`bun install\` then \`bun run dev\`.
    `);
  });

  test('legal stubs are the TODO placeholder docs', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(readFileSync(join(dir, 'legal', 'privacy.md'), 'utf-8')).toResemble(`
      # Privacy Policy

      <!-- TODO: replace this stub before publishing to the App Store or Play Store. -->
      <!-- Stores will reject your app without a real, legally-reviewed privacy policy. -->

      This app collects no personal data.
    `);
    expect(readFileSync(join(dir, 'legal', 'terms.md'), 'utf-8')).toResemble(`
      # Terms of Service

      <!-- TODO: replace this stub with real terms before publishing. -->

      By using this app, you agree to use it responsibly.
    `);
  });

  test('writes .prettierrc', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const rc = JSON.parse(readFileSync(join(dir, '.prettierrc'), 'utf-8'));
    expect(rc.singleQuote).toBe(true);
    expect(rc.tabWidth).toBe(2);
  });

  test('writes eslint.config.js referencing typescript-eslint', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    expect(readFileSync(join(dir, 'eslint.config.js'), 'utf-8')).toResemble(`
      import tseslint from 'typescript-eslint';
      import prettierConfig from 'eslint-config-prettier';

      export default tseslint.config(
        ...tseslint.configs.recommended,
        prettierConfig,
        {
          rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
          },
        },
      );
    `);
  });

  test('is idempotent — re-running does not duplicate content', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const themeFirst = readFileSync(join(dir, 'config', 'theme.ts'), 'utf-8');
    scaffoldBase(dir);
    const themeSecond = readFileSync(join(dir, 'config', 'theme.ts'), 'utf-8');
    expect(themeFirst).toBe(themeSecond);
  });
});

describe('scaffoldSkeleton', () => {
  test('blank — writes src/App.tsx and locales/en.json', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'blank', 'mobile');

    expect(() => readFileSync(join(dir, 'src', 'App.tsx'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'locales', 'en.json'))).not.toThrow();
  });

  test('tabs — writes HomeScreen, DiscoverScreen, SettingsScreen', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'tabs', 'mobile');

    const files = new Bun.Glob('src/**/*.tsx').scanSync(dir);
    const fileList = [...files];
    expect(fileList.some((f) => f.includes('HomeScreen'))).toBe(true);
    expect(fileList.some((f) => f.includes('DiscoverScreen'))).toBe(true);
    expect(fileList.some((f) => f.includes('SettingsScreen'))).toBe(true);
  });

  test('tray — App.tsx is the menu-bar skeleton', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'tray', 'desktop');
    expect(readFileSync(join(dir, 'src', 'App.tsx'), 'utf-8')).toResemble(`
      import { AppBar, Center, Column, ElevatedButton, MaterialApp, Scaffold, Text } from 'flutter-tsx';
      import { useStats } from './stores/stats';

      export const MainApp = () => {
        const { count, bump } = useStats();
        return (
          <MaterialApp title="Tray App">
            <Scaffold appBar={<AppBar title={<Text>Tray App</Text>} />}>
              <Center>
                <Column>
                  <Text>Running in the menu bar — close the window, reopen from the tray.</Text>
                  <Text>Clicks: {count}</Text>
                  <ElevatedButton onClick={bump}><Text>Bump</Text></ElevatedButton>
                </Column>
              </Center>
            </Scaffold>
          </MaterialApp>
        );
      };
    `);
  });

  test('tray — writes config/tray.ts enabling tray mode', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'tray', 'desktop');
    // Presence of config/tray.ts turns on system-tray mode (window_manager +
    // tray_manager bootstrap is generated by fsx at build time).
    expect(readFileSync(join(dir, 'config', 'tray.ts'), 'utf-8')).toResemble(`
      import type { TrayConfig } from 'flutter-tsx/config';

      // Presence of this file enables system-tray / menubar mode.
      export default {
        tooltip: 'Tray App',
        menu: [
          { label: 'Show', action: 'show' },
          { label: 'Hide', action: 'hide' },
          { label: 'Quit', action: 'quit' },
        ],
      } satisfies TrayConfig;
    `);
  });

  test('locale keys are merged — existing keys preserved when re-scaffolding', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'blank', 'mobile');
    const firstContent = readFileSync(join(dir, 'locales', 'en.json'), 'utf-8');
    scaffoldSkeleton(dir, 'blank', 'mobile');
    const secondContent = readFileSync(
      join(dir, 'locales', 'en.json'),
      'utf-8',
    );
    expect(firstContent).toBe(secondContent);
  });

  test('sidebar rejected for web target', () => {
    const dir = mkTmp();
    expect(() => scaffoldSkeleton(dir, 'sidebar', 'web')).toThrow(
      /sidebar.*not valid.*web/i,
    );
  });

  test('tabs rejected for web target', () => {
    const dir = mkTmp();
    expect(() => scaffoldSkeleton(dir, 'tabs', 'web')).toThrow(
      /tabs.*not valid.*web/i,
    );
  });

  test('dashboard rejected for mobile target', () => {
    const dir = mkTmp();
    expect(() => scaffoldSkeleton(dir, 'dashboard', 'mobile')).toThrow(
      /dashboard.*not valid.*mobile/i,
    );
  });

  test('blank works for every target category', () => {
    const cats: TargetCategory[] = ['mobile', 'desktop', 'web'];
    for (const cat of cats) {
      const dir = mkTmp();
      expect(() => scaffoldSkeleton(dir, 'blank', cat)).not.toThrow();
      expect(() => readFileSync(join(dir, 'src', 'App.tsx'))).not.toThrow();
    }
  });

  test('unknown skeleton throws', () => {
    const dir = mkTmp();
    expect(() => scaffoldSkeleton(dir, 'nonexistent', 'mobile')).toThrow(
      /nonexistent/,
    );
  });

  test('tabs locales/en.json is valid JSON with app.title key', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'tabs', 'mobile');
    const locale = JSON.parse(
      readFileSync(join(dir, 'locales', 'en.json'), 'utf-8'),
    ) as Record<string, string>;
    expect(locale['app.title']).toBeTruthy();
  });
});

describe('scaffoldSkeleton — all registered skeletons smoke test', () => {
  for (const [cat, skeletons] of Object.entries(SKELETON_CATALOG) as [
    TargetCategory,
    SkeletonDef[],
  ][]) {
    for (const skeleton of skeletons) {
      test(`${cat}/${skeleton.name} — writes src/App.tsx without throwing`, () => {
        const dir = mkTmp();
        scaffoldSkeleton(dir, skeleton.name, cat as TargetCategory);
        expect(() => readFileSync(join(dir, 'src', 'App.tsx'))).not.toThrow();
      });
    }
  }
});
