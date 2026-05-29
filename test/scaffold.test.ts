import {
  scaffoldBase,
  scaffoldSkeleton,
  SKELETON_CATALOG,
  type SkeletonDef,
  type TargetCategory,
  targetCategory,
} from '@src/scaffold.js';
import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

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
  test('writes all surface files', () => {
    const dir = mkTmp();
    scaffoldBase(dir);

    expect(() => readFileSync(join(dir, 'theme.toml'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'permissions.toml'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'links.toml'))).not.toThrow();
    expect(() => readFileSync(join(dir, '.env'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'legal', 'privacy.md'))).not.toThrow();
    expect(() => readFileSync(join(dir, 'legal', 'terms.md'))).not.toThrow();
  });

  test('writes icon placeholder PNGs', () => {
    const dir = mkTmp();
    scaffoldBase(dir);

    const icon = readFileSync(join(dir, 'icons', 'icon.png'));
    const darkIcon = readFileSync(join(dir, 'icons', 'dark', 'icon.png'));
    expect(icon.length).toBeGreaterThan(100);
    expect(darkIcon.length).toBeGreaterThan(100);
  });

  test('permissions.toml is all-commented (no active keys)', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const content = readFileSync(join(dir, 'permissions.toml'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.includes('=') && !trimmed.startsWith('#')) {
        throw new Error(`Unexpected active permission key: ${line}`);
      }
    }
  });

  test('links.toml is all-commented (no active keys)', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const content = readFileSync(join(dir, 'links.toml'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.includes('=') && !trimmed.startsWith('#')) {
        throw new Error(`Unexpected active links key: ${line}`);
      }
    }
  });

  test('legal stubs contain TODO marker', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const privacy = readFileSync(join(dir, 'legal', 'privacy.md'), 'utf-8');
    const terms = readFileSync(join(dir, 'legal', 'terms.md'), 'utf-8');
    expect(privacy).toContain('TODO');
    expect(terms).toContain('TODO');
  });

  test('theme.toml has primary color', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const content = readFileSync(join(dir, 'theme.toml'), 'utf-8');
    expect(content).toContain('primary');
    expect(content).toContain('#54a4ff');
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
    const content = readFileSync(join(dir, 'eslint.config.js'), 'utf-8');
    expect(content).toContain('typescript-eslint');
  });

  test('is idempotent — re-running does not duplicate content', () => {
    const dir = mkTmp();
    scaffoldBase(dir);
    const themeFirst = readFileSync(join(dir, 'theme.toml'), 'utf-8');
    scaffoldBase(dir);
    const themeSecond = readFileSync(join(dir, 'theme.toml'), 'utf-8');
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

  test('tray — App.tsx mentions tray_manager', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'tray', 'desktop');
    const app = readFileSync(join(dir, 'src', 'App.tsx'), 'utf-8');
    expect(app.toLowerCase()).toContain('tray');
  });

  test('tray — writes tray_manager to app.toml extras or plugin hint file', () => {
    const dir = mkTmp();
    scaffoldSkeleton(dir, 'tray', 'desktop');
    // tray skeleton should write a tray plugin hint file
    const hint = readFileSync(join(dir, 'src', '.tray-plugins.json'), 'utf-8');
    const plugins: string[] = JSON.parse(hint) as string[];
    expect(plugins).toContain('tray_manager');
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
