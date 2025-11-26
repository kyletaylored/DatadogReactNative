[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md)

# User Tracking Implementation

## Overview

This document describes the user tracking implementation integrated with Datadog RUM.

## What Was Implemented

### 1. Datadog User Tracking Functions (`app/utils/datadog.ts`)

Added two new functions for managing Datadog user tracking:

- **`setDatadogUser()`**: Sets user information in Datadog when a user logs in
  - Accepts user ID, name, email, and extra info (like role)
  - Automatically called when users log in through the demo components

- **`clearDatadogUser()`**: Clears user information from Datadog on logout
  - Called automatically when users log out

### 2. Enhanced Authentication Context (`app/context/AuthContext.tsx`)

Extended the authentication context to support persistent user tracking:

- **User Profile Storage**: Stores complete user profile data (ID, name, email, role, avatar) using MMKV persistent storage
- **`loginWithProfile()`**: New function that:
  - Stores authentication token and user profile
  - Automatically tracks the user with Datadog
  - Persists across app restarts

- **Enhanced `logout()`**: Now clears both app state and Datadog user tracking

- **Auto-Restoration**: On app restart, if a user is logged in, their Datadog tracking is automatically restored

### 3. Updated Demo Login Screen (`app/screens/AuthExampleScreen.tsx`)

Modified the authentication demo screen to use the persistent auth context:

- When users successfully log in through the demo, their profile is now:
  - Stored persistently in the app
  - Tracked in Datadog with their user information
- Users stay logged in across app restarts until they manually log out

## How It Works

### Login Flow

1. User enters credentials in the AuthExampleScreen
2. App authenticates with Platzi Fake Store API
3. User profile is fetched
4. `loginWithProfile()` is called, which:
   - Saves token and profile to persistent storage
   - Calls `DdSdkReactNative.setUserInfo()` with user details
   - User data includes: id, name, email, and role (as extraInfo)

### Logout Flow

1. User taps "Logout" button
2. `authLogout()` is called, which:
   - Clears token and profile from storage
   - Calls `DdSdkReactNative.setUserInfo({})` to clear user tracking
   - User becomes anonymous in Datadog again

### Session Persistence

- User data is stored in MMKV (fast, persistent key-value storage)
- On app restart, if user data exists:
  - User remains logged in
  - Datadog tracking is automatically restored with the stored user info

## Example Datadog User Info

When a user logs in, Datadog receives:

```javascript
{
  id: '1',              // User ID from API
  name: 'John Doe',     // User's full name
  email: 'john@mail.com', // User's email
  extraInfo: {
    role: 'customer'    // User's role
  }
}
```

## Testing the Implementation

1. **Login Test**:
   - Launch the app
   - Navigate to Demo Examples → Direct Login
   - Log in with demo credentials
   - User should stay logged in even after closing and reopening the app

2. **Logout Test**:
   - After logging in, tap the "Logout" button
   - User should be logged out
   - Datadog should stop tracking this specific user

3. **Datadog Verification**:
   - Check Datadog RUM console
   - Sessions should now show user information (name, email, ID, role)
   - After logout, new sessions should show as anonymous

## Benefits

- **Better User Analytics**: Track sessions by specific users, not just anonymous sessions
- **Improved Debugging**: Associate errors and performance issues with specific users
- **User Journey Tracking**: Follow a user's path through the app across multiple sessions
- **Persistent Sessions**: Users don't need to re-login every time they open the app

