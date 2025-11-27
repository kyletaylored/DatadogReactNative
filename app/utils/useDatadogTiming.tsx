import { ComponentType, Profiler, useEffect, useRef } from "react"
import { DdRum, RumActionType } from "@datadog/mobile-react-native"
import { trackAction } from "./datadog"

/**
 * Hook to track the time it takes for a component to mount relative to the start of the current view.
 *
 * @param timingName - Unique name for the timing event (e.g. "hero_image_loaded")
 * @param condition - Optional condition that must be true before timing is sent (default: true)
 */
export const useDatadogTiming = (timingName: string, condition: boolean = true) => {
  const hasLogged = useRef(false)

  useEffect(() => {
    if (condition && !hasLogged.current) {
      try {
        DdRum.addTiming(timingName)
        console.log(`[Datadog] ⏱️ Timing added: ${timingName}`)
        hasLogged.current = true
      } catch (error) {
        console.error(`[Datadog] Failed to add timing for ${timingName}:`, error)
      }
    }
  }, [timingName, condition])
}

/**
 * Higher-Order Component (HOC) to automatically track when a component mounts.
 *
 * Usage:
 * const MyComponent = withDatadogTiming(OriginalComponent, "my_component_mounted")
 *
 * @param WrappedComponent - The component to track
 * @param timingName - Name of the timing event. Defaults to the component's display name.
 */
export function withDatadogTiming<P extends object>(
  WrappedComponent: ComponentType<P>,
  timingName?: string,
): ComponentType<P> {
  const name = timingName || WrappedComponent.displayName || WrappedComponent.name || "UnknownComponent"

  const WithDatadogTiming = (props: P) => {
    useDatadogTiming(`${name}_mounted`)
    return <WrappedComponent {...props} />
  }

  WithDatadogTiming.displayName = `withDatadogTiming(${name})`
  return WithDatadogTiming
}

/**
 * A wrapper component that tracks when its children are mounted.
 *
 * Usage:
 * <TrackedLoading name="user_list">
 *   <UserList />
 * </TrackedLoading>
 */
export const TrackedLoading: React.FC<{ name: string; children: React.ReactNode }> = ({
  name,
  children,
}) => {
  useDatadogTiming(`${name}_mounted`)
  return <>{children}</>
}

/**
 * A wrapper using React.Profiler to track the actual JS render duration.
 * This measures how expensive the component is to calculate (CPU time).
 *
 * Usage:
 * <DatadogProfiler name="ComplexList">
 *   <FlatList ... />
 * </DatadogProfiler>
 */
export const DatadogProfiler: React.FC<{ name: string; children: React.ReactNode }> = ({
  name,
  children,
}) => {
  const onRender = (
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => {
    // Only log significant renders (>16ms, i.e., dropped frames) to reduce noise
    // or log everything if needed. Here we log all for demo purposes.
    
    trackAction(
      `${id}_rendered`, 
      "custom", 
      {
        profiler_id: id,
        render_phase: phase,
        actual_duration_ms: actualDuration, // Time spent rendering the committed update
        base_duration_ms: baseDuration,     // Estimated time to render the entire subtree without memoization
        start_time: startTime,
        commit_time: commitTime,
      }
    )
  }

  return (
    <Profiler id={name} onRender={onRender}>
      {children}
    </Profiler>
  )
}

