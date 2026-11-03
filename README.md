# TalkTask 🎙️📋

> **Tagline**: *Speak once. Get things organised.*

TalkTask is a production-ready, India-first and global-ready Android productivity application built with **React Native**, **Expo Router**, **SQLite**, and **Zustand**. It translates natural spoken thoughts into structured, actionable productivity items: voice notes, to-do tasks with priorities, smart reminders with local exact notifications, and checklist items.

---

## Key Features

- **🎙️ Voice Capture & Live Metering**: Smooth recording experience with audio waveform pulsation, pause/resume, cancel, and duration timer.
- **🧠 Multi-Lingual Smart NLP Engine**:
  - Automatically identifies tasks, dates, times, shopping items, meetings, and ideas.
  - Native support for **English**, **Hindi (हिंदी)**, and **Hinglish** (e.g. *"Remind me to pay electricity bill on Friday at 5 PM"*, *"Buy milk, eggs, bread and vegetables tomorrow"*, *"Kal 5 baje Rahul ko call karna hai"*).
  - Explicit confirmation review modal before saving to eliminate misheard reminders or ambiguous dates.
- **⚡ 100% Offline-First Architecture**:
  - Persistent local **SQLite** database with ACID transactions and versioned migrations.
  - Opens instantly without network connection; search, create, edit, and delete notes offline.
- **⏰ Local Exact Notifications**:
  - Scheduled via `expo-notifications` with Android notification channels.
  - Automatic re-sync of pending reminders upon device reboot or app launch.
- **🔍 Universal Local Search**: Instant search across all notes, tasks, checklists, and meeting summaries.
- **🎨 Modern Productivity Aesthetic**:
  - Deep Indigo (`#4F46E5`), Soft Violet (`#7C3AED`), and Teal (`#0D9488`).
  - Dark mode with deep charcoal (`#0F172A`) and accessible typography.
- **🛡️ Privacy-First & Monetisation Ready**:
  - Zero private recordings transmitted to advertising networks.
  - Frequency-capped Google AdMob test integration (never interrupts recording or editing).
  - One-tap full JSON backup export & restore.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native (0.88), Expo (SDK 58) |
| **Routing** | Expo Router (File-based navigation with tabs) |
| **Local Database** | Expo SQLite (`openDatabaseSync`, ACID transactions, Migrations) |
| **State Management** | Zustand (Lightweight stores: Notes, Tasks, Settings, Recording) |
| **Audio & Speech** | `expo-av`, Modular `TranscriptionProvider` abstraction |
| **Notifications** | `expo-notifications` (Local exact alarms & channels) |
| **Icons & Design** | `lucide-react-native`, Custom Design Tokens |
| **Testing** | Jest, `ts-jest` (18 passing unit tests) |

---

## Project Structure

```
talktask/
├── app/                      # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom navigation (Home, Notes, Tasks, Settings)
│   │   ├── index.tsx         # Home Dashboard (Hero mic, summary, today's tasks)
│   │   ├── notes.tsx         # Notes module with category pills, pin, favourite
│   │   ├── tasks.tsx         # Tasks & Checklists module with priority & filters
│   │   └── settings.tsx      # Language, theme, notifications, backup & export
│   └── _layout.tsx           # App entry, SQLite & notification bootstrap
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable Button, Card, Badge, Input, EmptyState, Modal
│   │   ├── voice/            # VoiceRecordingModal, MicrophoneFAB
│   │   ├── dashboard/        # ProductivitySummaryCard, QuickActionsRow
│   │   ├── tasks/            # TaskItemCard, ChecklistCard, TaskModal
│   │   ├── notes/            # NoteCard, NoteEditorModal
│   │   ├── search/           # SearchModal (Universal instant local search)
│   │   └── onboarding/       # 3-step gentle onboarding guide
│   ├── services/
│   │   ├── db/               # SQLite database, migrations, repositories
│   │   ├── nlp/              # SmartExtractor (Multi-lingual rule engine)
│   │   ├── audio/            # AudioRecorder (expo-av with metering)
│   │   ├── transcription/    # Modular speech provider interface
│   │   ├── notifications/    # Local notification scheduler & boot resync
│   │   └── ads/              # AdMob integration & frequency capping
│   ├── store/                # Zustand stores (useNotes, useTasks, useSettings, useRecording)
│   ├── theme/                # Color palettes, typography, spacing, radii
│   └── types/                # Strict TypeScript interfaces
├── __tests__/                # Automated test suites
├── android/                  # Native Android project (prebuild)
├── DATABASE.md               # SQLite schema & migration documentation
├── ANDROID_RELEASE_GUIDE.md  # APK sideloading & AAB Play Store guide
└── PLAY_STORE_CHECKLIST.md   # Google Play compliance checklist
```

---

## Running the Application

### 1. Install Dependencies
```bash
cd talktask
npm install
```

### 2. Start Development Server
```bash
npm run start
```
- Press `a` to open in Android Emulator or connected physical device.
- Press `w` to run in web browser for rapid UI testing.

### 3. Run Automated Tests
```bash
npm run test
```
Executes all 18 unit tests across NLP parsing, SQLite database operations, checklists, reminders, and edge cases.

### 4. Build Standalone Android APK
```bash
cd android
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew assembleDebug
```
Output APK: `android/app/build/outputs/apk/debug/app-debug.apk`
