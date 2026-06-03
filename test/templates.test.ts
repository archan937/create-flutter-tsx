import './helpers/resemble.js';

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
    // config/app.ts when no --target flag is passed. The exact-equality check
    // proves no --target is hardcoded (which would break multi-target configs).
    expect(pkg.scripts.dev).toBe('fsx dev');
  });

  test('per-target dev scripts cover all six platforms', () => {
    for (const t of ['web', 'ios', 'android', 'macos', 'windows', 'linux']) {
      expect(pkg.scripts[`dev:${t}`]).toBe(`fsx dev --target=${t}`);
    }
  });

  test('default `build` script omits --target (same config fallback as dev)', () => {
    expect(pkg.scripts.build).toBe('fsx build');
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
      expect(appConfig('my-app', 'com.example.myapp', target)).toResemble(`
        import type { AppConfig } from 'flutter-tsx/config';

        export default {
          name: 'my-app',
          bundleId: 'com.example.myapp',
          target: '${target}',
        } satisfies AppConfig;
      `);
    });
  }

  test('defaults the target to web when omitted', () => {
    expect(appConfig('my-app', 'com.example.myapp')).toResemble(`
      import type { AppConfig } from 'flutter-tsx/config';

      export default {
        name: 'my-app',
        bundleId: 'com.example.myapp',
        target: 'web',
      } satisfies AppConfig;
    `);
  });
});
