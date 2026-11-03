# TalkTask — Google Play Store Release-Readiness Checklist

Follow this checklist prior to submitting TalkTask to the Google Play Console.

---

## 1. App Identity & Store Listing

- [x] **Application ID**: Unique reverse-domain configured as `com.talktask.app`.
- [x] **App Name**: `TalkTask` (under 30 characters).
- [x] **Short Description**: `Speak once. Get things organised. India-first voice productivity.` (under 80 characters).
- [ ] **Full Description**:
  - Highlights voice-to-action magic.
  - Multi-language capabilities: English, Hindi, and Hinglish.
  - 100% offline-first reliability: notes & tasks saved locally in SQLite.
  - Local notifications for bill payments, meetings, and shopping lists.
- [x] **App Icon**: High-res 512x512 PNG adaptive icon configured.
- [ ] **Feature Graphic**: 1024x500 PNG banner showcasing the prominent microphone and clean dashboard.
- [ ] **Phone Screenshots**: Minimum 4 high-res screenshots (Home, Voice Capture, Notes, Tasks & Checklists).

---

## 2. Technical & Android Specifications

- [x] **Target SDK**: Configured for Android 14+ (API 34/35).
- [x] **Minimum SDK**: Android 7.0+ (API 24+) to support budget devices across Tier-2/3 India and global markets.
- [x] **Version Code & Name**: `versionCode 1`, `versionName "1.0.0"`.
- [x] **64-bit Architecture**: React Native New Architecture + 64-bit libraries included (`arm64-v8a`, `x86_64`).
- [x] **Offline-First Functionality**: App boots without internet, accesses existing data, and persists changes locally.

---

## 3. Privacy & Google Play Policy Compliance

- [x] **Target Audience & Content**: General productivity (Everyone / Content Rating questionnaire ready).
- [x] **Microphone Permission Disclosure (`android.permission.RECORD_AUDIO`)**: Requested strictly when user taps the microphone, with in-app explanation.
- [x] **Notification Permission (`android.permission.POST_NOTIFICATIONS`)**: Requested gently when setting or scheduling reminders.
- [x] **Exact Alarm Permission (`android.permission.SCHEDULE_EXACT_ALARM`)**: Declared for on-time reminder triggering; justified by reminder feature.
- [x] **Data Safety Section Declarations**:
  - Voice audio: Stored locally; not transmitted to third-party ad networks.
  - Personal info: Zero personal account data collected for offline note taking.
  - Encryption in transit: All external API requests (if user enables optional Cloud Whisper) use HTTPS.
  - User Deletion: "Delete All Data" feature available directly in Settings.

---

## 4. Monetization & Ads Policy

- [x] **Ad Placements**:
  - Interstitial ads shown at most once every 4 completed actions.
  - Never shown during audio recording, transcription, or editing.
  - Never masquerades as app navigation or system dialogs.
- [x] **Test Ad IDs**: Google official test IDs used during development (`ca-app-pub-3940256099942544/...`).
- [ ] **Production AdMob IDs**: Replace with live approved ad unit IDs before release.
