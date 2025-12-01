[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md)

# Datadog Custom Tracking

## Overview
We've added custom attribute tracking to enrich Datadog sessions and actions. This allows for deeper insights into user behavior and application state.

## Features

### 1. Global Custom Attributes
Automatically tracks device and app metadata with every session:
- `app_version`
- `build_version`
- `platform_os`
- `platform_version`
- `is_emulator`
- `font_scale`

### 2. Element Loading Tracking
A specialized utility to track UI elements that fail to load or get stuck in a loading state.

#### How to Use:
```typescript
import { trackElementLoading } from "./utils/datadog"

// Start tracking
const loadTracker = trackElementLoading("UserProfile")

try {
  await fetchUserProfile()
  // Success (tracks duration)
  loadTracker.success({ user_id: 123 }) 
} catch (error) {
  // Failure (tracks time-until-failure & specific error type)
  loadTracker.error(error, "network_timeout")
}
```

#### Why this is useful:
- **Structured State**: Creates a global `components` object in RUM events:
  ```json
  {
    "components": {
      "UserProfile": {
        "loaded": false,
        "duration": 4500
      }
    },
    "has_pending_loads": true
  }
  ```
- **Find "Stuck" Sessions**: Query for `has_pending_loads: true` or `@components.UserProfile.loaded:false`.
- **Performance Metrics**: Automatically tracks duration (`duration_ms`) for successful loads.
- **Granular Errors**: Classify errors with `error_type` (e.g., "network_timeout", "validation_error") for better filtering.

### 3. Custom Actions
Helper to log consistent custom actions:

```typescript
import { trackAction } from "./utils/datadog"

trackAction("AddToCart", "tap", { product_id: 99, price: 20.00 })
```

## Implementation Details
- **File**: `app/utils/datadog.ts`
- **Initialization**: `app/app.tsx` automatically sets recommended attributes on launch.

