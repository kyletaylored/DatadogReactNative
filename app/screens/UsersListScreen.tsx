import { FC, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { fetchUsers } from "@/services/api/platzi-api"
import type { User } from "@/services/api/platzi-api.types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { trackAction, trackElementLoading } from "@/utils/datadog"
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

interface UsersListScreenProps extends AppStackScreenProps<"UsersList"> {}

export const UsersListScreen: FC<UsersListScreenProps> = function UsersListScreen({ navigation }) {
  const { themed } = useAppTheme()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track view loading with Datadog
  useDatadogViewLoadingComplete(!isLoading && !error)

  const loadUsers = async () => {
    const loadingTracker = trackElementLoading("FetchUsersList")
    try {
      setIsLoading(true)
      setError(null)

      const data = await fetchUsers()
      setUsers(data)
      loadingTracker.success({ user_count: data.length })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load users"
      setError(errorMessage)
      loadingTracker.error(err)
      console.error("Error loading users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleUserPress = (user: User) => {
    trackAction("UserSelectedForLogin", "tap", { user_id: user.id, user_role: user.role })
    navigation.navigate("AuthExample", {
      prefilledEmail: user.email,
      prefilledPassword: user.password,
      userName: user.name,
    })
  }

  const renderUser = ({ item }: { item: User }) => (
    <Pressable
      onPress={() => handleUserPress(item)}
      accessibilityLabel={`Login as ${item.name}`}
    >
      <Card
        style={themed($card)}
        HeadingComponent={
          <View style={themed($cardHeader)}>
            {item.avatar && (
              <Image source={{ uri: item.avatar }} style={$avatar} resizeMode="cover" />
            )}
          </View>
        }
        ContentComponent={
          <View style={themed($cardContent)}>
            <Text preset="bold" size="md" numberOfLines={1}>
              {item.name}
            </Text>
            <Text preset="default" size="sm" style={themed($email)}>
              {item.email}
            </Text>
            <View style={themed($row)}>
              <View style={themed($roleBadge)}>
                <Text preset="default" size="xs" style={themed($roleText)}>
                  {item.role.toUpperCase()}
                </Text>
              </View>
              <Text preset="default" size="xs" style={themed($userId)}>
                ID: {item.id}
              </Text>
            </View>
            <Text preset="default" size="xs" style={themed($tapHint)}>
              👆 Tap to login as this user
            </Text>
          </View>
        }
      />
    </Pressable>
  )

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" />
          <Text style={themed($loadingText)}>Loading users...</Text>
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>Error: {error}</Text>
          <Button
            text="Retry"
            onPress={loadUsers}
            style={themed($retryButton)}
            accessibilityLabel="Retry Loading Users"
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
      <View style={themed($header)}>
        <Text preset="default" size="sm" style={themed($subtitle)}>
          {users.length} users • Select one to pre-fill login credentials
        </Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={themed($listContent)}
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  flex: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardHeader: ThemedStyle<ViewStyle> = () => ({
  padding: 0,
})

const $avatar: ImageStyle = {
  width: "100%",
  height: 120,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
}

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $email: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
  marginBottom: spacing.sm,
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
})

const $roleBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.secondary100,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 4,
})

const $roleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "bold",
})

const $userId: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $tapHint: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.accent500,
  fontStyle: "italic",
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

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = () => ({
  minWidth: 120,
})

