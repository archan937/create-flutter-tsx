import './helpers/resemble.js';

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { runInit } from '@src/index.js';

// Capture process.exit so tests don't actually terminate
const originalExit = process.exit;
let exitCode: number | undefined;

beforeEach(() => {
  exitCode = undefined;
  process.exit = ((code?: number) => {
    exitCode = code ?? 0;
    throw new Error(`process.exit(${String(code)})`);
  }) as typeof process.exit;
});

afterEach(() => {
  process.exit = originalExit;
});

const mkTmp = (): string => mkdtempSync(join(tmpdir(), 'cft-cli-'));

describe('runInit — non-interactive mode', () => {
  test('scaffolds complete project tree from flags', async () => {
    const tmp = mkTmp();
    const name = 'demo-app';
    const dir = join(tmp, name);
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await runInit([
        name,
        '--bundleId=com.example.demo',
        '--target=web',
        '--template=blank',
      ]);
    } finally {
      process.chdir(originalCwd);
    }

    // Core project files
    expect(existsSync(join(dir, 'config', 'app.ts'))).toBe(true);
    expect(existsSync(join(dir, 'package.json'))).toBe(true);
    expect(existsSync(join(dir, 'tsconfig.json'))).toBe(true);
    expect(existsSync(join(dir, '.gitignore'))).toBe(true);

    // Surface defaults written by scaffoldBase
    expect(existsSync(join(dir, 'config', 'theme.ts'))).toBe(true);
    expect(existsSync(join(dir, 'icons', 'icon.png'))).toBe(true);
    expect(existsSync(join(dir, 'locales', 'en.json'))).toBe(true);
    expect(existsSync(join(dir, 'legal', 'privacy.md'))).toBe(true);

    // Skeleton src/ files
    expect(existsSync(join(dir, 'src', 'App.tsx'))).toBe(true);

    rmSync(tmp, { recursive: true });
  });

  test('config/app.ts contains bundleId and target', async () => {
    const tmp = mkTmp();
    const name = 'my-app';
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await runInit([
        name,
        '--bundleId=com.test.myapp',
        '--target=ios',
        '--template=blank',
      ]);
    } finally {
      process.chdir(originalCwd);
    }

    const appConfigTs = readFileSync(
      join(tmp, name, 'config', 'app.ts'),
      'utf-8',
    );
    expect(appConfigTs).toResemble(`
      import type { AppConfig } from 'flutter-tsx/config';

      export default {
        name: 'my-app',
        bundleId: 'com.test.myapp',
        target: 'ios',
      } satisfies AppConfig;
    `);

    rmSync(tmp, { recursive: true });
  });

  test('package.json references flutter-tsx dependency', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await runInit([
        'my-app',
        '--bundleId=com.x.y',
        '--target=web',
        '--template=blank',
      ]);
    } finally {
      process.chdir(originalCwd);
    }

    const pkg = JSON.parse(
      readFileSync(join(tmp, 'my-app', 'package.json'), 'utf-8'),
    ) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies['flutter-tsx']).toBeTruthy();

    rmSync(tmp, { recursive: true });
  });

  test('tabs skeleton produces HomeScreen and DiscoverScreen', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await runInit([
        'my-app',
        '--bundleId=com.x.y',
        '--target=ios',
        '--template=tabs',
      ]);
    } finally {
      process.chdir(originalCwd);
    }

    const files = [
      ...new Bun.Glob('src/**/*.tsx').scanSync(join(tmp, 'my-app')),
    ];
    expect(files.some((f) => f.includes('HomeScreen'))).toBe(true);
    expect(files.some((f) => f.includes('DiscoverScreen'))).toBe(true);

    rmSync(tmp, { recursive: true });
  });

  test('invalid --target exits with code 1', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await expect(
        runInit(['my-app', '--bundleId=com.x.y', '--target=invalid']),
      ).rejects.toThrow('process.exit(1)');
      expect(exitCode).toBe(1);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('invalid --template for target exits with code 1', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await expect(
        runInit([
          'my-app',
          '--bundleId=com.x.y',
          '--target=web',
          '--template=sidebar',
        ]),
      ).rejects.toThrow('process.exit(1)');
      expect(exitCode).toBe(1);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('missing project name throws (non-interactive CI guard)', async () => {
    await expect(runInit([])).rejects.toThrow();
  });

  test('warns and continues when project directory already exists', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      mkdirSync(join(tmp, 'pre-existing'), { recursive: true });

      const warnCalls: unknown[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: unknown[]): void => {
        warnCalls.push(args);
      };

      try {
        await runInit([
          'pre-existing',
          '--bundleId=com.x.y',
          '--target=web',
          '--template=blank',
        ]);
      } finally {
        console.warn = originalWarn;
      }

      expect(warnCalls.some((c) => String(c).includes('already exists'))).toBe(
        true,
      );
      expect(existsSync(join(tmp, 'pre-existing', 'config', 'app.ts'))).toBe(
        true,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true });
    }
  });

  test('scaffold error exits with code 1', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      // Place a FILE at the project path — mkdirSync will throw ENOTDIR
      writeFileSync(join(tmp, 'broken-app'), 'blocker');

      await expect(
        runInit([
          'broken-app',
          '--bundleId=com.x.y',
          '--target=web',
          '--template=blank',
        ]),
      ).rejects.toThrow('process.exit(1)');
      expect(exitCode).toBe(1);
    } finally {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true });
    }
  });
});

describe('runInit — delegation contract', () => {
  test('scaffoldBase side-effects are present after init', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await runInit([
        'spy-app',
        '--bundleId=com.spy.test',
        '--target=web',
        '--template=blank',
      ]);
    } finally {
      process.chdir(originalCwd);
    }

    // All surface files prove scaffoldBase ran fully
    expect(existsSync(join(tmp, 'spy-app', 'config', 'theme.ts'))).toBe(true);
    expect(existsSync(join(tmp, 'spy-app', 'config', 'permissions.ts'))).toBe(
      true,
    );
    expect(existsSync(join(tmp, 'spy-app', 'config', 'links.ts'))).toBe(true);
    expect(existsSync(join(tmp, 'spy-app', 'legal', 'privacy.md'))).toBe(true);

    rmSync(tmp, { recursive: true });
  });
});
