[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md) | [🧪 Scenarios](./SCENARIOS.md)

# Datadog App Upload Guide

This guide explains how to build your application (`.apk` or `.ipa`) and upload it to Datadog for Synthetic Mobile Testing.

## 🤖 Android (Recommended for Testing)

Building an Android APK is free and doesn't require a developer account.

### 1. Build the APK
Generates a preview APK at `./build/app.apk`.
```bash
npm run build:android:apk
```

### 2. Upload to Datadog
Uploads the generated APK to Datadog.
```bash
# Export your credentials first
export DD_API_KEY="<YOUR_DATADOG_API_KEY>"
export DD_APP_KEY="<YOUR_DATADOG_APP_KEY>"
export DATADOG_SYNTHETICS_MOBILE_APPLICATION_ID="<YOUR_MOBILE_APP_ID>"

# Run the upload
npm run upload:android:datadog
```

## 🍎 iOS (Requires Apple Developer Account)

Building a valid `.ipa` for real devices requires a paid Apple Developer Program membership.

### 1. Build the IPA
Generates a production build at `./build/app.ipa`.
```bash
npm run build:ios:ipa
```

### 2. Upload to Datadog
```bash
npm run upload:ios:datadog
```

## 📋 Configuration Details

The upload script relies on standard Datadog environment variables.

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `DD_API_KEY` | Your Datadog API Key | Organization Settings -> API Keys |
| `DD_APP_KEY` | Your Datadog Application Key | Organization Settings -> Application Keys |
| `DATADOG_SYNTHETICS_MOBILE_APPLICATION_ID` | The ID of the mobile app in Datadog Synthetics | UX Monitoring -> Synthetic Monitoring -> Mobile Applications -> Select App -> Application ID (top left) |

## 🛠️ Scripts Added

We added scripts to `package.json` for both platforms:

**Android**
- `build:android:apk`: Builds a local APK using the `preview` profile.
- `upload:android:datadog`: Uploads `./build/app.apk`.

**iOS**
- `build:ios:ipa`: Builds a local IPA using the `production` profile (requires signing).
- `build:ios:sim:local`: Builds a Simulator app (`.tar.gz`) for local testing (no signing needed).
- `upload:ios:datadog`: Uploads `./build/app.ipa`.

## ⚠️ Troubleshooting

**Android Build fails?**
- Ensure you have the Android SDK and Java (JDK 17 recommended) installed.
- Run `eas doctor`.
- If you get Gradle errors, try `cd android && ./gradlew clean`.

**Upload fails?**
- Check that all 3 environment variables are set.
- Ensure your API/App keys have the correct permissions (Synthetics write access).
- Verify the file exists at `./build/app.apk` (or `.ipa`).

