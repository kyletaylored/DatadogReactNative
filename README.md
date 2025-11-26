[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md)

# Datadog React Native RUM Demo

This application demonstrates a full-featured integration of **Datadog Real User Monitoring (RUM)** in a React Native (Expo) environment. It showcases best practices for tracking user sessions, measuring performance, handling errors, and protecting user privacy.

The app simulates an e-commerce store using the [Platzi Fake Store API](https://fakeapi.platzi.com/), allowing you to generate real RUM data through realistic user flows like browsing products, logging in, and simulating errors.

## 📚 Documentation Index

We have created detailed guides for each aspect of the integration:

| Topic | Description |
|-------|-------------|
| **[Datadog Setup](./DATADOG_SETUP.md)** | Initial configuration, SDK installation, and basic initialization. |
| **[Environment Setup](./ENV_SETUP.md)** | How to securely manage API keys and credentials using `.env` files. |
| **[User Tracking](./USER_TRACKING_IMPLEMENTATION.md)** | Implementing persistent user identification (ID, name, email, role) across sessions. |
| **[Custom Attributes](./CUSTOM_TRACKING.md)** | Adding global metadata (e.g., app version) and tracking "stuck" loading states. |
| **[Component Timing](./COMPONENT_TIMING.md)** | Measuring render times of specific components using HOCs and hooks. |

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18
- React Native development environment set up
- A Datadog account (you'll need a Client Token and Application ID)

### 2. Installation

```bash
# Install dependencies
npm install

# Install iOS pods (if on macOS)
cd ios && pod install && cd ..
```

### 3. Configuration

Create a `.env` file in the root directory with your Datadog credentials:

```bash
DATADOG_CLIENT_TOKEN=your_client_token
DATADOG_APPLICATION_ID=your_application_id
DATADOG_ENV=dev
```
*(See [ENV_SETUP.md](./ENV_SETUP.md) for more details)*

### 4. Running the App

```bash
# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

## 💡 Key Demo Features

Navigate to **Demo Examples** in the app to see these in action:

### 🛍️ E-Commerce Flows
- **Paginated Lists**: Tracks scroll performance and infinite loading.
- **Product Details**: Measures "Time to Interactive" for complex views using custom component timing.
- **Image Gallery**: Tracks image loading performance.

### 🔐 Authentication & User Tracking
- **Real User Identification**: Logs users in and ties their RUM session to their profile.
- **Persistent Sessions**: User identity survives app restarts.
- **Role-Based Tracking**: Tracks user roles (e.g., 'admin', 'customer') as custom attributes.
- *(See [USER_TRACKING_IMPLEMENTATION.md](./USER_TRACKING_IMPLEMENTATION.md))*

### ⚠️ Error Handling & Debugging
- **Crash Reporting**: Native crash reporting is enabled.
- **Handled Errors**: "Test Bad Credentials" button to generate 401 errors.
- **Stuck Loading States**: Simulates and tracks elements that fail to load properly.
- *(See [CUSTOM_TRACKING.md](./CUSTOM_TRACKING.md))*

### 📊 Performance Monitoring
- **View Loading Times**: Automatic React Navigation tracking.
- **Component Timing**: Granular measurement of specific UI components (e.g., Hero Images).
- **Resource Timing**: Network request tracking for all API calls.
- *(See [COMPONENT_TIMING.md](./COMPONENT_TIMING.md))*

## 🛠️ Project Structure

- `app/utils/datadog.ts`: Core SDK initialization and helper functions.
- `app/utils/useDatadogTiming.ts`: Custom hooks for measuring component performance.
- `app/context/AuthContext.tsx`: Authentication logic integrated with RUM user tracking.
- `app/screens/AuthExampleScreen.tsx`: Demo screen for login flows.
- `app/screens/ProductDetailScreen.tsx`: Demo screen for component timing.

---
*Built with [Ignite](https://github.com/infinitered/ignite) and [Expo](https://expo.dev).*
