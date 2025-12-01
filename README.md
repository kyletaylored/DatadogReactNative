[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md) | [🧪 Scenarios](./SCENARIOS.md) | [📲 Upload](./DATADOG_UPLOAD.md)

# Datadog React Native RUM Demo

This is a **React Native (Expo)** demonstration application designed to showcase the capabilities of **Datadog Real User Monitoring (RUM)**.

It includes real-world examples of user tracking, performance monitoring, custom actions, and error handling, along with interactive scenarios to test these features live.

## 🌟 Key Features

- **User Identity**: Track authenticated user sessions with persistent user info.
- **Component Timing**: Measure mount times (`<TrackedLoading>`) and render costs (`<DatadogProfiler>`).
- **View Loading**: Track accurate "Time to Interactive" for screens.
- **Custom State**: Track component loading states (`components.Name.loaded`) to find "stuck" UI.
- **Granular Errors**: Classify errors with custom types (e.g., `network_timeout`).
- **CI/CD Integration**: Scripts to build (`.ipa`/`.apk`) and upload to Datadog Synthetic Monitoring.

## 🚀 Quick Start

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Configure Environment**
    Copy the example env file and add your Datadog keys:

    ```bash
    cp .env.example .env
    # Edit .env with your CLIENT_TOKEN and APPLICATION_ID
    ```

3.  **Run the App**

    ```bash
    # iOS
    npm run ios

    # Android
    npm run android
    ```

4.  **Verify in Datadog**
    Go to **App -> Demo Examples -> Run Test Scenarios** to generate data.

## 📚 Documentation Index

| Guide                                                 | Description                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| [⚙️ Setup](./DATADOG_SETUP.md)                        | Initial SDK installation and configuration guide.                  |
| [🔑 Env Setup](./ENV_SETUP.md)                        | Managing secrets and environment variables securely.               |
| [👤 User Tracking](./USER_TRACKING_IMPLEMENTATION.md) | identifying users and tracking sessions.                           |
| [📊 Custom Tracking](./CUSTOM_TRACKING.md)            | Custom actions, attributes, and "stuck" loading state tracking.    |
| [⏱️ Component Timing](./COMPONENT_TIMING.md)          | Measuring rendering performance and component mount times.         |
| [🧪 Scenarios](./SCENARIOS.md)                        | Walkthrough of the interactive test scenarios included in the app. |
| [📲 Upload & Release](./DATADOG_UPLOAD.md)            | Building and uploading the app to Datadog Synthetics.              |

## 🛠️ Build & Release Commands

This project includes helper scripts for building and uploading to Datadog:

```bash
# Build & Upload Android (No Apple Dev Account needed)
npm run release:android

# Build & Upload iOS (Requires Apple Dev Account)
npm run release:ios
```
