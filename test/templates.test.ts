import { describe, expect, test } from 'bun:test';

import { appConfig, userPackageJson } from '@src/index.js';

interface UserPkg {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
}

describe('userPackageJson — dev script contract', () => {
  const pkg = JSON.parse(userPackageJson('my-app')) as UserPkg;

  test('default `dev` script omits --target (relies on config/app.ts fallback)', () => {
    // Regression guard: flutter-tsx's `fsx dev` resolves the target from
    // config/app.ts when no --target flag is passed. Hardcoding a target here
    // (e.g. `fsx dev --target=web`) would silently break multi-target configs.
    expect(pkg.scripts.dev).toBe('fsx dev');
    expect(pkg.scripts.dev).not.toContain('--target');
  });

  test('per-target scripts still pass an explicit --target', () => {
    expect(pkg.scripts['dev:web']).toBe('fsx dev --target=web');
    expect(pkg.scripts['dev:ios']).toBe('fsx dev --target=ios');
    expect(pkg.scripts['dev:android']).toBe('fsx dev --target=android');
  });

  test('default `build` script omits --target (same config fallback as dev)', () => {
    expect(pkg.scripts.build).toBe('fsx build');
    expect(pkg.scripts.build).not.toContain('--target');
  });

  test('per-target build scripts pass an explicit --target', () => {
    expect(pkg.scripts['build:web']).toBe('fsx build --target=web');
    expect(pkg.scripts['build:ios']).toBe('fsx build --target=ios');
    expect(pkg.scripts['build:android']).toBe('fsx build --target=android');
  });

  test('depends on flutter-tsx via a caret range', () => {
    expect(pkg.dependencies['flutter-tsx']).toMatch(/^\^/);
  });
});

describe('appConfig — always embeds a target', () => {
  for (const target of ['web', 'ios', 'android', 'macos'] as const) {
    test(`target '${target}' is embedded so the dev fallback has a value`, () => {
      const src = appConfig('my-app', 'com.example.myapp', target);
      expect(src).toContain(`target: '${target}'`);
    });
  }

  test('is typed via `satisfies AppConfig` from flutter-tsx/config', () => {
    const src = appConfig('my-app', 'com.example.myapp', 'web');
    expect(src).toContain(
      "import type { AppConfig } from 'flutter-tsx/config'",
    );
    expect(src).toContain('satisfies AppConfig');
  });

  test('defaults the target to web when omitted', () => {
    const src = appConfig('my-app', 'com.example.myapp');
    expect(src).toContain("target: 'web'");
  });
});
