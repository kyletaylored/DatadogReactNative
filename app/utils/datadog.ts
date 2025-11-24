/**
 * Datadog RUM (Real User Monitoring) configuration
 */
import {
  BatchSize,
  DatadogProviderConfiguration,
  DdSdkReactNative,
  SdkVerbosity,
  UploadFrequency,
} from "@datadog/mobile-react-native"
import {
  ImagePrivacyLevel,
  SessionReplay,
  TextAndInputPrivacyLevel,
  TouchPrivacyLevel,
} from "@datadog/mobile-react-native-session-replay"

/**
 * Create Datadog configuration
 *
 * @param clientToken - Your Datadog client token
 * @param applicationId - Your Datadog application ID
 * @param env - Environment (e.g., 'dev', 'staging', 'prod')
 */
export const createDatadogConfig = (
  clientToken: string,
  applicationId: string,
  env: string = "dev",
) => {
  const config = new DatadogProviderConfiguration(
    clientToken,
    env,
    applicationId,
    true, // track User interactions (e.g., Tap on buttons)
    true, // track XHR Resources
    true, // track Errors
  )

  // Set Datadog site
  config.site = "US1" // or 'US3', 'US5', 'EU1', 'AP1', etc.

  // Enable JavaScript long task collection
  config.longTaskThresholdMs = 100

  // Enable native crash reports
  config.nativeCrashReportEnabled = true

  // Sample RUM sessions (100% = all sessions tracked)
  config.sessionSamplingRate = 100

  // Enable background events tracking
  config.trackBackgroundEvents = true

  // Set first party hosts
  config.firstPartyHosts = ["api.escuelajs.co"]

  // Enable native interaction tracking
  config.nativeInteractionTracking = true

  // Development-specific settings
  if (__DEV__) {
    // Send data more frequently in dev
    config.uploadFrequency = UploadFrequency.FREQUENT
    // Send smaller batches of data in dev
    config.batchSize = BatchSize.SMALL
    // Enable debug logging
    config.verbosity = SdkVerbosity.DEBUG
  }

  return config
}

/**
 * Initialize Session Replay
 * This function should be passed to DatadogProvider's onInitialization prop
 */
export const onDatadogInitialized = async () => {
  console.log("[Datadog] SDK Initialized - setting up Session Replay")

  await SessionReplay.enable({
    replaySampleRate: 100, // 100% of sessions will have replay
    textAndInputPrivacyLevel: TextAndInputPrivacyLevel.MASK_SENSITIVE_INPUTS,
    imagePrivacyLevel: ImagePrivacyLevel.MASK_NONE,
    touchPrivacyLevel: TouchPrivacyLevel.SHOW,
  })

  console.log("[Datadog] ✅ Session Replay enabled")
}

/**
 * Set user information for Datadog tracking
 * Call this after successful login to track user sessions
 */
export const setDatadogUser = (user: {
  id: string | number
  name?: string
  email?: string
  extraInfo?: Record<string, any>
}) => {
  try {
    DdSdkReactNative.setUserInfo({
      id: String(user.id),
      name: user.name,
      email: user.email,
      extraInfo: user.extraInfo,
    })
    console.log("[Datadog] ✅ User info set:", { id: user.id, name: user.name, email: user.email })
  } catch (error) {
    console.error("[Datadog] ❌ Error setting user info:", error)
  }
}

/**
 * Clear user information from Datadog tracking
 * Call this on logout to stop tracking the user
 */
export const clearDatadogUser = () => {
  try {
    DdSdkReactNative.setUserInfo({})
    console.log("[Datadog] ✅ User info cleared")
  } catch (error) {
    console.error("[Datadog] ❌ Error clearing user info:", error)
  }
}
