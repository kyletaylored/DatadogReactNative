import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from "react"
import { useMMKVObject, useMMKVString } from "react-native-mmkv"

import type { UserProfile } from "@/services/api/platzi-api.types"
import { clearDatadogUser, setDatadogUser } from "@/utils/datadog"

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  authEmail?: string
  userProfile?: UserProfile
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  setUserProfile: (profile?: UserProfile) => void
  loginWithProfile: (token: string, profile: UserProfile) => void
  logout: () => void
  validationError: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken")
  const [authEmail, setAuthEmail] = useMMKVString("AuthProvider.authEmail")
  const [userProfile, setUserProfile] = useMMKVObject<UserProfile>("AuthProvider.userProfile")

  // Set Datadog user info on mount if user is logged in
  useEffect(() => {
    if (userProfile) {
      setDatadogUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        extraInfo: {
          role: userProfile.role,
        },
      })
    }
  }, []) // Run only on mount

  const loginWithProfile = useCallback((token: string, profile: UserProfile) => {
    setAuthToken(token)
    setAuthEmail(profile.email)
    setUserProfile(profile)
    
    // Track user in Datadog
    setDatadogUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      extraInfo: {
        role: profile.role,
      },
    })
  }, [setAuthToken, setAuthEmail, setUserProfile])

  const logout = useCallback(() => {
    setAuthToken(undefined)
    setAuthEmail("")
    setUserProfile(undefined)
    
    // Clear user info from Datadog
    clearDatadogUser()
  }, [setAuthEmail, setAuthToken, setUserProfile])

  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "can't be blank"
    if (authEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
    return ""
  }, [authEmail])

  const value = {
    isAuthenticated: !!authToken,
    authToken,
    authEmail,
    userProfile,
    setAuthToken,
    setAuthEmail,
    setUserProfile,
    loginWithProfile,
    logout,
    validationError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
