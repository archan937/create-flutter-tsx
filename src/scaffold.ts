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
            <ElevatedButton onClick={() => setCount(count + 1)}>
              <Text>Tap me</Text>
            </ElevatedButton>
          </Column>
        </Center>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const MOBILE_TABS_APP_TSX = `import { MaterialApp, TabView } from 'flutter-tsx';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export const MainApp = () => (
  <MaterialApp title="My App">
    <TabView tabs={[
      { label: 'Home', icon: 'home', screen: <HomeScreen /> },
      { label: 'Discover', icon: 'explore', screen: <DiscoverScreen /> },
      { label: 'Settings', icon: 'settings', screen: <SettingsScreen /> },
    ]} />
  </MaterialApp>
);
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

// Hamburger-drawer app: the AppBar shows the hamburger automatically because the
// Scaffold has a drawer. Tapping a drawer item switches the body content.
const MOBILE_DRAWER_APP_TSX = `import { useState } from 'flutter-tsx';
import { AppBar, Center, Drawer, DrawerHeader, ListTile, ListView, MaterialApp, Scaffold, Text } from 'flutter-tsx';

const PAGES = ['Home', 'Profile', 'Settings'];

export const MainApp = () => {
  const [page, setPage] = useState(0);
  return (
    <MaterialApp title="Drawer App">
      <Scaffold appBar={<AppBar title={<Text>Drawer App</Text>} />}>
        <Drawer>
          <ListView>
            <DrawerHeader><Text>Menu</Text></DrawerHeader>
            <ListTile title="Home" onTap={() => setPage(0)} />
            <ListTile title="Profile" onTap={() => setPage(1)} />
            <ListTile title="Settings" onTap={() => setPage(2)} />
          </ListView>
        </Drawer>
        <Center><Text>{PAGES[page]}</Text></Center>
      </Scaffold>
    </MaterialApp>
  );
};
`;

// File-based routing: the MaterialApp shell points at src/routes/; the list
// (index) navigates to a detail route that reads the id via useParams.
const MOBILE_LIST_DETAIL_APP_TSX = `import { MaterialApp } from 'flutter-tsx';

export const MainApp = () => <MaterialApp title="My App" routes="./routes" />;
`;

const MOBILE_LIST_DETAIL_INDEX_TSX = `import { AppBar, ListTile, ListView, Scaffold, useNavigate } from 'flutter-tsx';

const ITEMS = ['apple', 'banana', 'cherry'];

