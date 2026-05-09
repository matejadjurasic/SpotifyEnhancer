# Clean Code Guidelines

> These guidelines apply to this React Native / Expo project written in TypeScript.
> They combine universal clean code principles with React Native–specific best practices.
> Every contributor and AI assistant working in this codebase must follow them.

---

## Table of Contents

1. [Naming](#1-naming)
2. [Functions and Methods](#2-functions-and-methods)
3. [Components](#3-components)
4. [Hooks](#4-hooks)
5. [State Management](#5-state-management)
6. [TypeScript](#6-typescript)
7. [File and Folder Structure](#7-file-and-folder-structure)
8. [Styling](#8-styling)
9. [Performance](#9-performance)
10. [Error Handling](#10-error-handling)
11. [Comments and Documentation](#11-comments-and-documentation)
12. [SOLID Principles](#12-solid-principles)
13. [General Principles (DRY, KISS, YAGNI)](#13-general-principles)
14. [Security](#14-security)
15. [Accessibility](#15-accessibility)
16. [Navigation (Expo Router)](#16-navigation-expo-router)

---

## 1. Naming

### Reveal intent through names

A name must answer: _why it exists_, _what it does_, and _how it is used_. If a name requires a comment to explain it, rename it.

```ts
// Bad
const d = new Date();
const x = user.t;

// Good
const createdAt = new Date();
const accessToken = user.token;
```

### Variables and constants

- Use `camelCase` for variables and function names.
- Use `SCREAMING_SNAKE_CASE` for true module-level constants that never change.
- Use `PascalCase` for types, interfaces, enums, and React components.
- Booleans must read as a predicate: `isLoading`, `hasError`, `canSubmit`, `isAuthenticated`.
- Avoid generic names: `data`, `info`, `temp`, `value`, `item` — be specific about what the data represents.

```ts
// Bad
const flag = true;
const list = [];

// Good
const isAuthenticated = true;
const recentTracks = [];
```

### Functions and methods

- Use verb-first names that describe the action: `fetchUser`, `handlePress`, `parseToken`, `scheduleRefresh`.
- Event handlers must be prefixed with `handle`: `handlePress`, `handleAuthSuccess`, `handleRecordingStop`.
- Props that accept callbacks must be prefixed with `on`: `onPress`, `onAuthSuccess`, `onError`.

```tsx
// Bad
const click = () => {};
<Button action={click} />;

// Good
const handleLoginPress = () => {};
<Button onPress={handleLoginPress} />;
```

### Components

- Always `PascalCase`.
- Name components after what they render, not how they behave internally: `RecordButton`, `LoginCard`, `RecordingTimer`.
- Custom hooks must be prefixed with `use`: `useAuth`, `useRecording`, `useTimer`.

---

## 2. Functions and Methods

### Single Responsibility

Every function must do one thing and do it well. If you need the word "and" to describe what a function does, split it.

```ts
// Bad — fetches AND processes AND stores
const syncUserData = async () => {
  const res = await fetch("/user");
  const data = res.json();
  const processed = data.items.map(normalise);
  await AsyncStorage.setItem("user", JSON.stringify(processed));
};

// Good — each step is its own function
const fetchUserData = async () => {
  /* ... */
};
const normaliseUserItems = (items: RawItem[]) => {
  /* ... */
};
const persistUserData = async (data: UserData) => {
  /* ... */
};
```

### Keep functions small

Aim for functions that fit in one screen (~20–30 lines). If a function is growing, look for a coherent sub-task to extract.

### Avoid deep nesting

Prefer early returns (guard clauses) over nested `if/else` trees.

```ts
// Bad
const processToken = (token: string | null) => {
  if (token) {
    if (token.length > 0) {
      // main logic
    }
  }
};

// Good
const processToken = (token: string | null) => {
  if (!token || token.length === 0) return;
  // main logic
};
```

### Limit parameters

Functions with more than three parameters are a signal to introduce an options object.

```ts
// Bad
const createTrack = (
  title: string,
  artist: string,
  duration: number,
  albumArt: string,
) => {};

// Good
interface TrackInput {
  title: string;
  artist: string;
  duration: number;
  albumArt: string;
}
const createTrack = (input: TrackInput) => {};
```

### Prefer pure functions

A function that only transforms its inputs and returns a value (no side effects) is the easiest to test, read, and reuse. Push side effects (network calls, storage writes, state mutation) to the edges — services, hooks, or event handlers.

---

## 3. Components

### One component per file

Each file exports one primary component. Tiny sub-components used only inside that file may live in the same file but should be defined above the primary component.

### Keep components focused

A component is responsible for _rendering UI_ based on its props and local state. Business logic must live in custom hooks or services.

```tsx
// Bad — component fetches its own data and contains business logic
const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  useEffect(() => {
    fetch("/tracks")
      .then((r) => r.json())
      .then(setTracks);
  }, []);
  // render
};

// Good — component only renders
const TrackList = ({ tracks }: { tracks: Track[] }) => {
  // render only
};

// Data is managed in a hook used by the screen
const TrackScreen = () => {
  const { tracks } = useTracks();
  return <TrackList tracks={tracks} />;
};
```

### Prop destructuring

Always destructure props in the function signature for readability.

```tsx
// Bad
const RecordButton = (props: Props) => <Button onPress={props.onPress} />;

// Good
const RecordButton = ({ onPress, isRecording }: Props) => (
  <Button onPress={onPress} active={isRecording} />
);
```

### Explicit prop types

Define a `Props` interface/type for every component. Never use `any` for props.

```tsx
interface RecordButtonProps {
  onPress: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

const RecordButton = ({
  onPress,
  isRecording,
  disabled = false,
}: RecordButtonProps) => {};
```

### Avoid anonymous default exports

Named exports make refactoring, auto-imports, and error messages clearer.

```tsx
// Bad
export default () => <View />;

// Good
export const LoginCard = () => <View />;
// or, when the router requires a default export:
const LoginScreen = () => <View />;
export default LoginScreen;
```

### Composition over configuration

Build complex UIs from small, composable parts rather than creating one large component with many conditional branches driven by a growing `variant` or `type` prop.

```tsx
// Bad — one god component
<Card type="auth" showAvatar hasFooter title="Login" />

// Good — composed
<Card>
  <Card.Avatar />
  <Card.Title>Login</Card.Title>
  <Card.Footer />
</Card>
```

---

## 4. Hooks

### Extract all non-trivial logic into custom hooks

Screens and components must contain only rendering logic. Every side effect, async operation, derived state, or subscription belongs in a custom hook.

```ts
// Good — logic is isolated and reusable
export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  // ... all audio logic
  return { isRecording, startRecording, stopRecording };
};
```

### Rules of Hooks — always apply

- Only call hooks at the top level of a function component or another hook.
- Never call hooks inside conditionals, loops, or nested functions.

### Declare dependencies honestly

Every value used inside `useEffect`, `useCallback`, or `useMemo` that can change over time must be listed in the dependency array. Do not suppress the exhaustive-deps lint rule without a documented reason.

```ts
// Bad
useEffect(() => {
  loadToken(userId); // userId not in deps
}, []);

// Good
useEffect(() => {
  loadToken(userId);
}, [userId]);
```

### Clean up side effects

Every `useEffect` that creates a subscription, timer, or listener must return a cleanup function.

```ts
useEffect(() => {
  const subscription = eventEmitter.addListener("event", handler);
  return () => subscription.remove();
}, []);
```

### Keep each hook focused

A hook must manage one cohesive concern. `useAuth` manages authentication state. `useTimer` manages timer logic. Do not merge unrelated concerns into one hook.

---

## 5. State Management

### Colocate state as low as possible

State belongs in the lowest component in the tree that needs it. Only lift state when two or more siblings need the same value.

### Use Context only for genuinely global state

Context is appropriate for authentication state (`AuthContext`), theme, or user locale — data needed by many unrelated parts of the tree. Do not use Context to avoid prop-drilling for data that is only needed two or three levels deep.

### Prefer derived values over redundant state

Do not store in state something that can be computed from existing state or props on every render.

```ts
// Bad
const [fullName, setFullName] = useState("");
// updated manually whenever firstName or lastName changes

// Good
const fullName = `${firstName} ${lastName}`;
```

### Avoid storing server data in component state

Use a dedicated hook (or a library like React Query / SWR) to own the fetch, cache, and sync lifecycle. Raw `useState` + `useEffect` for remote data leads to race conditions and stale data.

---

## 6. TypeScript

### Strict mode is mandatory

This project uses `"strict": true`. Never disable it or use `@ts-ignore` without a precise comment explaining why.

### Prefer `interface` for object shapes, `type` for unions and aliases

```ts
interface Track {
  id: string;
  title: string;
  durationMs: number;
}

type AuthStatus = "authenticated" | "unauthenticated" | "loading";
```

### Never use `any`

`any` defeats TypeScript entirely. Use `unknown` when the type is genuinely uncertain and narrow it before use.

```ts
// Bad
const parse = (data: any) => data.token;

// Good
const parse = (data: unknown): string => {
  if (typeof data === "object" && data !== null && "token" in data) {
    return String((data as { token: unknown }).token);
  }
  throw new Error("Invalid data shape");
};
```

### Use non-null assertions sparingly

Avoid `value!` unless you can prove the value is never null/undefined at that point. Prefer a guard clause instead.

### Export types alongside their modules

Keep related types next to the code that uses them. Place shared cross-module types in `types/index.ts`.

### Use path aliases

This project has `@/*` mapped to the root. Always use the alias instead of relative paths that traverse more than one directory.

```ts
// Bad
import { Track } from "../../../types/index";

// Good
import type { Track } from "@/types";
```

---

## 7. File and Folder Structure

### Current structure conventions

```
app/              # Expo Router screens (file-based routing)
components/       # Reusable UI components, grouped by domain
  auth/
  recording/
  ui/             # Primitive / design-system components
config/           # App-wide configuration constants
constants/        # Theme tokens, non-config constants
context/          # React Context providers
hooks/            # Custom hooks
services/         # External API calls, native module wrappers
styles/           # Shared StyleSheet objects and color tokens
types/            # Shared TypeScript types
utils/            # Pure helper functions with no side effects
```

### Rules

- Group by **feature/domain**, not by file type, inside `components/` and `hooks/`.
- A file that exports one thing must be named after that thing: `RecordButton.tsx`, `useRecording.ts`.
- Screen files live in `app/` under Expo Router conventions and are named by route segment.
- Index files (`index.ts`) are acceptable for barrel exports at a domain boundary, but avoid deep barrel chains that obscure the source of a symbol.
- Keep `utils/` for **pure** functions only. Any function with a side effect belongs in `services/` or a hook.

---

## 8. Styling

### Always use `StyleSheet.create`

`StyleSheet.create` validates style properties at development time and moves style object creation outside the render cycle, preventing unnecessary allocations.

```tsx
// Bad
const MyComponent = () => <View style={{ flex: 1, backgroundColor: "#000" }} />;

// Good
const MyComponent = () => <View style={styles.container} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
```

### Reference design tokens

Never hardcode colors, spacing, or typography values. Reference constants from `constants/theme.ts` and `styles/colors.ts`.

```ts
// Bad
color: "#1DB954";

// Good
color: colors.spotifyGreen;
```

### Keep styles at the bottom of the file

Define `const styles = StyleSheet.create({...})` after the component export, at the bottom of the file.

### Do not compute styles inside the render function

Conditional styles must be expressed as an array of `StyleSheet` objects, not as computed inline objects.

```tsx
// Bad
<View style={{ opacity: isActive ? 1 : 0.5, ...styles.card }} />

// Good
<View style={[styles.card, !isActive && styles.cardDisabled]} />
```

---

## 9. Performance

### Use `FlatList` / `SectionList` for long lists, never `ScrollView`

`ScrollView` renders all children at once. `FlatList` virtualises the list and only renders visible items.

```tsx
// Bad — crashes or freezes for large datasets
<ScrollView>
  {tracks.map(track => <TrackItem key={track.id} track={track} />)}
</ScrollView>

// Good
<FlatList
  data={tracks}
  keyExtractor={track => track.id}
  renderItem={({ item }) => <TrackItem track={item} />}
/>
```

### Memoisation — use it deliberately, not by default

- `React.memo`: Wrap a component only when its parent re-renders frequently and the component's output is the same given the same props.
- `useCallback`: Wrap a callback only when it is passed as a prop to a memoised child component or used as a `useEffect` dependency.
- `useMemo`: Wrap an expensive computation only when profiling confirms the cost; do not wrap trivial expressions.

Over-memoisation adds cognitive overhead and can mask bugs. Profile first.

### Avoid creating objects and arrays inside JSX

New references on every render prevent `React.memo` from working and cause unnecessary child re-renders.

```tsx
// Bad — new array created every render
<FlatList contentContainerStyle={{ padding: 16 }} />

// Good
<FlatList contentContainerStyle={styles.listContent} />
```

### Move heavy work off the JS thread

Use `react-native-reanimated` worklets for animations that must run at 60/120 fps. Never block the JS thread with synchronous heavy computation in a render path.

### Lazily load screens and heavy components

Expo Router handles code splitting automatically for screens. For heavy in-screen components, use dynamic `import()` with `React.lazy` and `Suspense` when appropriate.

---

## 10. Error Handling

### Never swallow errors silently

Every `catch` block must either handle the error, log it with enough context, or re-throw it. An empty `catch` block is forbidden.

```ts
// Bad
try {
  await uploadAudio(uri);
} catch (_) {}

// Good
try {
  await uploadAudio(uri);
} catch (error) {
  console.error("[uploadAudio] Failed to upload audio:", error);
  throw error; // or show user-facing feedback
}
```

### Distinguish user-facing errors from internal errors

- Internal errors (unexpected exceptions): log them and show a generic "Something went wrong" message.
- Validation errors (expected failures): return them as data (e.g., `{ success: false, error: 'Invalid token' }`) rather than throwing.

### Use Error Boundaries for component trees

Wrap major sections of the UI in an Error Boundary to prevent one component's crash from taking down the whole app.

### Prefer Result types for expected failure modes

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const parseToken = (raw: string): Result<AuthToken> => {
  if (!raw) return { ok: false, error: "Token is empty" };
  return { ok: true, value: decodeToken(raw) };
};
```

---

## 11. Comments and Documentation

### Good code mostly comments itself

If you feel the urge to write a comment explaining _what_ code does, consider renaming or restructuring the code instead. Reserve comments for _why_ — decisions that cannot be expressed in code alone.

```ts
// Bad — comment restates the code
// Set token to null
setToken(null);

// Good — comment explains intent that isn't obvious
// Revoke the token client-side immediately; the server invalidates it asynchronously.
setToken(null);
```

### When comments are appropriate

- Explaining a non-obvious algorithm or a workaround for a platform quirk.
- Citing the source of a formula or external requirement.
- `TODO:` / `FIXME:` markers with a brief reason (not a substitute for a ticket).
- JSDoc on exported service functions and shared utility functions.

### Commented-out code is forbidden

Delete dead code. Version control preserves history. Commented-out code confuses readers and rots silently.

---

## 12. SOLID Principles

### S — Single Responsibility

A module, component, hook, or class must have exactly one reason to change. If `AuthService` started handling audio upload logic, it would have two reasons to change — split it.

### O — Open/Closed

Design components and services to be extended without modifying their internals. Accept configuration through props or parameters rather than forking logic with new `if` branches.

```tsx
// Bad — every new variant requires editing the component
if (variant === 'primary') { ... }
else if (variant === 'secondary') { ... }
else if (variant === 'ghost') { ... }

// Good — style map; adding a variant requires only extending the map
const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};
```

### L — Liskov Substitution

A component or function that extends or wraps another must be usable in every place the original is used. Wrapper components must not silently drop props or change behaviour in unexpected ways.

### I — Interface Segregation

Do not force a component to depend on props it does not use. Split large prop interfaces into smaller, focused ones.

```ts
// Bad — RecordButton receives everything
interface RecordButtonProps {
  onPress: () => void;
  onLongPress: () => void;
  onUpload: () => void; // RecordButton doesn't upload
  uploadProgress: number;
}

// Good — interface only contains what RecordButton needs
interface RecordButtonProps {
  onPress: () => void;
  isRecording: boolean;
}
```

### D — Dependency Inversion

High-level components and hooks must depend on abstractions (function parameters, context values, service interfaces), not on concrete implementations. Pass dependencies in rather than importing singletons directly inside logic functions.

---

## 13. General Principles

### DRY — Don't Repeat Yourself

Every piece of knowledge must have a single, authoritative representation. If you copy-paste logic, extract it into a shared utility or hook.

- Duplicated UI → shared component.
- Duplicated logic → shared hook or utility.
- Duplicated constants → shared config or constants file.

DRY applies to _knowledge_, not to every line of code. Two similar-looking lines that represent different concepts should stay separate.

### KISS — Keep It Simple

The simplest solution that correctly satisfies the requirement is the right one. Complexity must be justified by a real constraint, not anticipated future requirements.

- Prefer a `useState` + `useEffect` over a complex state machine when the state transitions are simple.
- Prefer a flat conditional over a pattern when there are only two cases.
- Prefer established library APIs over clever workarounds.

### YAGNI — You Aren't Gonna Need It

Do not build features, abstractions, or generalisations that are not needed right now. Every line of speculative code carries a maintenance burden. Implement what the current requirement demands and no more.

### Separation of Concerns

| Layer                     | Responsibility                                            |
| ------------------------- | --------------------------------------------------------- |
| Screen (`app/`)           | Navigation entry point; assembles hooks and components    |
| Component (`components/`) | Renders UI from props; contains no async logic            |
| Hook (`hooks/`)           | Manages state and side effects for one concern            |
| Service (`services/`)     | Communicates with external systems (APIs, native modules) |
| Utility (`utils/`)        | Pure data transformations; no side effects                |
| Context (`context/`)      | Distributes global state to the component tree            |

Crossing these layers is a code smell. A component importing from `services/` directly should instead delegate to a hook. A utility function that calls `setState` does not belong in `utils/`.

---

## 14. Security

### Never hardcode secrets

API keys, client secrets, and tokens must never appear in source code. Store them in `.env` files (which are `.gitignore`d) and access them only through `expo-constants` or `process.env`.

```ts
// Bad
const CLIENT_SECRET = "abc123xyz";

// Good — accessed from environment
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;
```

### Use SecureStore for sensitive runtime data

Tokens, session keys, and personally identifiable information must be stored with `expo-secure-store`, never with `AsyncStorage`.

```ts
// Bad
await AsyncStorage.setItem("access_token", token);

// Good
await SecureStore.setItemAsync("access_token", token);
```

### Validate all external data

Data arriving from APIs, user input, or deep-link parameters must be validated before use. Do not trust the shape of any external payload.

### Token handling

- Access tokens must be stored in SecureStore, not in memory-only state that survives only the current session.
- Implement token rotation: schedule refresh before expiry (as this project already does in `useAuth`).
- Clear all tokens on logout, including SecureStore entries.

### Avoid `dangerouslySetInnerHTML` / eval equivalents

In React Native, avoid passing user-supplied strings to APIs that execute code (`eval`, dynamic `require`, `new Function`).

---

## 15. Accessibility

### Provide accessible labels for interactive elements

Every `TouchableOpacity`, `Pressable`, or custom interactive component must have `accessibilityLabel` and `accessibilityRole`.

```tsx
<Pressable
  accessibilityLabel="Start recording"
  accessibilityRole="button"
  onPress={handlePress}
>
  <RecordIcon />
</Pressable>
```

### Do not rely on colour alone to convey meaning

Error states, active states, and status indicators must be accompanied by text or an icon in addition to a colour change.

### Support dynamic type sizes

Use relative units and avoid capping `fontSize` to a hardcoded maximum. Respect the user's system font-size preference.

### Sufficient touch target size

Interactive elements must have a minimum touch area of 44×44 points. Use `minWidth`, `minHeight`, or `hitSlop` if the visual element is smaller.

---

## 16. Navigation (Expo Router)

### Keep route files thin

Files in `app/` are entry points. They should import a screen component from `components/` or assemble hooks and components inline. Business logic must not live in route files.

### Use typed routes

Enable typed routes (`expo-router` v3+) so that navigation calls are type-checked and navigating to a non-existent route is a compile error.

### Handle deep links defensively

Validate every parameter extracted from a route (`useLocalSearchParams`) before using it. Do not assume a parameter is present or has the expected format.

```ts
const { code } = useLocalSearchParams<{ code?: string }>();
if (!code) {
  // handle missing param
  return;
}
```

### Prefer `router.replace` over `router.push` for auth flows

After a successful login, replace the auth screen rather than pushing on top of it, so the user cannot navigate back to the login screen with the hardware back button.

---

_Last updated: 2026-05-09_
