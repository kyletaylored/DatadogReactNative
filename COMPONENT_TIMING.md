[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md)

# Datadog Component Timing Tracking

## Overview
We've added utilities to automatically track component mounting times relative to the start of a View. This uses `DdRum.addTiming()` under the hood.

## Utilities

### 1. `TrackedLoading` Component
A wrapper component that automatically tracks when its children are mounted.

**Usage:**
```tsx
import { TrackedLoading } from "@/utils/useDatadogTiming"

// In your render:
<TrackedLoading name="hero_image">
  <Image source={...} />
</TrackedLoading>
```

**Result:**
Datadog RUM will receive a timing event named `hero_image_mounted`. The duration will be the time from when the user navigated to the screen until this component appeared.

### 2. `withDatadogTiming` HOC
A Higher-Order Component to wrap any component definition.

**Usage:**
```tsx
import { withDatadogTiming } from "@/utils/useDatadogTiming"

const MyComponent = (props) => <View>...</View>

// Export the tracked version
export default withDatadogTiming(MyComponent, "my_component")
```

### 3. `useDatadogTiming` Hook
A custom hook for manual control within a component.

**Usage:**
```tsx
import { useDatadogTiming } from "@/utils/useDatadogTiming"

const MyComponent = () => {
  // Tracks 'my_component_mounted' when this component renders
  useDatadogTiming("my_component_mounted")
  
  return <View>...</View>
}
```

### 4. `<DatadogProfiler>` Component (New!)
A wrapper that uses the official `React.Profiler` API to measure the cost of rendering.

**What it measures:**
- **Actual Duration**: Time spent rendering the committed update.
- **Base Duration**: Estimated time to render the entire subtree without memoization.
- **Render Phase**: "mount" or "update".

**Usage:**
```tsx
import { DatadogProfiler } from "@/utils/useDatadogTiming"

<DatadogProfiler name="ComplexProductList">
  <FlatList ... />
</DatadogProfiler>
```

**Result:**
Logs a custom action named `ComplexProductList_rendered` with full performance metrics attached.


### 5. `useDatadogViewLoadingComplete` (View Timing)
Manually marks the "Loading Time" of a view in Datadog RUM. This corresponds to the `loading_time` metric in the Views dashboard.

**Usage:**
```tsx
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

const MyScreen = () => {
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Call this when your critical content is ready
  useDatadogViewLoadingComplete(dataLoaded)

  useEffect(() => {
    fetchData().then(() => setDataLoaded(true))
  }, [])
  
  return <View>...</View>
}
```

**Result:**
Updates the active view's "Loading Time" metric. Useful for tracking "Time to Interactive" accurately.

## Use Cases

- **Lazy Loaded Content**: Track exactly when content appears after a fetch (`TrackedLoading`).
- **Conditional Rendering**: Track when specific UI elements appear.
- **Render Performance**: Identify components that are expensive to render (`DatadogProfiler`).

## Implementation Details
- **File**: `app/utils/useDatadogTiming.tsx`
- **Mechanism**:
  - `TrackedLoading`: Uses `useEffect` (mount timing).
  - `DatadogProfiler`: Uses `React.Profiler` (render cost).


