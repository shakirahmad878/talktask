# TalkTask — Android Release & Build Guide

This guide outlines how to generate a Debug APK for direct sideloading and an Android App Bundle (AAB) for Google Play Store submission.

---

## 1. Prerequisites

- **Node.js**: v20+ (v24 LTS verified)
- **Java Development Kit**: JDK 17 (Microsoft OpenJDK 17 LTS verified)
- **Android SDK**: Build tools 34/35+, Platforms 34/35+
- **Environment Variables**:
  - `ANDROID_HOME`: Path to Android SDK (e.g. `%LOCALAPPDATA%\Android\Sdk` on Windows)
  - `PATH`: Must include `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\cmdline-tools\latest\bin`

---

## 2. Generate Debug APK (For Local Device Testing)

To build a standalone APK that can be installed on any physical Android phone or emulator:

```bash
cd talktask/android
# Set environment variable (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Compile Debug APK
.\gradlew assembleDebug
```

> [!TIP]
> **Windows Path Length Note (MAX_PATH 260 limit):**
> On Windows systems where Registry key `LongPathsEnabled` is 0, CMake/Ninja may fail with `Filename longer than 260 characters` due to nested C++ codegen directories. To resolve this instantly without administrative privileges, map a virtual short drive:
> ```powershell
> subst X: E:\Apps\talktask
> cd X:\android
> .\gradlew assembleDebug
> # When done:
> subst X: /D
> ```
> Or enable long paths with administrator PowerShell: `Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -Value 1`. Alternatively, use `eas build` which compiles in cloud Linux containers.

The compiled APK will be located at:
`talktask/android/app/build/outputs/apk/debug/app-debug.apk`

### Install onto Connected Phone / Emulator:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Generate Release AAB (Google Play Store Submission)

Google Play requires the **Android App Bundle (.aab)** format for all new apps.

### Step 3.1: Generate a Upload Keystore
If you haven't already created an upload key:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
Place `my-upload-key.keystore` inside `talktask/android/app/`.

### Step 3.2: Configure Gradle Keystore Properties
In `talktask/android/gradle.properties`, add:
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

### Step 3.3: Build the App Bundle
```bash
cd talktask/android
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew bundleRelease
```

The resulting bundle will be generated at:
`talktask/android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. Alternative: Build via Expo EAS (Cloud)

If you have an Expo Application Services account:
```bash
# Login to EAS
npx eas login

# Configure build
npx eas build:configure

# Build APK for preview testing
npx eas build --platform android --profile preview

# Build AAB for production Play Store
npx eas build --platform android --profile production
```
