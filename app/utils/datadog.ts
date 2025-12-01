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
 * @param version - Application version (e.g., '1.0.0' or '1.0.0-abc1234')
 */
export const createDatadogConfig = (
  clientToken: string,
  applicationId: string,
  env: string = "dev",
  version?: string,
) => {
  const config = new DatadogProviderConfiguration(
    clientToken,
    env,
    applicationId,
    true, // track User interactions (e.g., Tap on buttons)
    true, // track XHR Resources
    true, // track Errors
  )

  if (version) {
    config.version = version
  }

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

// Track component states: { loaded: boolean, duration: number, startTime: number }
interface ComponentLoadState {
  loaded: boolean
  duration: number
  startTime: number
}

const componentLoadStates = new Map<string, ComponentLoadState>()

/**
 * Track the loading state of a UI element or process.
 * Returns callbacks to mark the load as successful or failed.
 *
 * This updates the global 'components' attribute with structured data:
 * components: {
 *   [elementName]: {
 *     loaded: boolean,
 *     duration: number
 *   }
 * }
 *
 * @param elementName - Unique name for the element/process (e.g., "CheckoutButton", "UserProfile")
 */
export const trackElementLoading = (elementName: string) => {
  const startTime = Date.now()

  // Initialize state: not loaded, 0 duration
  componentLoadStates.set(elementName, {
    loaded: false,
    duration: 0,
    startTime,
  })
  updateLoadingAttributes()

  return {
    /**
     * Call when the element successfully finishes loading
     */
    success: (additionalAttributes?: Record<string, unknown>) => {
      const duration = Date.now() - startTime

      // Update state: loaded, set duration
      componentLoadStates.set(elementName, {
        loaded: true,
        duration,
        startTime,
      })
      updateLoadingAttributes()

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
    error: (error?: Error | unknown, errorType: string = "component_load_failure") => {
      const duration = Date.now() - startTime

      // Update state: NOT loaded, but track duration until failure
      componentLoadStates.set(elementName, {
        loaded: false,
        duration, // Duration until failure
        startTime,
      })
      updateLoadingAttributes()

      DdRum.addError(
        `Element Load Failed: ${elementName}`,
        ErrorSource.CUSTOM,
        error instanceof Error ? error.stack || error.message : "Unknown error",
        {
          element_name: elementName,
          failed_load: true,
          error_type: errorType,
        },
      )
    },
  }
}

/**
 * Helper to update the global RUM context with the current structured component states
 */
const updateLoadingAttributes = () => {
  try {
    const componentsData: Record<string, { loaded: boolean; duration: number }> = {}

    // Convert Map to the requested object structure
    componentLoadStates.forEach((state, name) => {
      componentsData[name] = {
        loaded: state.loaded,
        duration: state.duration,
      }
    })

    // Calculate pending count for quick filtering
    let pendingCount = 0
    componentLoadStates.forEach((state) => {
      if (!state.loaded) pendingCount++
    })

    DdSdkReactNative.setAttributes({
      components: componentsData,
      // Keep these helpful high-level flags
      has_pending_loads: pendingCount > 0,
      pending_load_count: pendingCount,
    })
  } catch (error) {
    console.error("[Datadog] ❌ Error updating loading attributes:", error)
  }
}
