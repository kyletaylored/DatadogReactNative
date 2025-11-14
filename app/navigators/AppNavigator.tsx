/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { useRef } from "react"
import { DdRum } from "@datadog/mobile-react-native"
import { NavigationContainer } from "@react-navigation/native"
import type { NavigationState } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { AuthExampleScreen } from "@/screens/AuthExampleScreen"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { LoginScreen } from "@/screens/LoginScreen"
import { ProductDetailScreen } from "@/screens/ProductDetailScreen"
import { ProductsListScreen } from "@/screens/ProductsListScreen"
import { UsersListScreen } from "@/screens/UsersListScreen"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { useAppTheme } from "@/theme/context"

import { DemoNavigator } from "./DemoNavigator"
import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const { isAuthenticated } = useAuth()

  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={isAuthenticated ? "Welcome" : "Login"}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />

          <Stack.Screen name="Demo" component={DemoNavigator} />

          <Stack.Screen
            name="ProductsList"
            component={ProductsListScreen}
            options={{
              headerShown: true,
              title: "Products",
              headerBackTitle: "Back",
            }}
          />

          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{
              headerShown: true,
              title: "Product Details",
              headerBackTitle: "Products",
            }}
          />

          <Stack.Screen
            name="UsersList"
            component={UsersListScreen}
            options={{
              headerShown: true,
              title: "Users",
              headerBackTitle: "Back",
            }}
          />

          <Stack.Screen
            name="AuthExample"
            component={AuthExampleScreen}
            options={{
              headerShown: true,
              title: "Auth Example",
              headerBackTitle: "Back",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}

      {/** 🔥 Your screens go here */}
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  const routeNameRef = useRef<string | undefined>(undefined)
  const isInitialMount = useRef(true)

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  // Get the current route name from navigation state
  const getActiveRouteName = (state: NavigationState | undefined): string | undefined => {
    if (!state) return undefined

    const route = state.routes[state.index]

    // Dive into nested navigators
    if (route.state) {
      return getActiveRouteName(route.state as NavigationState)
    }

    return route.name
  }

  // Track navigation changes for Datadog RUM
  const handleNavigationStateChange = (state: NavigationState | undefined) => {
    // Call the original onStateChange if provided
    props.onStateChange?.(state)

    const currentRouteName = getActiveRouteName(state)

    // Skip initial mount to avoid tracking app initialization
    if (isInitialMount.current) {
      isInitialMount.current = false
      routeNameRef.current = currentRouteName
      return
    }

    // If route changed, mark the view as loaded
    if (currentRouteName && currentRouteName !== routeNameRef.current) {
      try {
        console.log(`[Datadog] View loaded: ${currentRouteName}`)
        DdRum.addViewLoadingTime(true)
      } catch (error) {
        console.error("[Datadog] Error tracking view loading time:", error)
      }

      routeNameRef.current = currentRouteName
    }
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      {...props}
      onStateChange={handleNavigationStateChange}
    >
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
