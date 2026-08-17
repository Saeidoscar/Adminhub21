import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react"
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
  login: (email: string, password: string) => Promise<void>
  loginWithOtp: (phone: string, code: string) => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  fetchMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>(null as never)

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
      }
    }
  }, [])

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
      const { user: newUser, accessToken: token } = await registerApi(input)
      setTokens(token)
      setUser(newUser)
    },
    [setTokens],
  )

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setError(null)
      const { user: loggedInUser, accessToken: token } = await loginApi({
        email,
        password,
      })
      setTokens(token)
      setUser(loggedInUser)
    },
    [setTokens],
  )

  const handleSendOtp = useCallback(async (phone: string) => {
    setError(null)
    await sendOtpApi({ phone })
  }, [])

  const handleVerifyOtp = useCallback(
    async (phone: string, code: string) => {
      setError(null)
      const { user: otpUser, accessToken: token } = await verifyOtpApi({
        phone,
        code,
      })
      setTokens(token)
      setUser(otpUser)
    },
    [setTokens],
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
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
