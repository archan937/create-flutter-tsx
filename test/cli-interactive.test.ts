// mock.module must be called before any import that transitively pulls in
// @clack/prompts.  Bun hoists top-level mock.module() calls so they execute
// before static imports are evaluated, intercepting the module before
// init.ts binds to it.

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { runInit } from '@src/index.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface SelectOpts {
  options: { value: string }[];
}

interface SpinnerHandle {
  start: () => void;
  stop: () => void;
}

// ── Shared mock state ────────────────────────────────────────────────────────

// selectQueue drives successive select() calls within one test; push return
// values in the order the prompts fire before calling runInit.
let selectQueue: string[] = [];

mock.module('@clack/prompts', () => ({
  intro: (): void => undefined,
  outro: (): void => undefined,
  text: async (): Promise<string> => 'com.interactive.test',
  select: async (opts: SelectOpts): Promise<string> => {
    const next = selectQueue.shift();
    return next ?? opts.options[0].value;
  },
  isCancel: (): boolean => false,
  spinner: (): SpinnerHandle => ({
    start: (): void => undefined,
    stop: (): void => undefined,
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const mkTmp = (): string => mkdtempSync(join(tmpdir(), 'cft-int-'));

const originalExit = process.exit;
// Track every process.exit() call in order; throwing on each one ensures the
// function stops executing and propagates a rejection.  Citty's runMain
// error-handler calls exit(1) after catching our thrown error, so the final
// rejection message is always "process.exit(1)" — inspect exitCalls to verify
// which codes were actually requested.
let exitCalls: number[] = [];

beforeEach(() => {
  exitCalls = [];
  selectQueue = [];
  process.exit = ((code?: number): never => {
    const c = code ?? 0;
    exitCalls.push(c);
    throw new Error(`process.exit(${String(c)})`);
  }) as typeof process.exit;
});

afterEach(() => {
  process.exit = originalExit;
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('runInit — interactive prompts', () => {
  test('web flow: prompts for bundleId → web target → blank template', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      // select calls: 1st = target category ('web'), 2nd = template ('blank')
      selectQueue = ['web', 'blank'];
      await runInit(['int-web-app']);
      expect(existsSync(join(tmp, 'int-web-app', 'config', 'app.ts'))).toBe(
        true,
      );
      expect(existsSync(join(tmp, 'int-web-app', 'src', 'App.tsx'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true });
    }
  });

  test('mobile flow: prompts target=mobile → ios sub-select → tabs template', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      // select calls: 1st = category ('mobile'), 2nd = platform ('ios'), 3rd = template ('tabs')
      selectQueue = ['mobile', 'ios', 'tabs'];
      await runInit(['int-mobile-app']);
      expect(existsSync(join(tmp, 'int-mobile-app', 'config', 'app.ts'))).toBe(
        true,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true });
    }
  });

  test('desktop flow: prompts target=desktop → macos sub-select → tray template', async () => {
    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      // select calls: 1st = category ('desktop'), 2nd = platform ('macos'), 3rd = template ('tray')
      selectQueue = ['desktop', 'macos', 'tray'];
      await runInit(['int-desktop-app']);
      expect(existsSync(join(tmp, 'int-desktop-app', 'config', 'app.ts'))).toBe(
        true,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true });
    }
  });

  test('isCancel on bundleId prompt triggers exit(0)', async () => {
    // Override text mock to return a cancel symbol; isCancel then returns true.
    // init.ts calls process.exit(0), which our mock throws as an error.
    // Citty's runMain error-handler catches that and calls process.exit(1), so
    // the promise ultimately rejects with "process.exit(1)".  We verify that
    // exit(0) appeared as the FIRST exit call — that is the code from init.ts.
    mock.module('@clack/prompts', () => ({
      intro: (): void => undefined,
      outro: (): void => undefined,
      text: async (): Promise<symbol> => Symbol('cancel'),
      select: async (opts: SelectOpts): Promise<string> =>
        opts.options[0].value,
      isCancel: (v: unknown): boolean => typeof v === 'symbol',
      spinner: (): SpinnerHandle => ({
        start: (): void => undefined,
        stop: (): void => undefined,
      }),
    }));

    const tmp = mkTmp();
    const originalCwd = process.cwd();
    process.chdir(tmp);

    try {
      await expect(runInit(['cancelled-app'])).rejects.toThrow(/process\.exit/);
      // exit(0) must be the first call — that is the isCancel branch in init.ts
      expect(exitCalls[0]).toBe(0);
    } finally {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true });
    }
  });
});
