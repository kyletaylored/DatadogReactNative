import { FC } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { DemoTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const datadogLogo = require("@assets/images/logo.png")

export const DemoExamplesScreen: FC<DemoTabScreenProps<"DemoExamples">> =
  function DemoExamplesScreen({ navigation }) {
    const { themed } = useAppTheme()

    function goToProducts() {
      navigation.navigate("ProductsList")
    }

    function goToUsers() {
      navigation.navigate("UsersList")
    }

    function goToAuth() {
      navigation.navigate("AuthExample", {})
    }

    function goToWelcome() {
      navigation.navigate("Welcome")
    }

    return (
      <Screen preset="scroll" contentContainerStyle={themed($container)} safeAreaEdges={["top"]}>
        <View style={themed($header)}>
          <Image style={$logo} source={datadogLogo} resizeMode="contain" />
          <Text preset="heading" style={themed($title)}>
            Datadog RUM Examples
          </Text>
          <Text preset="default" size="md" style={themed($description)}>
            These screens demonstrate real-world data loading patterns with Datadog RUM view
            tracking using the Platzi Fake Store API.
          </Text>
        </View>

        <View style={themed($section)}>
          <Text preset="bold" size="lg" style={themed($sectionTitle)}>
            🛍️ E-Commerce Examples
          </Text>

          <Button
            text="Products List (Pagination)"
            onPress={goToProducts}
            preset="reversed"
            style={themed($button)}
          />
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Paginated product listing with infinite scroll
          </Text>
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Pull-to-refresh functionality
          </Text>
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Tap products to view details
          </Text>
          <Text preset="default" size="sm" style={themed($lastButtonDescription)}>
            • Tracks view loading time from API call to render
          </Text>
        </View>

        <View style={themed($section)}>
          <Text preset="bold" size="lg" style={themed($sectionTitle)}>
            🔐 Authentication Examples
          </Text>

          <Button
            text="Browse Users"
            onPress={goToUsers}
            preset="reversed"
            style={themed($button)}
          />
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Fetches and displays all users
          </Text>
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Tap any user to pre-fill login credentials
          </Text>
          <Text preset="default" size="sm" style={themed($lastButtonDescription)}>
            • Demonstrates list-to-detail navigation flow
          </Text>

          <Button
            text="Direct Login (Default User)"
            onPress={goToAuth}
            preset="default"
            style={themed($button)}
          />
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Pre-filled with first user's credentials
          </Text>
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Two-step auth flow (login → profile)
          </Text>
          <Text preset="default" size="sm" style={themed($buttonDescription)}>
            • Error handling for invalid credentials
          </Text>
          <Text preset="default" size="sm" style={themed($lastButtonDescription)}>
            • Test 401 errors with bad credentials button
          </Text>
        </View>

        <View style={themed($divider)} />

        <View style={themed($infoSection)}>
          <Text preset="bold" size="md" style={themed($infoTitle)}>
            ℹ️ About These Examples
          </Text>
          <Text preset="default" size="sm" style={themed($infoText)}>
            All examples use the Platzi Fake Store API to demonstrate realistic loading patterns
            with proper loading states, error handling, and Datadog RUM integration.
          </Text>
          <Text preset="default" size="sm" style={themed($infoText)}>
            View loading times are tracked automatically and sent to Datadog for analysis.
          </Text>
        </View>

        <Button
          text="← Back to Welcome"
          onPress={goToWelcome}
          preset="default"
          style={themed($backButton)}
        />
      </Screen>
    )
  }

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingTop: spacing.xl,
  paddingBottom: spacing.lg,
})

const $logo: ImageStyle = {
  width: 80,
  height: 80,
  marginBottom: 16,
}

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $description: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  color: colors.textDim,
  lineHeight: 22,
  marginBottom: spacing.md,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $buttonDescription: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginLeft: spacing.md,
  marginBottom: spacing.xxs,
  color: colors.textDim,
  lineHeight: 18,
})

const $lastButtonDescription: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginLeft: spacing.md,
  marginBottom: spacing.xs,
  color: colors.textDim,
  lineHeight: 18,
})

const $divider: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.xl,
})

const $infoSection: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.md,
  borderRadius: 8,
  marginBottom: spacing.lg,
})

const $infoTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $infoText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  color: colors.textDim,
  lineHeight: 20,
  marginBottom: spacing.xs,
})

const $backButton: ThemedStyle<ViewStyle> = () => ({
  marginTop: 8,
})

