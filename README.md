# Tasky 📝

A minimal, beautifully designed todo app built with **Expo** and **React Native**. Tasky helps you stay on top of your tasks with a clean two-tab interface, deadline tracking, reminders, and full dark-mode support.

---

## 📲 Try the App

| Platform | Link |
|---|---|
| **Expo project page** | [expo.dev/projects/tasky](https://expo.dev/accounts/jatinkaushikjk/projects/tasky) |
| **Preview build (APK)** | [Download latest build →](https://expo.dev/accounts/jatinkaushikjk/projects/tasky/builds) |
| **EAS project ID** | `a612c521-cec9-46b5-8659-4b7a305cc640` |

> **Android** — download the APK from the builds page and install it directly on your device (enable *Install from unknown sources* if prompted).  
> **iOS** — use the development or TestFlight build via EAS.

---

## ✨ Features

- **Two-tab layout** — *Today* tab shows tasks due today; *All Tasks* tab shows the complete list
- **Add / Edit / Delete tasks** — full CRUD via a smooth slide-up bottom sheet modal
- **Deadlines** — optional due date & time with overdue highlighting
- **Reminders** — set a specific reminder time per task
- **Native date/time pickers** — calendar UI for date, clock UI for time (12-hr AM/PM), powered by `@react-native-community/datetimepicker`
- **Persistent storage** — todos survive app restarts via `AsyncStorage`
- **Dark mode** — automatic light/dark theme based on system preference
- **Cross-platform** — runs on Android, iOS, and Web

---

## 🛠 Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 with [Expo Router](https://docs.expo.dev/router/introduction/) |
| UI | React Native + custom violet-accented theme |
| Date/Time Picker | [`@react-native-community/datetimepicker`](https://github.com/react-native-datetimepicker/datetimepicker) 8.4.4 |
| Storage | [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage) |
| State | React `useReducer` + Context |
| Navigation | Expo Router (file-based) + `@react-navigation/bottom-tabs` |
| Animations | React Native `Animated` API + `react-native-reanimated` |
| Language | TypeScript |
| Package Manager | [Bun](https://bun.sh) |
| Build / Distribution | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## 📁 Project Structure

```
tasky/
├── src/
│   ├── app/                   # Expo Router pages (file-based routing)
│   │   ├── _layout.tsx        # Root layout with tab navigator
│   │   ├── index.tsx          # Redirects to the Today tab
│   │   ├── today.tsx          # Today's tasks screen
│   │   └── all.tsx            # All tasks screen
│   ├── components/
│   │   ├── add-todo-modal.tsx # Slide-up bottom sheet for add/edit
│   │   ├── app-tabs.tsx       # Native tab bar (mobile)
│   │   ├── app-tabs.web.tsx   # Custom tab bar for web
│   │   ├── todo-card.tsx      # Individual task card with swipe/actions
│   │   ├── empty-state.tsx    # Empty list placeholder
│   │   ├── animated-icon.tsx  # Animated tab icon (native)
│   │   └── animated-icon.web.tsx
│   ├── store/
│   │   ├── todos.ts           # useTodos hook, reducer, AsyncStorage logic
│   │   └── todos-context.tsx  # React context provider
│   ├── constants/
│   │   └── theme.ts           # Color palette & spacing tokens
│   └── hooks/
│       ├── use-theme.ts       # Returns correct Colors object for scheme
│       └── use-color-scheme.ts
├── assets/
│   └── images/                # App icon, splash, tab icons
├── app.json                   # Expo app config
├── eas.json                   # EAS Build profiles
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [Bun](https://bun.sh) (recommended) or npm/yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For Android build: Android Studio + SDK
- For iOS build: macOS + Xcode

### 1. Install dependencies

```bash
bun install
# or
npm install
```

### 2. Start the development server

```bash
bun expo start
# or
npx expo start
```

Then press:
- `a` — open on Android emulator / device
- `i` — open on iOS simulator (macOS only)
- `w` — open in the browser

### 3. Run directly on a platform

```bash
bun run android   # Android
bun run ios       # iOS (macOS only)
bun run web       # Web browser
```

---

## 📦 Building with EAS

This project uses [EAS Build](https://docs.expo.dev/build/introduction/). Three build profiles are configured in `eas.json`:

| Profile | Description |
|---|---|
| `development` | Dev client build, internal distribution |
| `preview` | Internal APK (Android) for testing |
| `production` | Store-ready build with auto version increment |

### Prebuild (generate native projects)

```bash
bunx expo prebuild --clean
```

### Trigger a cloud build

```bash
eas build --profile preview --platform android
eas build --profile production --platform all
```

---

## 🗓 Date & Time Picker

Deadline and reminder pickers use `@react-native-community/datetimepicker`:

- **Date** — calendar dialog on Android (`display="calendar"`), inline calendar on iOS (`display="inline"`)
- **Time** — clock dialog on Android (`display="clock"`), spinner on iOS (`display="spinner"`)
- **Format** — 12-hour AM/PM (`is24Hour={false}`)
- On Android, selecting a date automatically opens the time picker next

---

## 🎨 Theme

The app uses a custom violet-accented palette defined in `src/constants/theme.ts`. It supports **light** and **dark** variants, toggling automatically with the system setting (`userInterfaceStyle: "automatic"`).

---

## 📄 License

MIT — feel free to use and extend.
