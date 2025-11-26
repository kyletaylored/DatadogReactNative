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

## Use Cases

- **Lazy Loaded Content**: Track exactly when content appears after a fetch.
- **Conditional Rendering**: Track when specific UI elements (like error messages or success states) appear.
- **Performance Monitoring**: Identify slow-to-render components.

## Implementation Details
- **File**: `app/utils/useDatadogTiming.ts`
- **Mechanism**: Uses `useEffect` with an empty dependency array to trigger on mount.
- **Duplicate Prevention**: Uses a `ref` to ensure the timing is only sent once per component instance.

