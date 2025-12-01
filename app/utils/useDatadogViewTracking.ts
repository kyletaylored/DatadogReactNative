/**
 * Custom hook to track React Navigation view loading times with Datadog RUM
 */
import { useEffect, useRef } from "react"
import { DdRum } from "@datadog/mobile-react-native"

/**
 * Hook for component-level tracking
 * Use this in individual screen components to track when they finish loading
 *
 * @param isLoaded - Whether the view has finished loading
 */
export const useDatadogViewLoadingComplete = (isLoaded: boolean) => {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (isLoaded && !hasTracked.current) {
      try {
        const timestamp = new Date().toISOString()
        console.log(`[Datadog] ⏱️ View finished loading at ${timestamp}`)
        DdRum.addViewLoadingTime(true)
        hasTracked.current = true
      } catch (error) {
        console.error("[Datadog] Error tracking view loading time:", error)
      }
    }
  }, [isLoaded])
}
