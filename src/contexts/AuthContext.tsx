import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react"
import type { SafeUser } from "@adminhub/shared"
import {
  getAuthToken,
  setAuthToken,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  sendOtp as sendOtpApi,
  verifyOtp as verifyOtpApi,
  getMe as getMeApi,
} from "../lib/api"
import {
  DEMO_ROLE_KEY,
  DEMO_SIGNED_OUT_KEY,
  DEMO_TOKEN,
  DEMO_USERS,
  isDemoMode,
  readStoredDemoRole,
  type DemoRole,
} from "../lib/demo-mode"

export interface AuthContextValue {
  user: SafeUser | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  register: (input: {
    email: string
    password: string
    role: "employer" | "admin"
    nameEn: string
    nameFa: string
    phone?: string
  }) => Promise<void>
  /** `role` only matters in demo mode, where it picks the persona. */
  login: (email: string, password: string, role?: DemoRole) => Promise<void>
  loginWithOtp: (phone: string, code: string) => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  fetchMe: () => Promise<void>
  /** Signs in with a demo persona (only available in demo mode). */
  loginDemo: (role?: DemoRole) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  isLoading: true,
  error: null,
  register: async () => {},
  login: async () => {},
  loginWithOtp: async () => {},
  sendOtp: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
  clearError: () => {},
  fetchMe: async () => {},
  loginDemo: () => {},
})

/**
 * `fetch` rejects with a bare "Failed to fetch" when the server is down, the URL
 * is wrong or the browser blocks it — a message that tells the user nothing and
 * suggests a credential problem. Say what actually happened instead.
 */
function readableAuthError(err: unknown): Error {
  if (err instanceof TypeError) {
    return new Error(
      "Can't reach the server. Check that it is running and try again — this is a connection problem, not a wrong password.",
    )
  }

  return err instanceof Error ? err : new Error("Sign-in failed")
}

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setTokens = useCallback((token: string) => {
    setAccessTokenState(token)
    setAuthToken(token)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // best-effort logout
    } finally {
      setUser(null)
      setAccessTokenState(null)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("adminhub_token")
        if (isDemoMode) {
          window.localStorage.setItem(DEMO_SIGNED_OUT_KEY, "1")
        }
      }
    }
  }, [])

  const handleDemoLogin = useCallback(
    (role: DemoRole = "employer") => {
      if (!isDemoMode) return

      const demoUser = DEMO_USERS[role] ?? DEMO_USERS.employer

      if (typeof window !== "undefined") {
        window.localStorage.setItem(DEMO_ROLE_KEY, role)
        window.localStorage.removeItem(DEMO_SIGNED_OUT_KEY)
      }

      setTokens(DEMO_TOKEN)
      setUser(demoUser)
      setIsLoading(false)
      setError(null)
    },
    [setTokens],
  )

  const handleRefresh = useCallback(async () => {
    try {
      const me = await getMeApi()
      setUser(me)
    } catch {
      setUser(null)
      setAccessTokenState(null)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("adminhub_token")
      }
    }
  }, [])

  const handleRegister = useCallback(
    async (input: {
      email: string
      password: string
      role: "employer" | "admin"
      nameEn: string
      nameFa: string
      phone?: string
    }) => {
      setError(null)

      // A demo session is local. Calling the demo API here only added a way to
      // fail — "Failed to fetch" when the local server was slow, restarting, or
      // simply not there yet — for a sign-in that hands back a fixed persona.
      if (isDemoMode) {
        handleDemoLogin(input.role === "admin" ? "admin" : "employer")
        return
      }

      try {
        const { user: newUser, accessToken: token } = await registerApi(input)
        setTokens(token)
        setUser(newUser)
      } catch (err) {
        throw readableAuthError(err)
      }
    },
    [handleDemoLogin, setTokens],
  )

  const handleLogin = useCallback(
    async (email: string, password: string, role?: DemoRole) => {
      setError(null)

      if (isDemoMode) {
        handleDemoLogin(role ?? readStoredDemoRole())
        return
      }

      try {
        const { user: loggedInUser, accessToken: token } = await loginApi({
          email,
          password,
        })
        setTokens(token)
        setUser(loggedInUser)
      } catch (err) {
        throw readableAuthError(err)
      }
    },
    [handleDemoLogin, setTokens],
  )

  const handleSendOtp = useCallback(async (phone: string) => {
    setError(null)
    if (isDemoMode) return
    await sendOtpApi({ phone })
  }, [])

  const handleVerifyOtp = useCallback(
    async (phone: string, code: string) => {
      setError(null)

      if (isDemoMode) {
        handleDemoLogin(readStoredDemoRole())
        return
      }

      const { user: otpUser, accessToken: token } = await verifyOtpApi({
        phone,
        code,
      })
      setTokens(token)
      setUser(otpUser)
    },
    [handleDemoLogin, setTokens],
  )

  const handleFetchMe = useCallback(async () => {
    setError(null)
    try {
      const me = await getMeApi()
      setUser(me)
    } catch (err) {
      setUser(null)
      setAccessTokenState(null)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("adminhub_token")
      }
      throw err
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (isDemoMode) {
        const signedOut =
          typeof window !== "undefined" && window.localStorage.getItem(DEMO_SIGNED_OUT_KEY) === "1"

        if (signedOut) {
          if (!cancelled) setIsLoading(false)
          return
        }

        const role = readStoredDemoRole()
        const demoUser = DEMO_USERS[role] ?? DEMO_USERS.employer

        if (!cancelled) {
          setTokens(DEMO_TOKEN)
          setUser(demoUser)
          setIsLoading(false)
        }
        return
      }

      const token = getAuthToken()
      if (!token) {
        if (!cancelled) {
          setIsLoading(false)
        }
        return
      }

      try {
        const me = await getMeApi()
        if (!cancelled) {
          setUser(me)
          setAccessTokenState(token)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setAccessTokenState(null)
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("adminhub_token")
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const value: AuthContextValue = {
    user,
    accessToken,
    isLoading,
    error,
    register: handleRegister,
    login: handleLogin,
    loginWithOtp: handleVerifyOtp,
    sendOtp: handleSendOtp,
    logout: handleLogout,
    refreshToken: handleRefresh,
    clearError,
    fetchMe: handleFetchMe,
    loginDemo: handleDemoLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
