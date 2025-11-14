/**
 * Custom hook to track React Navigation view loading times with Datadog RUM
 */
import { useEffect, useRef } from 'react'
import { useNavigationState } from '@react-navigation/native'
import { DdRum } from '@datadog/mobile-react-native'

/**
 * Hook that tracks view loading times in Datadog RUM
 * 
 * This hook listens to navigation state changes and marks views as loaded
 * when navigation completes, calling DdRum.addViewLoadingTime(true)
 */
export const useDatadogViewTracking = () => {
  const routeName = useNavigationState(
    (state) => state?.routes[state.index]?.name
  )
  const previousRouteName = useRef<string | undefined>()
  const isInitialLoad = useRef(true)

  useEffect(() => {
    // Skip the very first render to avoid tracking app initialization
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      previousRouteName.current = routeName
      return
    }

    // If route name changed, the previous view has finished loading
    if (routeName && routeName !== previousRouteName.current) {
      try {
        console.log(`[Datadog] View loaded: ${routeName}`)
        // Mark the view as loaded - this tells Datadog the view is ready
        DdRum.addViewLoadingTime(true)
      } catch (error) {
        console.error('[Datadog] Error tracking view loading time:', error)
      }
      
      previousRouteName.current = routeName
    }
  }, [routeName])
}

/**
 * Alternative hook for component-level tracking
 * Use this in individual screen components to track when they finish loading
 * 
 * @example
 * function MyScreen() {
 *   const [isLoading, setIsLoading] = useState(true)
 *   
 *   useEffect(() => {
 *     // Load your data
 *     loadData().then(() => setIsLoading(false))
 *   }, [])
 *   
 *   useDatadogViewLoadingComplete(!isLoading)
 *   
 *   return <View>...</View>
 * }
 */
export const useDatadogViewLoadingComplete = (isLoaded: boolean) => {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (isLoaded && !hasTracked.current) {
      try {
        console.log('[Datadog] View finished loading')
        DdRum.addViewLoadingTime(true)
        hasTracked.current = true
      } catch (error) {
        console.error('[Datadog] Error tracking view loading time:', error)
      }
    }
  }, [isLoaded])
}

