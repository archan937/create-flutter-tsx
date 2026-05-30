import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export type TargetCategory = 'mobile' | 'desktop' | 'web';

export interface SkeletonDef {
  name: string;
  label: string;
  description: string;
  files: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Base file contents
// ---------------------------------------------------------------------------

const CONFIG_THEME_TS = `import type { Theme } from 'flutter-tsx/config';

// Brand colors → a full Material 3 theme is generated and applied to your
// MaterialApp. A single primary color seeds the whole scheme.
export default {
  light: { primary: '#54a4ff' },
  // dark: { primary: '#0d1117' },
} satisfies Theme;
`;

const CONFIG_PERMISSIONS_TS = `import type { Permissions } from 'flutter-tsx/config';

// Permissions are inferred from the hooks you use (e.g. useCamera() → camera),
// so most apps need nothing here. Add an entry only to customize the iOS usage
// description shown in the system prompt.
export default {
  // camera: 'Scan QR codes in the app.',
} satisfies Permissions;
`;

const CONFIG_LINKS_TS = `import type { Links } from 'flutter-tsx/config';

// Deep links + universal/app links — one declaration, both platforms.
export default {
  // scheme: 'myapp',              // myapp://...
  // domains: ['app.example.com'], // https://... universal links
} satisfies Links;
`;

const CONFIG_ENV_TS = `import type { EnvConfig } from 'flutter-tsx/config';

// Build-time values → passed to the app as --dart-define. Because this is
// TypeScript, you can read process.env here for secrets and provide defaults.
export default {
  // API_URL: process.env.API_URL ?? 'https://api.example.com',
} satisfies EnvConfig;
`;

const AGENTS_MD = `# Working in this project (for AI assistants)

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
`;

const PRIVACY_MD = `# Privacy Policy

<!-- TODO: replace this stub before publishing to the App Store or Play Store. -->
<!-- Stores will reject your app without a real, legally-reviewed privacy policy. -->

This app collects no personal data.
`;

const TERMS_MD = `# Terms of Service

<!-- TODO: replace this stub with real terms before publishing. -->

By using this app, you agree to use it responsibly.
`;

const PRETTIER_RC = `{
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
`;

const ESLINT_CONFIG_JS = `import tseslint from 'typescript-eslint';
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
`;

// ---------------------------------------------------------------------------
// Skeleton file contents
// ---------------------------------------------------------------------------

const LOCALE_EN_BASIC = `{
  "app.title": "My App"
}
`;

// --- Mobile skeletons -------------------------------------------------------

const MOBILE_BLANK_APP_TSX = `import { useState } from 'flutter-tsx';
import { Center, Column, ElevatedButton, MaterialApp, Scaffold, Text } from 'flutter-tsx';

export const MainApp = () => {
  const [count, setCount] = useState(0);
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Center>
          <Column>
            <Text>Count: {count}</Text>
            <ElevatedButton onPressed={() => setCount(count + 1)}>
              <Text>Tap me</Text>
            </ElevatedButton>
          </Column>
        </Center>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const MOBILE_TABS_APP_TSX = `import { useState } from 'flutter-tsx';
import { Column, ElevatedButton, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';
import { DiscoverScreen } from './screens/DiscoverScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';

export const MainApp = () => {
  const [tab, setTab] = useState(0);
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Column>
          {tab === 0 && <HomeScreen />}
          {tab === 1 && <DiscoverScreen />}
          {tab === 2 && <SettingsScreen />}
          <Row>
            <ElevatedButton onPressed={() => setTab(0)}>
              <Text>Home</Text>
            </ElevatedButton>
            <ElevatedButton onPressed={() => setTab(1)}>
              <Text>Discover</Text>
            </ElevatedButton>
            <ElevatedButton onPressed={() => setTab(2)}>
              <Text>Settings</Text>
            </ElevatedButton>
          </Row>
        </Column>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const MOBILE_HOME_SCREEN_TSX = `import { Center, Text } from 'flutter-tsx';

export const HomeScreen = () => (
  <Center>
    <Text>Home</Text>
  </Center>
);
`;

const MOBILE_DISCOVER_SCREEN_TSX = `import { Center, Text } from 'flutter-tsx';

export const DiscoverScreen = () => (
  <Center>
    <Text>Discover</Text>
  </Center>
);
`;

const MOBILE_SETTINGS_SCREEN_TSX = `import { Center, Text } from 'flutter-tsx';

export const SettingsScreen = () => (
  <Center>
    <Text>Settings</Text>
  </Center>
);
`;

const MOBILE_DRAWER_APP_TSX = `import { useState } from 'flutter-tsx';
import { Drawer, DrawerHeader, ListTile, MaterialApp, Scaffold, Text } from 'flutter-tsx';

export const MainApp = () => {
  const [page, setPage] = useState('home');
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Drawer>
          <DrawerHeader>
            <Text>Menu</Text>
          </DrawerHeader>
          <ListTile title="Home" onTap={() => setPage('home')} />
          <ListTile title="About" onTap={() => setPage('about')} />
        </Drawer>
        <Text>Current page: {page}</Text>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const MOBILE_LIST_DETAIL_APP_TSX = `import { useState } from 'flutter-tsx';
import { ListTile, ListView, MaterialApp, Scaffold, Text } from 'flutter-tsx';

const ITEMS = ['Item 1', 'Item 2', 'Item 3'];

export const MainApp = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <MaterialApp title="My App">
      <Scaffold>
        {selected == null ? (
          <ListView>
            {ITEMS.map((item) => (
              <ListTile key={item} title={item} onTap={() => setSelected(item)} />
            ))}
          </ListView>
        ) : (
          <Text>{selected}</Text>
        )}
      </Scaffold>
    </MaterialApp>
  );
};
`;

const MOBILE_FEED_APP_TSX = `import { Card, ListView, MaterialApp, Scaffold, Text } from 'flutter-tsx';

const POSTS = ['Post 1', 'Post 2', 'Post 3', 'Post 4', 'Post 5'];

export const MainApp = () => (
  <MaterialApp title="Feed">
    <Scaffold>
      <ListView>
        {POSTS.map((post) => (
          <Card key={post}>
            <Text>{post}</Text>
          </Card>
        ))}
      </ListView>
    </Scaffold>
  </MaterialApp>
);
`;

const MOBILE_WIZARD_APP_TSX = `import { useState } from 'flutter-tsx';
import { Column, ElevatedButton, MaterialApp, Scaffold, Text, TextField } from 'flutter-tsx';

const STEPS = ['Name', 'Email', 'Review'];

export const MainApp = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <MaterialApp title="Setup">
      <Scaffold>
        <Column>
          <Text>Step {step + 1} of {STEPS.length}: {STEPS[step]}</Text>
          {step === 0 && <TextField label="Your name" onChanged={(v) => setName(v)} />}
          {step === 1 && <TextField label="Your email" onChanged={(v) => setEmail(v)} />}
          {step === 2 && <Text>Name: {name}, Email: {email}</Text>}
          {step < STEPS.length - 1 && (
            <ElevatedButton onPressed={() => setStep(step + 1)}>
              <Text>Next</Text>
            </ElevatedButton>
          )}
        </Column>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const MOBILE_AUTH_TABS_APP_TSX = `import { useState } from 'flutter-tsx';
import { Center, Column, ElevatedButton, MaterialApp, Row, Scaffold, Text, TextField } from 'flutter-tsx';

export const MainApp = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState(0);
  if (!loggedIn) {
    return (
      <MaterialApp title="My App">
        <Scaffold>
          <Center>
            <Column>
              <TextField label="Email" />
              <TextField label="Password" />
              <ElevatedButton onPressed={() => setLoggedIn(true)}>
                <Text>Log In</Text>
              </ElevatedButton>
            </Column>
          </Center>
        </Scaffold>
      </MaterialApp>
    );
  }
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Column>
          {tab === 0 && <Center><Text>Home</Text></Center>}
          {tab === 1 && <Center><Text>Profile</Text></Center>}
          <Row>
            <ElevatedButton onPressed={() => setTab(0)}>
              <Text>Home</Text>
            </ElevatedButton>
            <ElevatedButton onPressed={() => setTab(1)}>
              <Text>Profile</Text>
            </ElevatedButton>
          </Row>
        </Column>
      </Scaffold>
    </MaterialApp>
  );
};
`;

// --- Desktop skeletons ------------------------------------------------------

const DESKTOP_BLANK_APP_TSX = `import { AppBar, MaterialApp, Scaffold, Text } from 'flutter-tsx';

export const MainApp = () => (
  <MaterialApp title="My App">
    <Scaffold>
      <AppBar title="My App" />
      <Text>Hello, desktop!</Text>
    </Scaffold>
  </MaterialApp>
);
`;

const DESKTOP_TRAY_APP_TSX = `// src/App.tsx — menubar / system-tray app
// Uses the tray_manager plugin. Run: dart pub add tray_manager
import { Container, MaterialApp } from 'flutter-tsx';

// useTray hook (tray_manager): registers a system-tray icon on startup
// and shows a popup menu with Quit action.
// See: https://pub.dev/packages/tray_manager
export const MainApp = () => (
  <MaterialApp title="Tray App">
    <Container />
  </MaterialApp>
);
`;

const DESKTOP_SIDEBAR_APP_TSX = `import { useState } from 'flutter-tsx';
import { Column, Container, ListTile, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';

const ITEMS = ['Home', 'Projects', 'Settings'];

export const MainApp = () => {
  const [selected, setSelected] = useState('Home');
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Row>
          <Container width={200}>
            <Column>
              {ITEMS.map((item) => (
                <ListTile key={item} title={item} onTap={() => setSelected(item)} />
              ))}
            </Column>
          </Container>
          <Container>
            <Text>{selected}</Text>
          </Container>
        </Row>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const DESKTOP_TOOLBAR_APP_TSX = `import { Column, Container, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';

export const MainApp = () => (
  <MaterialApp title="My App">
    <Scaffold>
      <Column>
        <Row>
          <Text>File</Text>
          <Text>Edit</Text>
          <Text>View</Text>
        </Row>
        <Container>
          <Text>Canvas</Text>
        </Container>
      </Column>
    </Scaffold>
  </MaterialApp>
);
`;

const DESKTOP_THREE_PANE_APP_TSX = `import { useState } from 'flutter-tsx';
import { Column, Container, ListTile, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';

const SECTIONS = ['Documents', 'Images', 'Videos'];
const ITEMS = ['Item 1', 'Item 2', 'Item 3'];

export const MainApp = () => {
  const [section, setSection] = useState('Documents');
  const [item, setItem] = useState('Item 1');
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Row>
          <Container width={160}>
            <Column>
              {SECTIONS.map((s) => (
                <ListTile key={s} title={s} onTap={() => setSection(s)} />
              ))}
            </Column>
          </Container>
          <Container width={200}>
            <Column>
              {ITEMS.map((i) => (
                <ListTile key={i} title={i} onTap={() => setItem(i)} />
              ))}
            </Column>
          </Container>
          <Container>
            <Text>{section}: {item}</Text>
          </Container>
        </Row>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const DESKTOP_TABBED_DOCUMENT_APP_TSX = `import { useState } from 'flutter-tsx';
import { Column, Container, ElevatedButton, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';

const TABS = ['Document 1', 'Document 2', 'Document 3'];

export const MainApp = () => {
  const [tab, setTab] = useState(0);
  return (
    <MaterialApp title="My App">
      <Scaffold>
        <Column>
          <Row>
            <ElevatedButton onPressed={() => setTab(0)}>
              <Text>Document 1</Text>
            </ElevatedButton>
            <ElevatedButton onPressed={() => setTab(1)}>
              <Text>Document 2</Text>
            </ElevatedButton>
            <ElevatedButton onPressed={() => setTab(2)}>
              <Text>Document 3</Text>
            </ElevatedButton>
          </Row>
          <Container>
            <Text>{TABS[tab]}</Text>
          </Container>
        </Column>
      </Scaffold>
    </MaterialApp>
  );
};
`;

// --- Web skeletons ----------------------------------------------------------

const WEB_BLANK_APP_TSX = `import { Center, MaterialApp, Scaffold, Text } from 'flutter-tsx';

export const MainApp = () => (
  <MaterialApp title="My Site">
    <Scaffold>
      <Center>
        <Text>Welcome to My Site</Text>
      </Center>
    </Scaffold>
  </MaterialApp>
);
`;

const WEB_DASHBOARD_APP_TSX = `import { AppBar, Column, Container, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';

const STATS = ['Users: 1,234', 'Revenue: $5,678', 'Orders: 910'];

export const MainApp = () => (
  <MaterialApp title="Dashboard">
    <Scaffold>
      <AppBar title="Dashboard" />
      <Row>
        <Container width={200}>
          <Column>
            <Text>Sidebar</Text>
            <Text>Overview</Text>
            <Text>Reports</Text>
          </Column>
        </Container>
        <Column>
          <Row>
            {STATS.map((stat) => (
              <Container key={stat}>
                <Text>{stat}</Text>
              </Container>
            ))}
          </Row>
        </Column>
      </Row>
    </Scaffold>
  </MaterialApp>
);
`;

const WEB_MARKETING_APP_TSX = `import { Column, Container, MaterialApp, Row, Scaffold, Text } from 'flutter-tsx';

export const MainApp = () => (
  <MaterialApp title="My Product">
    <Scaffold>
      <Column>
        <Container>
          <Text>Hero — Your tagline here</Text>
          <Text>Start for free today</Text>
        </Container>
        <Container>
          <Text>Features</Text>
          <Row>
            <Text>Fast</Text>
            <Text>Reliable</Text>
            <Text>Beautiful</Text>
          </Row>
        </Container>
        <Container>
          <Text>Pricing</Text>
        </Container>
        <Container>
          <Text>© 2026 My Product</Text>
        </Container>
      </Column>
    </Scaffold>
  </MaterialApp>
);
`;

const WEB_SECTIONS_APP_TSX = `import { Column, Container, MaterialApp, Scaffold, Text } from 'flutter-tsx';

const SECTIONS = ['About', 'Work', 'Contact'];

export const MainApp = () => (
  <MaterialApp title="My Site">
    <Scaffold>
      <Column>
        {SECTIONS.map((section) => (
          <Container key={section}>
            <Text>{section}</Text>
            <Text>Content for {section}</Text>
          </Container>
        ))}
      </Column>
    </Scaffold>
  </MaterialApp>
);
`;

const WEB_AUTH_DASH_APP_TSX = `import { useState } from 'flutter-tsx';
import { Center, Column, Container, ElevatedButton, MaterialApp, Row, Scaffold, Text, TextField } from 'flutter-tsx';

export const MainApp = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <MaterialApp title="My App">
      <Scaffold>
        {loggedIn ? (
          <Row>
            <Container width={200}>
              <Column>
                <Text>Sidebar</Text>
              </Column>
            </Container>
            <Column>
              <Text>Dashboard Content</Text>
            </Column>
          </Row>
        ) : (
          <Center>
            <Column>
              <Text>Sign In</Text>
              <TextField label="Email" />
              <TextField label="Password" />
              <ElevatedButton onPressed={() => setLoggedIn(true)}>
                <Text>Log In</Text>
              </ElevatedButton>
            </Column>
          </Center>
        )}
      </Scaffold>
    </MaterialApp>
  );
};
`;

// ---------------------------------------------------------------------------
// SKELETON_CATALOG
// ---------------------------------------------------------------------------

export const SKELETON_CATALOG: Record<TargetCategory, SkeletonDef[]> = {
  mobile: [
    {
      name: 'blank',
      label: 'Blank',
      description: 'Single screen counter with useState',
      files: {
        'src/App.tsx': MOBILE_BLANK_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'tabs',
      label: 'Bottom Tabs',
      description: 'Bottom navigation bar with 3 tabs',
      files: {
        'src/App.tsx': MOBILE_TABS_APP_TSX,
        'src/screens/HomeScreen.tsx': MOBILE_HOME_SCREEN_TSX,
        'src/screens/DiscoverScreen.tsx': MOBILE_DISCOVER_SCREEN_TSX,
        'src/screens/SettingsScreen.tsx': MOBILE_SETTINGS_SCREEN_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'drawer',
      label: 'Side Drawer',
      description: 'Left-side burger drawer navigation',
      files: {
        'src/App.tsx': MOBILE_DRAWER_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'list-detail',
      label: 'List + Detail',
      description: 'Master list that navigates to a detail screen',
      files: {
        'src/App.tsx': MOBILE_LIST_DETAIL_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'feed',
      label: 'Feed',
      description: 'Scrollable card feed with pull-to-refresh',
      files: {
        'src/App.tsx': MOBILE_FEED_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'wizard',
      label: 'Multi-step Wizard',
      description: 'Multi-step form with validation',
      files: {
        'src/App.tsx': MOBILE_WIZARD_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'auth-tabs',
      label: 'Auth + Tabs',
      description: 'Login screen that leads to a bottom nav',
      files: {
        'src/App.tsx': MOBILE_AUTH_TABS_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
  ],
  desktop: [
    {
      name: 'blank',
      label: 'Blank Window',
      description: 'Single window with a menu bar',
      files: {
        'src/App.tsx': DESKTOP_BLANK_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'tray',
      label: 'Tray App',
      description: 'Menubar / system-tray app',
      files: {
        'src/App.tsx': DESKTOP_TRAY_APP_TSX,
        'src/.tray-plugins.json': '["tray_manager"]\n',
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'sidebar',
      label: 'Sidebar',
      description: 'Left sidebar with selectable items and a detail pane',
      files: {
        'src/App.tsx': DESKTOP_SIDEBAR_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'toolbar',
      label: 'Toolbar + Canvas',
      description: 'Top toolbar with a central canvas',
      files: {
        'src/App.tsx': DESKTOP_TOOLBAR_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'three-pane',
      label: 'Three Pane',
      description: 'Sidebar + list + content pane',
      files: {
        'src/App.tsx': DESKTOP_THREE_PANE_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'tabbed-document',
      label: 'Tabbed Document',
      description: 'Top-level content tabs',
      files: {
        'src/App.tsx': DESKTOP_TABBED_DOCUMENT_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
  ],
  web: [
    {
      name: 'blank',
      label: 'Blank Page',
      description: 'Single landing page',
      files: {
        'src/App.tsx': WEB_BLANK_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'dashboard',
      label: 'Dashboard',
      description: 'Top nav + sidebar + cards/stats',
      files: {
        'src/App.tsx': WEB_DASHBOARD_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'marketing',
      label: 'Marketing Site',
      description: 'Hero + sections + footer',
      files: {
        'src/App.tsx': WEB_MARKETING_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'sections',
      label: 'Sections',
      description: 'Section-based content with anchor-link navigation',
      files: {
        'src/App.tsx': WEB_SECTIONS_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
    {
      name: 'auth-dash',
      label: 'Auth + Dashboard',
      description: 'Login screen that leads to a dashboard',
      files: {
        'src/App.tsx': WEB_AUTH_DASH_APP_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOBILE_TARGETS = new Set(['ios', 'android', 'mobile']);
const DESKTOP_TARGETS = new Set(['macos', 'windows', 'linux', 'desktop']);

export const targetCategory = (target: string): TargetCategory => {
  if (MOBILE_TARGETS.has(target)) return 'mobile';
  if (DESKTOP_TARGETS.has(target)) return 'desktop';
  return 'web';
};

const writeIfAbsent = (filePath: string, content: string | Buffer): void => {
  if (existsSync(filePath)) return;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const scaffoldBase = (projectDir: string): void => {
  const TEMPLATES_DIR = join(import.meta.dir, '../templates');

  writeIfAbsent(join(projectDir, 'config', 'theme.ts'), CONFIG_THEME_TS);
  writeIfAbsent(
    join(projectDir, 'config', 'permissions.ts'),
    CONFIG_PERMISSIONS_TS,
  );
  writeIfAbsent(join(projectDir, 'config', 'links.ts'), CONFIG_LINKS_TS);
  writeIfAbsent(join(projectDir, 'config', 'env.ts'), CONFIG_ENV_TS);
  writeIfAbsent(join(projectDir, 'legal', 'privacy.md'), PRIVACY_MD);
  writeIfAbsent(join(projectDir, 'legal', 'terms.md'), TERMS_MD);
  writeIfAbsent(join(projectDir, 'AGENTS.md'), AGENTS_MD);
  writeIfAbsent(join(projectDir, '.prettierrc'), PRETTIER_RC);
  writeIfAbsent(join(projectDir, 'eslint.config.js'), ESLINT_CONFIG_JS);

  const iconSrc = join(TEMPLATES_DIR, 'icons', 'icon.png');
  const darkIconSrc = join(TEMPLATES_DIR, 'icons', 'dark', 'icon.png');
  writeIfAbsent(join(projectDir, 'icons', 'icon.png'), readFileSync(iconSrc));
  writeIfAbsent(
    join(projectDir, 'icons', 'dark', 'icon.png'),
    readFileSync(darkIconSrc),
  );
};

export const scaffoldSkeleton = (
  projectDir: string,
  name: string,
  targetCat: TargetCategory,
): void => {
  // Check if the skeleton exists anywhere in the catalog
  const allCategories = Object.keys(SKELETON_CATALOG) as TargetCategory[];
  const existsInAnyCategory = allCategories.some((cat) =>
    SKELETON_CATALOG[cat].some((s) => s.name === name),
  );

  if (!existsInAnyCategory) {
    throw new Error(`Skeleton "${name}" not found in any target category.`);
  }

  const skeleton = SKELETON_CATALOG[targetCat].find((s) => s.name === name);

  if (!skeleton) {
    throw new Error(
      `"${name}" is not valid for the "${targetCat}" target. ` +
        `Use a skeleton from: ${SKELETON_CATALOG[targetCat].map((s) => s.name).join(', ')}.`,
    );
  }

  for (const [relPath, content] of Object.entries(skeleton.files)) {
    writeIfAbsent(join(projectDir, relPath), content);
  }
};
