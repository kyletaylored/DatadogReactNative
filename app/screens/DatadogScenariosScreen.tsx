import { FC, useEffect, useState } from "react"
import { ActivityIndicator, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { fetchProduct } from "@/services/api/platzi-api"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { trackAction, trackElementLoading } from "@/utils/datadog"
import { DatadogProfiler, TrackedLoading } from "@/utils/useDatadogTiming"
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

interface DatadogScenariosScreenProps extends AppStackScreenProps<"DatadogScenarios"> {}

export const DatadogScenariosScreen: FC<DatadogScenariosScreenProps> =
  function DatadogScenariosScreen(_props) {
    const { themed } = useAppTheme()

    // State for Scenario 1 (Component Timing)
    const [showImage, setShowImage] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // State for Scenario 2 (Stuck Loading)
    const [isStuckLoading, setIsStuckLoading] = useState(false)

    // State for Scenario 3 (Slow Rendering)
    const [showHeavyList, setShowHeavyList] = useState(false)
    const [heavyListItems, setHeavyListItems] = useState<number[]>([])

    // State for Scenario 4 (Handled Error)
    const [errorResult, setErrorResult] = useState<string | null>(null)

    // State for simulating view loading
    const [viewReady, setViewReady] = useState(false)

    // Track view ready - triggered after simulated delay
    useDatadogViewLoadingComplete(viewReady)

    useEffect(() => {
      // Simulate a view loading process (e.g. fetching initial data)
      const timer = setTimeout(() => {
        setViewReady(true)
      }, 500) // 500ms artificial delay to make "Loading Time" visible in RUM
      return () => clearTimeout(timer)
    }, [])

    // --- Scenario 1: Component Timing ---
    const handleToggleImage = () => {
      setShowImage(!showImage)
      if (!showImage) {
        // Reset state
        setImageLoaded(false)
        trackAction("Scenario1_ToggleImage", "tap", { action: "show" })
      } else {
        trackAction("Scenario1_ToggleImage", "tap", { action: "hide" })
      }
    }

    // --- Scenario 2: Stuck Loading ---
    const handleStartStuckLoading = () => {
      setIsStuckLoading(true)
      trackAction("Scenario2_StartStuckLoading", "tap")

      // Start tracking - this will add "StuckProcess" to the loading_elements list
      // We INTENTIONALLY never call .success() or .error() to simulate a stuck state
      trackElementLoading("StuckProcess")

      // Reset after 10s just so the UI doesn't stay broken forever during testing
      // In a real stuck scenario, the user would likely leave the screen
      setTimeout(() => {
        // Note: We are NOT clearing the Datadog tracking here to simulate the stuck state persisting
        // if the user navigated away.
        setIsStuckLoading(false)
      }, 5000)
    }

    // --- Scenario 3: Slow Rendering ---
    const handleRenderHeavyList = () => {
      trackAction("Scenario3_RenderHeavyList", "tap")
      setShowHeavyList(true)
      // Generate 1000 items
      setHeavyListItems(Array.from({ length: 1000 }, (_, i) => i))
    }

    // --- Scenario 4: Handled Error ---
    const handleTriggerError = async () => {
      trackAction("Scenario4_TriggerError", "tap")
      setErrorResult(null)
      try {
        // Try to fetch a product that definitely doesn't exist
        await fetchProduct(999999)
      } catch (error) {
        // This error is automatically tracked by Datadog if configured,
        // but we can also manually track specific handled errors.
        setErrorResult(
          "Error caught and handled!" + (error instanceof Error ? error.message : "Unknown error"),
        )
      }
    }

    return (
      <Screen preset="scroll" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($header)}>
          <Text preset="heading" style={themed($title)}>
            Datadog RUM Scenarios
          </Text>
          <Text preset="default" size="sm" style={themed($subtitle)}>
            Run these scenarios to see specific data in your Datadog dashboard.
          </Text>
        </View>

        {/* Scenario 1 */}
        <Card
          style={themed($card)}
          HeadingComponent={
            <View style={themed($cardHeader)}>
              <Text preset="bold" size="md">
                ⏱️ Scenario 1: Component Timing
              </Text>
            </View>
          }
          ContentComponent={
            <View style={themed($cardContent)}>
              <Text size="xs" style={themed($scenarioDesc)}>
                Loads an image and tracks &quot;Scenario1_Image_mounted&quot; timing.
              </Text>
              <Button
                text={showImage ? "Hide Image" : "Show Tracked Image"}
                onPress={handleToggleImage}
                preset="reversed"
                style={themed($button)}
              />
              {showImage && (
                <TrackedLoading name="Scenario1_Image">
                  <View style={themed($imageContainer)}>
                    <Image
                      source={{ uri: "https://api.escuelajs.co/api/v1/files/1.jpg" }}
                      style={$scenarioImage}
                      resizeMode="cover"
                      onLoadEnd={() => setImageLoaded(true)}
                    />
                    {!imageLoaded && <ActivityIndicator style={themed($loader)} />}
                  </View>
                </TrackedLoading>
              )}
            </View>
          }
        />

        {/* Scenario 2 */}
        <Card
          style={themed($card)}
          HeadingComponent={
            <View style={themed($cardHeader)}>
              <Text preset="bold" size="md">
                📦 Scenario 2: Stuck Loading
              </Text>
            </View>
          }
          ContentComponent={
            <View style={themed($cardContent)}>
              <Text size="xs" style={themed($scenarioDesc)}>
                Starts a process that never finishes. Check Datadog for sessions with
                &apos;has_pending_loads: true&apos;.
              </Text>
              <Button
                text={isStuckLoading ? "Loading forever..." : "Start Stuck Process"}
                onPress={handleStartStuckLoading}
                disabled={isStuckLoading}
                preset={isStuckLoading ? "default" : "reversed"}
                style={themed($button)}
              />
              {isStuckLoading && <ActivityIndicator style={themed($loader)} />}
            </View>
          }
        />

        {/* Scenario 3 */}
        <Card
          style={themed($card)}
          HeadingComponent={
            <View style={themed($cardHeader)}>
              <Text preset="bold" size="md">
                🐌 Scenario 3: Slow Rendering
              </Text>
            </View>
          }
          ContentComponent={
            <View style={themed($cardContent)}>
              <Text size="xs" style={themed($scenarioDesc)}>
                Renders a heavy list using DatadogProfiler. Check &apos;HeavyList_rendered&apos;
                action duration.
              </Text>
              <Button
                text="Render Heavy List"
                onPress={handleRenderHeavyList}
                disabled={showHeavyList}
                preset="reversed"
                style={themed($button)}
              />
              {showHeavyList && (
                <DatadogProfiler name="HeavyList">
                  <View style={themed($heavyListContainer)}>
                    {heavyListItems.map((item) => (
                      <View key={item} style={themed($heavyItem)}>
                        <Text size="xxs">{item}</Text>
                      </View>
                    ))}
                  </View>
                </DatadogProfiler>
              )}
            </View>
          }
        />

        {/* Scenario 4 */}
        <Card
          style={themed($card)}
          HeadingComponent={
            <View style={themed($cardHeader)}>
              <Text preset="bold" size="md">
                ❌ Scenario 4: Handled Errors
              </Text>
            </View>
          }
          ContentComponent={
            <View style={themed($cardContent)}>
              <Text size="xs" style={themed($scenarioDesc)}>
                Triggers a 404 API error. Check &quot;Errors&quot; tab in Datadog.
              </Text>
              <Button
                text="Trigger 404 Error"
                onPress={handleTriggerError}
                preset="reversed"
                style={themed($button)}
              />
              {errorResult && <Text style={themed($errorText)}>{errorResult}</Text>}
            </View>
          }
        />
      </Screen>
    )
  }

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardHeader: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $scenarioDesc: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  color: colors.textDim,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $imageContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 200,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  marginTop: spacing.sm,
})

const $scenarioImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $loader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $heavyListContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  flexWrap: "wrap",
})

const $heavyItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 20,
  height: 20,
  backgroundColor: colors.palette.neutral300,
  margin: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $errorText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  color: colors.error,
  fontWeight: "bold",
})
