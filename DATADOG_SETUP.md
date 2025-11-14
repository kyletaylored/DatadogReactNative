# Datadog RUM Setup Guide

This guide explains how to set up and use Datadog Real User Monitoring (RUM) in your React Native app to track view loading times.

## 🎯 What's Been Set Up

1. **Datadog SDK installed**: `@datadog/mobile-react-native`
2. **Datadog initialization**: Configured in `app/app.tsx`
3. **View tracking hook**: Automatic tracking in `AppNavigator`
4. **Alternative component hook**: For custom loading state tracking

## 📋 Setup Instructions

### 1. Get Your Datadog Credentials

1. Log in to your [Datadog account](https://app.datadoghq.com/)
2. Navigate to **UX Monitoring** → **Setup & Configuration** → **RUM Applications**
3. Create a new application or select an existing one
4. Copy your:
   - **Client Token**
   - **Application ID**

### 2. Update Configuration

Replace the placeholder values in `app/app.tsx`:

```typescript
return initializeDatadog(
  "YOUR_CLIENT_TOKEN", // Replace with your actual client token
  "YOUR_APPLICATION_ID", // Replace with your actual application ID
  __DEV__ ? "dev" : "prod",
)
```

**Recommended**: Store these in your config files instead of hardcoding:

```typescript
// In app/config/config.base.ts or config.dev.ts
export default {
  // ... other config
  datadog: {
    clientToken: "YOUR_CLIENT_TOKEN",
    applicationId: "YOUR_APPLICATION_ID",
  },
}

// Then in app.tsx
import Config from "@/config"

return initializeDatadog(
  Config.datadog.clientToken,
  Config.datadog.applicationId,
  __DEV__ ? "dev" : "prod",
)
```

### 3. Configure Native Dependencies

#### iOS Setup

```bash
cd ios
pod install
cd ..
```

#### Android Setup

No additional setup required - dependencies are automatically linked.

### 4. Rebuild Your App

```bash
# For iOS
npm run ios

# For Android
npm run android
```

## 🚀 How It Works

### Automatic View Tracking

The `onStateChange` handler in `AppNavigator.tsx` automatically tracks when users navigate between screens. When navigation completes, it calls `DdRum.addViewLoadingTime(true)` to mark the view as loaded.

```typescript
export const AppNavigator = (props: NavigationProps) => {
  // Tracks navigation changes and calls DdRum.addViewLoadingTime(true)
  const handleNavigationStateChange = (state) => {
    // ... tracks active route changes
  }

  return (
    <NavigationContainer onStateChange={handleNavigationStateChange}>
      ...
    </NavigationContainer>
  )
}
```

### Custom Component-Level Tracking

For screens with async data loading, use `useDatadogViewLoadingComplete()`:

```typescript
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

export const MyScreen = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData().then(() => {
      setIsLoading(false)
    })
  }, [])

  // Tracks when data finishes loading
  useDatadogViewLoadingComplete(!isLoading)

  if (isLoading) return <LoadingSpinner />

  return <View>Your content</View>
}
```

## 📊 View Tracking Methods

### Method 1: Navigation-Based (Automatic)

- ✅ Already implemented in `AppNavigator`
- ✅ Tracks when navigation transitions complete
- ✅ No changes needed in individual screens
- ℹ️ Best for: Simple screens without async data

### Method 2: Component-Based (Manual)

- 🔧 Requires adding hook to each screen
- ✅ Tracks when screen data finishes loading
- ✅ More accurate for data-heavy screens
- ℹ️ Best for: Screens with API calls or complex loading states

## 🔍 Viewing Data in Datadog

1. Go to **UX Monitoring** → **Performance Summary**
2. Select your application
3. View metrics:
   - **View Loading Time**: Time until `addViewLoadingTime()` is called
   - **View Count**: Number of view loads
   - **Performance by Screen**: Per-screen breakdown

## 🛠️ Customization Options

### Adjust Sampling Rate

In `app/utils/datadog.ts`:

```typescript
config.sessionSamplingRate = 100 // 100% of sessions (change to lower value in production)
```

### Change Datadog Site

```typescript
config.site = "US1" // Options: US1, US3, US5, EU1, AP1
```

### Enable/Disable Features

```typescript
const config = new DdSdkReactNativeConfiguration(
  clientToken,
  env,
  applicationId,
  true, // track User interactions (true/false)
  true, // track XHR Resources (true/false)
  true, // track Errors (true/false)
)
```

## 📝 Example: Login Screen with Loading Tracking

```typescript
import { FC, useState } from "react"
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

export const LoginScreen: FC = () => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Simulate initialization
    loadCredentials().then(() => {
      setIsInitialized(true)
    })
  }, [])

  // Mark view as loaded when initialization completes
  useDatadogViewLoadingComplete(isInitialized)

  return (
    <Screen>
      {!isInitialized ? <LoadingIndicator /> : <LoginForm />}
    </Screen>
  )
}
```

## 🐛 Troubleshooting

### "Datadog not initialized" errors

- Ensure `initializeDatadog()` is called before navigation
- Check that credentials are correct
- Verify the app has internet connectivity

### No data appearing in Datadog

- Wait 1-2 minutes for data to appear
- Check sampling rate is > 0
- Verify credentials and site are correct
- Check console logs for errors

### Duplicate tracking events (View loading time already exists warning)

- **Don't mix tracking methods!** Use automatic navigation tracking OR component-level hooks, not both
- The example screens use component-level tracking for demonstration
- Simple screens rely on the automatic navigation-based tracking
- If you see "View loading time already exists" warnings, you're calling `addViewLoadingTime()` twice

### Invalid token warnings

- Make sure you've replaced `"YOUR_CLIENT_TOKEN"` and `"YOUR_APPLICATION_ID"` with real credentials
- Check that you're targeting the correct Datadog site (US1, EU1, etc.)
- Verify your token hasn't expired in the Datadog dashboard

## 📚 Additional Resources

- [Datadog RUM React Native Documentation](https://docs.datadoghq.com/real_user_monitoring/mobile_and_tv_monitoring/setup/reactnative/)
- [RUM & Session Replay Pricing](https://www.datadoghq.com/pricing/?product=real-user-monitoring)
- [View Tracking Guide](https://docs.datadoghq.com/real_user_monitoring/mobile_and_tv_monitoring/advanced_configuration/reactnative/)
