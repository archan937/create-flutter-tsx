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

  test('per-target dev scripts cover all six platforms', () => {
    for (const t of ['web', 'ios', 'android', 'macos', 'windows', 'linux']) {
      expect(pkg.scripts[`dev:${t}`]).toBe(`fsx dev --target=${t}`);
    }
  });

  test('default `build` script omits --target (same config fallback as dev)', () => {
    expect(pkg.scripts.build).toBe('fsx build');
    expect(pkg.scripts.build).not.toContain('--target');
  });

  test('per-target build scripts cover all six platforms', () => {
    for (const t of ['web', 'ios', 'android', 'macos', 'windows', 'linux']) {
      expect(pkg.scripts[`build:${t}`]).toBe(`fsx build --target=${t}`);
    }
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
