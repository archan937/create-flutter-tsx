export const appConfig = (
  appName: string,
  bundleId: string,
  target = 'web',
): string => `import type { AppConfig } from 'flutter-tsx/config';

export default {
  name: '${appName}',
  bundleId: '${bundleId}',
  target: '${target}',
} satisfies AppConfig;
`;

export const userPackageJson = (appName: string): string => {
  const pkg = {
    name: appName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'fsx dev',
      'dev:ios': 'fsx dev --target=ios',
      'dev:android': 'fsx dev --target=android',
      'dev:macos': 'fsx dev --target=macos',
      'dev:web': 'fsx dev --target=web',
    },
    dependencies: {
      'flutter-tsx': '^0.1.0',
    },
    devDependencies: {
      '@types/bun': '^1.2.0',
    },
  };
  return JSON.stringify(pkg, null, 2) + '\n';
};

export const userTsconfig = (): string => {
  const config = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      lib: ['ESNext'],
      strict: true,
      jsx: 'react-jsx',
      jsxImportSource: 'flutter-tsx',
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ['src/**/*', 'config/**/*'],
    exclude: ['node_modules'],
  };
  return JSON.stringify(config, null, 2) + '\n';
};

export const gitignore = (): string => `# Dependencies
node_modules/

# Flutter.tsx build artifacts
.fsx/

# Flutter
build/
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages

# Environment / secrets
.env
.env.*
signing/
push/APNs.p8

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/settings.json
.idea/
*.swp
*.swo
`;
