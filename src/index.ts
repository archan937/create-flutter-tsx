import { runMain } from 'citty';

import { initCmd } from './init.js';

export { initCmd };
export { runMain };
export {
  scaffoldBase,
  scaffoldSkeleton,
  SKELETON_CATALOG,
  type SkeletonDef,
  type TargetCategory,
  targetCategory,
} from './scaffold.js';
export {
  appConfig,
  gitignore,
  userPackageJson,
  userTsconfig,
} from './templates.js';

export const runInit = (argv: string[]): Promise<void> =>
  runMain(initCmd, { rawArgs: argv });
