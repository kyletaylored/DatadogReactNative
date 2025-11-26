/**
 * Datadog RUM (Real User Monitoring) configuration
 */
import { Platform } from "react-native"
import * as Application from "expo-application"
import {
  BatchSize,
  DatadogProviderConfiguration,
  DdSdkReactNative,
  DdRum,
  SdkVerbosity,
  UploadFrequency,
  RumActionType,
  ErrorSource,
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

  // Set recommended global attributes
  setGlobalAttributes({
    app_version: Application.nativeApplicationVersion || "unknown",
    build_version: Application.nativeBuildVersion || "unknown",
    platform_os: Platform.OS,
    platform_version: Platform.Version,
    is_emulator: !Platform.isTesting, // Rough check for emulator/sim
    font_scale: 1.0, // Default, can be updated if dynamic type changes
  })

  console.log("[Datadog] ✅ Session Replay enabled & attributes set")
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
    DdSdkReactNative.setUserInfo({ id: "" })
    console.log("[Datadog] ✅ User info cleared")
  } catch (error) {
    console.error("[Datadog] ❌ Error clearing user info:", error)
  }
}

// ==========================================
// Custom Attributes & Tracking
// ==========================================

/**
 * Set global custom attributes that will be attached to all future RUM events
 * (Sessions, Views, Actions, Errors, Resources)
 */
export const setGlobalAttributes = (attributes: Record<string, unknown>) => {
  try {
    DdSdkReactNative.setAttributes(attributes)
    console.log("[Datadog] 🎨 Global attributes set:", attributes)
  } catch (error) {
    console.error("[Datadog] ❌ Error setting global attributes:", error)
  }
}

/**
 * Log a custom user action with attributes
 */
export const trackAction = (
  name: string,
  type: "tap" | "scroll" | "swipe" | "custom" = "custom",
  attributes: Record<string, unknown> = {},
) => {
  try {
    let actionType: RumActionType
    switch (type) {
      case "tap":
        actionType = RumActionType.TAP
        break
      case "scroll":
        actionType = RumActionType.SCROLL
        break
      case "swipe":
        actionType = RumActionType.SWIPE
        break
      case "custom":
      default:
        actionType = RumActionType.CUSTOM
        break
    }
    DdRum.addAction(actionType, name, attributes)
  } catch (error) {
    console.error("[Datadog] ❌ Error tracking action:", error)
  }
}

// Track currently loading elements
const activeLoadingElements = new Set<string>()

/**
 * Track the loading state of a UI element or process.
 * Returns callbacks to mark the load as successful or failed.
 *
 * This updates the global 'loading_elements' attribute, allowing you to find
 * sessions where elements started loading but never finished (stuck/abandoned).
 *
 * @param elementName - Unique name for the element/process (e.g., "CheckoutButton", "UserProfile")
 */
export const trackElementLoading = (elementName: string) => {
  // Add to active set
  activeLoadingElements.add(elementName)
  updateLoadingAttributes()

  const startTime = Date.now()

  return {
    /**
     * Call when the element successfully finishes loading
     */
    success: (additionalAttributes?: Record<string, unknown>) => {
      activeLoadingElements.delete(elementName)
      updateLoadingAttributes()

      const duration = Date.now() - startTime
      DdRum.addAction(RumActionType.CUSTOM, "Element Loaded", {
        element_name: elementName,
        duration_ms: duration,
        success: true,
        ...additionalAttributes,
      })
    },

    /**
     * Call when the element fails to load
     */
    error: (error?: Error | unknown) => {
      activeLoadingElements.delete(elementName)
      updateLoadingAttributes()

      DdRum.addError(
        `Element Load Failed: ${elementName}`,
        ErrorSource.CUSTOM,
        error instanceof Error ? error.stack || error.message : "Unknown error",
        {
          element_name: elementName,
          failed_load: true,
        },
      )
    },
  }
}

/**
 * Helper to update the global RUM context with the current list of loading elements
 */
const updateLoadingAttributes = () => {
  try {
    const loadingList = Array.from(activeLoadingElements)
    // 'loading_elements' will contain the names of all elements currently pending
    DdSdkReactNative.setAttributes({
      loading_elements: loadingList,
      // 'has_pending_loads' is a quick boolean filter
      has_pending_loads: loadingList.length > 0,
    })
  } catch (error) {
    console.error("[Datadog] ❌ Error updating loading attributes:", error)
  }
}
