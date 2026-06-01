import { intro, isCancel, outro, select, spinner, text } from '@clack/prompts';
import { defineCommand } from 'citty';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

import {
  scaffoldBase,
  scaffoldSkeleton,
  SKELETON_CATALOG,
  type TargetCategory,
  targetCategory,
} from './scaffold.js';
import {
  appConfig,
  gitignore,
  userPackageJson,
  userTsconfig,
} from './templates.js';

const TARGET_PLATFORMS = [
  'web',
  'ios',
  'android',
  'macos',
  'windows',
  'linux',
] as const;
type TargetPlatform = (typeof TARGET_PLATFORMS)[number];

const isValidTarget = (v: string): v is TargetPlatform =>
  (TARGET_PLATFORMS as readonly string[]).includes(v);

const writeProject = (
  projectDir: string,
  config: { name: string; bundleId: string; target: string; template: string },
): void => {
  const { name, bundleId, target, template } = config;
  const cat: TargetCategory = targetCategory(target);

  mkdirSync(join(projectDir, 'tests'), { recursive: true });
  mkdirSync(join(projectDir, 'config'), { recursive: true });

  // Surface defaults + skeleton src/
  scaffoldBase(projectDir);
  scaffoldSkeleton(projectDir, template, cat);

  // Core project files
  writeFileSync(
    join(projectDir, 'config', 'app.ts'),
    appConfig(name, bundleId, target),
    'utf-8',
  );
  writeFileSync(
    join(projectDir, 'package.json'),
    userPackageJson(name),
    'utf-8',
  );
  writeFileSync(join(projectDir, 'tsconfig.json'), userTsconfig(), 'utf-8');
  writeFileSync(join(projectDir, '.gitignore'), gitignore(), 'utf-8');
};

export const initCmd = defineCommand({
  meta: {
    name: 'create-flutter-tsx',
    description: 'Scaffold a new flutter.tsx project',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Project name / directory',
      required: false,
    },
    bundleId: {
      type: 'string',
      description:
        'Bundle ID (e.g. com.example.myapp) — skips prompt when provided',
    },
    target: {
      type: 'string',
      description:
        'Target platform: web | ios | android | macos | windows | linux',
    },
    template: {
      type: 'string',
      description:
        'App skeleton template — skips skeleton prompt when provided',
    },
  },
  async run({ args }) {
    intro('flutter.tsx — new project');

    const projectName: string = args.name
      ? String(args.name)
      : ((): never => {
          throw new Error('Project name is required');
        })();

    const defaultBundleId = `com.example.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Bundle ID
    let bundleId: string;
    if (args.bundleId) {
      bundleId = String(args.bundleId);
    } else {
      const result = await text({
        message: 'Bundle ID:',
        placeholder: defaultBundleId,
        initialValue: defaultBundleId,
      });
      if (isCancel(result)) process.exit(0);
      bundleId = String(result);
    }

    // Target platform
    let target: TargetPlatform;
    if (args.target) {
      const raw = String(args.target);
      if (!isValidTarget(raw)) {
        console.error(
          `Invalid target "${raw}". Valid: ${TARGET_PLATFORMS.join(', ')}`,
        );
        process.exit(1);
      }
      target = raw;
    } else {
      const category = await select({
        message: 'What kind of device are you building for?',
        options: [
          { value: 'web', label: 'Web (fastest to start in browser)' },
          { value: 'mobile', label: 'Mobile — iOS / Android' },
          { value: 'desktop', label: 'Desktop — macOS / Windows / Linux' },
        ],
      });
      if (isCancel(category)) process.exit(0);

      if (category === 'mobile') {
        const platform = await select({
          message: 'Mobile target:',
          options: [
            { value: 'ios', label: 'iOS' },
            { value: 'android', label: 'Android' },
          ],
        });
        if (isCancel(platform)) process.exit(0);
        target = platform as TargetPlatform;
      } else if (category === 'desktop') {
        const platform = await select({
          message: 'Desktop target:',
          options: [
            { value: 'macos', label: 'macOS' },
            { value: 'windows', label: 'Windows' },
            { value: 'linux', label: 'Linux' },
          ],
        });
        if (isCancel(platform)) process.exit(0);
        target = platform as TargetPlatform;
      } else {
        target = 'web';
      }
    }

    const cat: TargetCategory = targetCategory(target);
    const skeletons = SKELETON_CATALOG[cat];

    // Skeleton / template
    let template: string;
    if (args.template) {
      const raw = String(args.template);
      if (!skeletons.some((s) => s.name === raw)) {
        const valid = skeletons.map((s) => s.name).join(', ');
        console.error(
          `"${raw}" is not a valid template for ${target}; choose one of: ${valid}`,
        );
        process.exit(1);
      }
      template = raw;
    } else {
      const chosen = await select({
        message: 'What kind of app?',
        options: skeletons.map((s) => ({
          value: s.name,
          label: s.label,
          hint: s.description,
        })),
      });
      if (isCancel(chosen)) process.exit(0);
      template = String(chosen);
    }

    const projectDir = resolve(projectName);

    if (existsSync(projectDir)) {
      console.warn(
        `Directory ${projectDir} already exists. Files may be overwritten.`,
      );
    }

    const s = spinner();
    s.start(`Scaffolding ${projectName}...`);

    try {
      mkdirSync(projectDir, { recursive: true });
      writeProject(projectDir, {
        name: projectName,
        bundleId,
        target,
        template,
      });
      s.stop(`Project created at ${projectDir}`);
    } catch (err) {
      s.stop('Failed to scaffold project');
      console.error(err);
      process.exit(1);
    }

    outro(
      [
        `Next steps:`,
        `  cd ${projectName}`,
        `  bun install`,
        `  bunx fsx install   # one-time: downloads the Flutter SDK (skip if you already have Flutter)`,
        `  bun run dev`,
      ].join('\n'),
    );
  },
});