export const ItemList = () => {
  const nav = useNavigate();
  return (
    <Scaffold>
      <AppBar title="Items" />
      <ListView>
        {ITEMS.map((item) => (
          <ListTile key={item} title={item} onTap={() => nav.push(\`/items/\${item}\`)} />
        ))}
      </ListView>
    </Scaffold>
  );
};
`;

const MOBILE_LIST_DETAIL_DETAIL_TSX = `import { AppBar, Center, Scaffold, Text, useParams } from 'flutter-tsx';

export const ItemDetail = () => {
  const id = useParams('id');
  return (
    <Scaffold>
      <AppBar title="Detail" />
      <Center>
        <Text>Selected: {id}</Text>
      </Center>
    </Scaffold>
  );
};
`;

// Live feed: useAsync + fetch loads a JSON list, rendered as cards. data.json is
// the decoded body (dynamic), so post['title'] reads each item's field.
const MOBILE_FEED_APP_TSX = `import { AppBar, Card, Center, CircularProgressIndicator, ListView, MaterialApp, Scaffold, Text, useAsync, fetch } from 'flutter-tsx';

export const FeedScreen = () => {
  const { data, loading, error } = useAsync(() => fetch('https://jsonplaceholder.typicode.com/posts'));
  if (loading) return <Center><CircularProgressIndicator /></Center>;
  if (error) return <Center><Text>Failed to load feed</Text></Center>;
  return (
    <ListView>
      {data.json.map((post) => (
        <Card key={post}>
          <Text>{post['title']}</Text>
        </Card>
      ))}
    </ListView>
  );
};

export const MainApp = () => (
  <MaterialApp title="Feed">
    <Scaffold appBar={<AppBar title={<Text>Feed</Text>} />}>
      <FeedScreen />
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
            <ElevatedButton onClick={() => setStep(step + 1)}>
              <Text>Next</Text>
            </ElevatedButton>
          )}
        </Column>
      </Scaffold>
    </MaterialApp>
  );
};
`;

// Auth gate backed by a session store: while logged out, show the login screen;
// once useAuth().login() flips the store, the app rebuilds into a TabView shell.
const MOBILE_AUTH_STORE_TSX = `import { createStore } from 'flutter-tsx';

export const useAuth = createStore((set) => ({
  loggedIn: false,
  login: () => set(() => ({ loggedIn: true })),
  logout: () => set(() => ({ loggedIn: false })),
}));
`;

const MOBILE_AUTH_TABS_APP_TSX = `import { Center, Column, ElevatedButton, MaterialApp, Scaffold, TabView, Text, TextField } from 'flutter-tsx';
import { useAuth } from './stores/auth';

export const MainApp = () => {
  const { loggedIn, login } = useAuth();
  if (!loggedIn) {
    return (
      <MaterialApp title="Sign in">
        <Scaffold>
          <Center>
            <Column>
              <TextField label="Email" />
              <TextField label="Password" />
              <ElevatedButton onClick={login}><Text>Log In</Text></ElevatedButton>
            </Column>
          </Center>
        </Scaffold>
      </MaterialApp>
    );
  }
  return (
    <MaterialApp title="My App">
      <TabView tabs={[
        { label: 'Home', icon: 'home', screen: <Center><Text>Home</Text></Center> },
        { label: 'Profile', icon: 'person', screen: <Center><Text>Profile</Text></Center> },
      ]} />
    </MaterialApp>
  );
};
`;

// --- Mobile flagship: a real-app starter ------------------------------------
// Exercises the full stack: a createStore session store, useAsync + fetch for
// remote data, a TabView shell, and a modal sheet — the setup a real product
// would start from.

const STARTER_SESSION_STORE_TSX = `import { createStore } from 'flutter-tsx';

// Global session store → generates an idiomatic ChangeNotifier, provided at the
// app root and read in screens via useSession().
export const useSession = createStore((set) => ({
  name: 'Guest',
  loggedIn: false,
  login: () => set(() => ({ name: 'Ada Lovelace', loggedIn: true })),
  logout: () => set(() => ({ name: 'Guest', loggedIn: false })),
}));
`;

const STARTER_FEED_SCREEN_TSX = `import { Center, CircularProgressIndicator, Text, useAsync, fetch } from 'flutter-tsx';

// Remote data via useAsync + fetch → compiles to a FutureBuilder.
export const FeedScreen = () => {
  const { data, loading, error } = useAsync(() => fetch('https://jsonplaceholder.typicode.com/todos/1'));
  if (loading) return <Center><CircularProgressIndicator /></Center>;
  if (error) return <Center><Text>Something went wrong</Text></Center>;
  return <Center><Text>{data.body}</Text></Center>;
};
`;

const STARTER_PROFILE_SCREEN_TSX = `import { Center, Column, ElevatedButton, Text, showSheet } from 'flutter-tsx';
import { useSession } from '../stores/session';

export const ProfileScreen = () => {
  const { name, login, logout } = useSession();
  return (
    <Center>
      <Column>
        <Text>{name}</Text>
        <ElevatedButton onClick={login}><Text>Log in</Text></ElevatedButton>
        <ElevatedButton onClick={logout}><Text>Log out</Text></ElevatedButton>
        <ElevatedButton onClick={() => showSheet(<Text>flutter-tsx starter</Text>)}>
          <Text>About</Text>
        </ElevatedButton>
      </Column>
    </Center>
  );
};
`;

const STARTER_APP_TSX = `import { MaterialApp, TabView } from 'flutter-tsx';
import { FeedScreen } from './screens/FeedScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export const MainApp = () => (
  <MaterialApp title="Starter">
    <TabView tabs={[
      { label: 'Feed', icon: 'dynamic_feed', screen: <FeedScreen /> },
      { label: 'Profile', icon: 'person', screen: <ProfileScreen /> },
    ]} />
  </MaterialApp>
);
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

// Menubar / system-tray app. config/tray.ts turns on tray mode: fsx emits a
// main.dart bootstrap (window_manager + tray_manager) with a Show/Hide/Quit
// menu. The TSX below is just the window UI — here a store-backed dashboard.
const DESKTOP_TRAY_APP_TSX = `import { AppBar, Center, Column, ElevatedButton, MaterialApp, Scaffold, Text } from 'flutter-tsx';
import { useStats } from './stores/stats';

export const MainApp = () => {
  const { count, bump } = useStats();
  return (
    <MaterialApp title="Tray App">
      <Scaffold appBar={<AppBar title={<Text>Tray App</Text>} />}>
        <Center>
          <Column>
            <Text>Running in the menu bar — close the window, reopen from the tray.</Text>
            <Text>Clicks: {count}</Text>
            <ElevatedButton onClick={bump}><Text>Bump</Text></ElevatedButton>
          </Column>
        </Center>
      </Scaffold>
    </MaterialApp>
  );
};
`;

const DESKTOP_TRAY_STATS_STORE_TSX = `import { createStore } from 'flutter-tsx';

export const useStats = createStore((set) => ({
  count: 0,
  bump: () => set((s) => ({ count: s.count + 1 })),
}));
`;

const DESKTOP_TRAY_CONFIG_TS = `import type { TrayConfig } from 'flutter-tsx/config';

// Presence of this file enables system-tray / menubar mode.
export default {
  tooltip: 'Tray App',
  menu: [
    { label: 'Show', action: 'show' },
    { label: 'Hide', action: 'hide' },
    { label: 'Quit', action: 'quit' },
  ],
} satisfies TrayConfig;
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
            <ElevatedButton onClick={() => setTab(0)}>
              <Text>Document 1</Text>
            </ElevatedButton>
            <ElevatedButton onClick={() => setTab(1)}>
              <Text>Document 2</Text>
            </ElevatedButton>
            <ElevatedButton onClick={() => setTab(2)}>
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

// Dashboard that loads live data: a sidebar + a content pane whose stat comes
// from useAsync + fetch (data.json is the decoded body).
const WEB_DASHBOARD_APP_TSX = `import { AppBar, Center, CircularProgressIndicator, Column, Container, MaterialApp, Row, Scaffold, Text, useAsync, fetch } from 'flutter-tsx';

export const Dashboard = () => {
  const { data, loading, error } = useAsync(() => fetch('https://jsonplaceholder.typicode.com/users'));
  if (loading) return <Center><CircularProgressIndicator /></Center>;
  if (error) return <Center><Text>Failed to load</Text></Center>;
  return (
    <Row>
      <Container width={200}>
        <Column>
          <Text>Overview</Text>
          <Text>Reports</Text>
        </Column>
      </Container>
      <Column>
        <Text>Active users: {data.json.length}</Text>
      </Column>
    </Row>
  );
};

export const MainApp = () => (
  <MaterialApp title="Dashboard">
    <Scaffold appBar={<AppBar title={<Text>Dashboard</Text>} />}>
      <Dashboard />
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
          <Column>
            <Text>Hero — Your tagline here</Text>
            <Text>Start for free today</Text>
          </Column>
        </Container>
        <Container>
          <Column>
            <Text>Features</Text>
            <Row>
              <Text>Fast</Text>
              <Text>Reliable</Text>
              <Text>Beautiful</Text>
            </Row>
          </Column>
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
            <Column>
              <Text>{section}</Text>
              <Text>Content for {section}</Text>
            </Column>
          </Container>
        ))}
      </Column>
    </Scaffold>
  </MaterialApp>
);
`;

// Auth gate backed by a session store: logged out → sign-in form; once
// useAuth().login() flips the store, the same view shows the dashboard.
const WEB_AUTH_STORE_TSX = `import { createStore } from 'flutter-tsx';

export const useAuth = createStore((set) => ({
  loggedIn: false,
  login: () => set(() => ({ loggedIn: true })),
  logout: () => set(() => ({ loggedIn: false })),
}));
`;

const WEB_AUTH_DASH_APP_TSX = `import { Center, Column, Container, ElevatedButton, MaterialApp, Row, Scaffold, Text, TextField } from 'flutter-tsx';
import { useAuth } from './stores/auth';

export const MainApp = () => {
  const { loggedIn, login } = useAuth();
  return (
    <MaterialApp title="My App">
      <Scaffold>
        {loggedIn ? (
          <Row>
            <Container width={200}>
              <Column>
                <Text>Overview</Text>
                <Text>Reports</Text>
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
              <ElevatedButton onClick={login}><Text>Log In</Text></ElevatedButton>
            </Column>
          </Center>
        )}
      </Scaffold>
    </MaterialApp>
  );
};
`;

// --- Web flagship: a real multi-route app -----------------------------------
// File-based routing (real URLs), a session store, and remote data — the setup
// a real web product would start from. Capabilities are spread across routes,
// the way a multi-page app actually grows.

const WEB_STARTER_APP_TSX = `import { MaterialApp } from 'flutter-tsx';

// routes="./routes" → file-based routing → GoRouter (real browser URLs).
export const MainApp = () => <MaterialApp title="Dashboard" routes="./routes" />;
`;

const WEB_STARTER_SESSION_STORE_TSX = `import { createStore } from 'flutter-tsx';

export const useSession = createStore((set) => ({
  user: 'Guest',
  login: () => set(() => ({ user: 'Ada Lovelace' })),
}));
`;

const WEB_STARTER_INDEX_TSX = `import { AppBar, Center, Column, ElevatedButton, Scaffold, Text, useNavigate } from 'flutter-tsx';
import { useSession } from '../stores/session';

export const Dashboard = () => {
  const nav = useNavigate();
  const { user } = useSession();
  return (
    <Scaffold>
      <AppBar title="Dashboard" />
      <Center>
        <Column>
          <Text>Signed in as {user}</Text>
          <ElevatedButton onClick={() => nav.push('/feed')}><Text>Feed</Text></ElevatedButton>
          <ElevatedButton onClick={() => nav.push('/profile')}><Text>Profile</Text></ElevatedButton>
        </Column>
      </Center>
    </Scaffold>
  );
};
`;

const WEB_STARTER_FEED_TSX = `import { Center, CircularProgressIndicator, Text, useAsync, fetch } from 'flutter-tsx';

export const Feed = () => {
  const { data, loading, error } = useAsync(() => fetch('https://jsonplaceholder.typicode.com/posts/1'));
  if (loading) return <Center><CircularProgressIndicator /></Center>;
  if (error) return <Center><Text>Something went wrong</Text></Center>;
  return <Center><Text>{data.body}</Text></Center>;
};
`;

const WEB_STARTER_PROFILE_TSX = `import { Center, Column, ElevatedButton, Text, showSheet } from 'flutter-tsx';
import { useSession } from '../stores/session';

export const Profile = () => {
  const { user, login } = useSession();
  return (
    <Center>
      <Column>
        <Text>{user}</Text>
        <ElevatedButton onClick={login}><Text>Sign in</Text></ElevatedButton>
        <ElevatedButton onClick={() => showSheet(<Text>flutter-tsx web starter</Text>)}>
          <Text>About</Text>
        </ElevatedButton>
      </Column>
    </Center>
  );
};
`;

// ---------------------------------------------------------------------------
// SKELETON_CATALOG
// ---------------------------------------------------------------------------

export const SKELETON_CATALOG: Record<TargetCategory, SkeletonDef[]> = {
  mobile: [
    {
      name: 'starter',
      label: 'Starter (recommended)',
      description:
        'Real-app setup: tabbed shell, a session store, remote data (useAsync + fetch), and a modal sheet',
      files: {
        'src/App.tsx': STARTER_APP_TSX,
        'src/stores/session.tsx': STARTER_SESSION_STORE_TSX,
        'src/screens/FeedScreen.tsx': STARTER_FEED_SCREEN_TSX,
        'src/screens/ProfileScreen.tsx': STARTER_PROFILE_SCREEN_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
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
      description:
        'Master list that navigates to a detail screen (file-based routing)',
      files: {
        'src/App.tsx': MOBILE_LIST_DETAIL_APP_TSX,
        'src/routes/index.tsx': MOBILE_LIST_DETAIL_INDEX_TSX,
        'src/routes/items/[id].tsx': MOBILE_LIST_DETAIL_DETAIL_TSX,
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
      description: 'Login screen (session store) that leads to a TabView shell',
      files: {
        'src/App.tsx': MOBILE_AUTH_TABS_APP_TSX,
        'src/stores/auth.tsx': MOBILE_AUTH_STORE_TSX,
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
      description:
        'Menubar / system-tray app: window_manager + tray_manager bootstrap, Show/Hide/Quit menu, store-backed window',
      files: {
        'src/App.tsx': DESKTOP_TRAY_APP_TSX,
        'src/stores/stats.tsx': DESKTOP_TRAY_STATS_STORE_TSX,
        'config/tray.ts': DESKTOP_TRAY_CONFIG_TS,
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
      name: 'starter',
      label: 'Starter (recommended)',
      description:
        'Real multi-route app: file-based routing (real URLs), a session store, remote data (useAsync + fetch), and a modal',
      files: {
        'src/App.tsx': WEB_STARTER_APP_TSX,
        'src/stores/session.tsx': WEB_STARTER_SESSION_STORE_TSX,
        'src/routes/index.tsx': WEB_STARTER_INDEX_TSX,
        'src/routes/feed.tsx': WEB_STARTER_FEED_TSX,
        'src/routes/profile.tsx': WEB_STARTER_PROFILE_TSX,
        'locales/en.json': LOCALE_EN_BASIC,
      },
    },
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
      description: 'Login screen (session store) that leads to a dashboard',
      files: {
        'src/App.tsx': WEB_AUTH_DASH_APP_TSX,
        'src/stores/auth.tsx': WEB_AUTH_STORE_TSX,
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

  // The tray skeleton ships a dedicated monochrome menubar glyph at
  // `icons/tray.png` (project.ts prefers it over the colourful `icons/icon.png`).
  if (name === 'tray') {
    const TEMPLATES_DIR = join(import.meta.dir, '../templates');
    writeIfAbsent(
      join(projectDir, 'icons', 'tray.png'),
      readFileSync(join(TEMPLATES_DIR, 'icons', 'tray.png')),
    );
    // Black variant (for light surfaces / non-template platforms); macOS itself
    // tints the menubar icon automatically via the template-image flag.
    writeIfAbsent(
      join(projectDir, 'icons', 'dark', 'tray.png'),
      readFileSync(join(TEMPLATES_DIR, 'icons', 'dark', 'tray.png')),
    );
  }
};
