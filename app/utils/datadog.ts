/**
 * Datadog RUM (Real User Monitoring) configuration and initialization
 */
import { DdSdkReactNative, DdSdkReactNativeConfiguration } from '@datadog/mobile-react-native'

let isInitialized = false

/**
 * Initialize Datadog RUM SDK
 * 
 * @param clientToken - Your Datadog client token
 * @param applicationId - Your Datadog application ID
 * @param env - Environment (e.g., 'dev', 'staging', 'prod')
 */
export const initializeDatadog = async (
  clientToken: string,
  applicationId: string,
  env: string = 'dev'
) => {
  if (isInitialized) {
    console.log('[Datadog] Already initialized')
    return
  }

  const config = new DdSdkReactNativeConfiguration(
    clientToken,
    env,
    applicationId,
    true, // track User interactions
    true, // track XHR Resources
    true  // track Errors
  )

  // Optional: Set additional configuration
  config.site = 'US1' // or 'US3', 'US5', 'EU1', 'AP1', etc.
  config.sessionSamplingRate = 100 // Sample 100% of sessions
  config.resourceTracingSamplingRate = 100
  config.nativeCrashReportEnabled = true
  config.verbosity = __DEV__ ? 'debug' : 'warn'

  await DdSdkReactNative.initialize(config)
  isInitialized = true
  console.log('[Datadog] RUM SDK initialized')
}

/**
 * Check if Datadog is initialized
 */
export const isDatadogInitialized = () => isInitialized

