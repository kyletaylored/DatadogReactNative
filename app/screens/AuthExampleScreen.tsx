import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, type TextFieldAccessoryProps } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { fetchUserProfile, fetchUsers, login } from "@/services/api/platzi-api"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

interface AuthExampleScreenProps extends AppStackScreenProps<"AuthExample"> {}

export const AuthExampleScreen: FC<AuthExampleScreenProps> = function AuthExampleScreen(_props) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const { userProfile, loginWithProfile, logout: authLogout } = useAuth()

  const passwordInput = useRef<TextInput>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Track view loading with Datadog - view is ready when users are loaded
  useDatadogViewLoadingComplete(!isLoadingUsers)

  // Load prefilled credentials from navigation params or fetch first user
  useEffect(() => {
    const loadCredentials = async () => {
      // Check if credentials were passed from UsersList
      const params = _props.route.params
      if (params?.prefilledEmail && params?.prefilledPassword) {
        setEmail(params.prefilledEmail)
        setPassword(params.prefilledPassword)
        setIsLoadingUsers(false)
        return
      }

      // Otherwise, fetch first user as fallback
      try {
        const users = await fetchUsers()
        if (users.length > 0) {
          setEmail(users[0].email)
          setPassword(users[0].password)
        }
      } catch (err) {
        console.error("Error loading users:", err)
        // Set demo credentials as fallback
        setEmail("john@mail.com")
        setPassword("changeme")
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadCredentials()
  }, [_props.route.params])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Login
      const loginResponse = await login({ email, password })
      setAccessToken(loginResponse.access_token)

      // Step 2: Fetch profile
      const profile = await fetchUserProfile(loginResponse.access_token)
      
      // Step 3: Store user profile and track with Datadog
      loginWithProfile(loginResponse.access_token, profile)
    } catch (err: any) {
      if (err.statusCode === 401) {
        setError("Invalid credentials. Please try again.")
      } else if (err.statusCode === 403) {
        setError("Access forbidden. Insufficient permissions.")
      } else if (err.statusCode === 400) {
        setError("Bad request. Please check your input.")
      } else {
        setError(err.message || "Login failed. Please try again.")
      }
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setAccessToken(null)
    setError(null)
    authLogout()
  }

  const handleTestBadCredentials = () => {
    setEmail("invalid@example.com")
    setPassword("wrongpassword")
    setError(null)
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon={isPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
          />
        )
      },
    [isPasswordHidden, colors.palette.neutral800],
  )

  if (isLoadingUsers) {
    return (
      <Screen preset="scroll" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" />
          <Text style={themed($loadingText)}>Loading demo credentials...</Text>
        </View>
      </Screen>
    )
  }

  const userName = _props.route.params?.userName

  return (
    <Screen preset="scroll" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
      <View style={themed($header)}>
        {userName && (
          <Text preset="bold" size="md" style={themed($welcomeText)}>
            Login as {userName}
          </Text>
        )}
        <Text preset="default" size="sm" style={themed($subtitle)}>
          Demonstrates login flow with Datadog RUM tracking
        </Text>
      </View>

      {!userProfile ? (
        <>
          {/* Login Form */}
          <Card
            style={themed($card)}
            ContentComponent={
              <View style={themed($cardContent)}>
                <Text preset="bold" size="md" style={themed($cardTitle)}>
                  Login
                </Text>

                <TextField
                  value={email}
                  onChangeText={setEmail}
                  containerStyle={themed($textField)}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  label="Email"
                  placeholder="your@email.com"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                />

                <TextField
                  ref={passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  containerStyle={themed($textField)}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  secureTextEntry={isPasswordHidden}
                  label="Password"
                  placeholder="Enter password"
                  onSubmitEditing={handleLogin}
                  RightAccessory={PasswordRightAccessory}
                />

                {error && (
                  <Text style={themed($errorText)} size="sm">
                    ⚠️ {error}
                  </Text>
                )}

                <Button
                  text={isLoading ? "Logging in..." : "Login"}
                  onPress={handleLogin}
                  disabled={isLoading}
                  preset="reversed"
                  style={themed($loginButton)}
                  accessibilityLabel="Login Button"
                >
                  {isLoading && <ActivityIndicator color={colors.palette.neutral100} />}
                </Button>

                <View style={themed($divider)} />

                <Text preset="bold" size="xs" style={themed($testSectionTitle)}>
                  Test Error Handling
                </Text>
                <Button
                  text="Test Bad Credentials (401)"
                  onPress={handleTestBadCredentials}
                  preset="default"
                  style={themed($testButton)}
                  accessibilityLabel="Test Bad Credentials"
                />
              </View>
            }
          />

          {/* Info Card */}
          <Card
            style={themed($card)}
            ContentComponent={
              <View style={themed($cardContent)}>
                <Text preset="bold" size="sm" style={themed($infoTitle)}>
                  ℹ️ Demo Info
                </Text>
                <Text preset="default" size="xs" style={themed($infoText)}>
                  Pre-filled credentials are from the Platzi Fake Store API. You can modify them or
                  test with invalid credentials to see error handling.
                </Text>
                <Text preset="default" size="xs" style={themed($infoText)}>
                  • Valid: john@mail.com / changeme
                </Text>
                <Text preset="default" size="xs" style={themed($infoText)}>
                  • This screen tracks loading time with Datadog RUM
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <>
          {/* Profile Display */}
          <Card
            style={themed($card)}
            ContentComponent={
              <View style={themed($cardContent)}>
                <Text preset="bold" size="md" style={themed($cardTitle)}>
                  ✅ Login Successful
                </Text>

                <View style={themed($profileContainer)}>
                  {userProfile.avatar && (
                    <Image
                      source={{ uri: userProfile.avatar }}
                      style={$avatar}
                      resizeMode="cover"
                    />
                  )}

                  <View style={themed($profileInfo)}>
                    <Text preset="bold" size="lg">
                      {userProfile.name}
                    </Text>
                    <Text preset="default" size="sm" style={themed($profileEmail)}>
                      {userProfile.email}
                    </Text>
                    <View style={themed($roleBadge)}>
                      <Text preset="default" size="xs" style={themed($roleText)}>
                        {userProfile.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={themed($divider)} />

                <View style={themed($infoRow)}>
                  <Text preset="bold" size="sm">
                    User ID:
                  </Text>
                  <Text preset="default" size="sm" style={themed($infoValue)}>
                    {userProfile.id}
                  </Text>
                </View>

                <View style={themed($divider)} />

                <Text preset="bold" size="xs" style={themed($tokenTitle)}>
                  Access Token (truncated):
                </Text>
                <Text preset="default" size="xxs" style={themed($tokenText)} numberOfLines={2}>
                  {accessToken}
                </Text>

                <Button
                  text="Logout"
                  onPress={handleLogout}
                  preset="reversed"
                  style={themed($logoutButton)}
                  accessibilityLabel="Logout Button"
                />
              </View>
            }
          />
        </>
      )}
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $welcomeText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.tint,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $cardTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
})

const $loginButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $divider: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.md,
})

const $testSectionTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  color: colors.textDim,
})

const $testButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $infoTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $infoText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
  lineHeight: 18,
})

const $profileContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $avatar: ImageStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
}

const $profileInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.md,
})

const $profileEmail: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
})

const $roleBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.secondary100,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 4,
  alignSelf: "flex-start",
  marginTop: spacing.xs,
})

const $roleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "bold",
})

const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.xs,
})

const $infoValue: ThemedStyle<TextStyle> = () => ({
  flex: 1,
  textAlign: "right",
})

const $tokenTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $tokenText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontFamily: "monospace",
  backgroundColor: colors.palette.neutral200,
  padding: spacing.xs,
  borderRadius: 4,
  marginBottom: spacing.md,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

