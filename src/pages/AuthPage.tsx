import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { useAuth } from "../contexts/AuthContext"
import {
  loginSchema,
  registerSchema,
  otpSchema,
  type LoginInput,
  type RegisterInput,
  type OtpInput,
} from "../lib/validation"

export type Role = "employer" | "admin" | "super_admin"

interface AuthPageProps {
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  dir: "ltr" | "rtl"
  setLang: (lang: Lang) => void
}

export default function AuthPage({
  lang,
  tr,
  dir,
  setLang,
}: AuthPageProps) {
  const { user, login, register, sendOtp, loginWithOtp, isLoading } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<"login" | "register">("login")
  const [authMode, setAuthMode] = useState<"email" | "phone">("email")
  const [role, setRole] = useState<Role>("employer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard")
    }
  }, [user, isLoading, navigate])

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setPhone("")
    setOtpCode("")
    setOtpSent(false)
    setLocalError(null)
    setErrors({})
  }

  const handleEmailLogin = async () => {
    setLocalError(null)
    setErrors({})
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setIsSubmitting(true)
    try {
      await login(result.data.email, result.data.password)
      navigate("/dashboard")
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailRegister = async () => {
    setLocalError(null)
    setErrors({})
    const result = registerSchema.safeParse({
      email,
      password,
      nameEn: name,
      nameFa: name,
      phone,
      role,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setIsSubmitting(true)
    try {
      await register({
        email: result.data.email,
        password: result.data.password,
        role: result.data.role,
        nameEn: result.data.nameEn,
        nameFa: result.data.nameFa,
        phone: result.data.phone,
      })
      navigate("/dashboard")
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendCode = async () => {
    setLocalError(null)
    setErrors({})
    const result = otpSchema.safeParse({ phone, code: "" })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setIsSubmitting(true)
    try {
      await sendOtp(result.data.phone)
      setOtpSent(true)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLocalError(null)
    setErrors({})
    const result = otpSchema.safeParse({ phone, code: otpCode })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setIsSubmitting(true)
    try {
      const user = await loginWithOtp(result.data.phone, result.data.code)
      navigate("/dashboard")
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "OTP verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Left panel — hero */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
              <Icon name="bot" size={20} className="text-navy-900" />
            </div>
            <span className="text-xl font-bold">{tr.brand}</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            {lang === "fa"
              ? "بازار کار متخصصان دیجیتال"
              : "The Digital Admin Marketplace"}
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">{tr.tagline}</p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            {
              icon: "shield",
              textEn: "Contract protection & substitute insurance",
              textFa: "حفاظت قرارداد و بیمه جایگزینی",
            },
            {
              icon: "check",
              textEn: "100% verified professionals",
              textFa: "۱۰۰٪ متخصصان تأییدشده",
            },
            {
              icon: "bot",
              textEn: "AI-powered matching & contract generation",
              textFa: "تطابق هوشمند و تولید قرارداد با هوش مصنوعی",
            },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={16} className="text-white" />
              </div>
              <span className="text-blue-100 text-sm">
                {lang === "fa" ? item.textFa : item.textEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-[#f2f5fa]">
        {/* Language switcher */}
        <div className="absolute top-6 end-6">
          <button
            onClick={() => setLang(lang === "fa" ? "en" : "fa")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-sm font-medium text-[#1e3a5f] hover:bg-[#f2f5fa] transition-colors shadow-sm"
          >
            <span className="text-base">{lang === "fa" ? "🇬🇧" : "🇮🇷"}</span>
            <span>{lang === "fa" ? "English" : "فارسی"}</span>
          </button>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Logo on mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Icon name="bot" size={16} className="text-amber-400" />
            </div>
            <span className="text-lg font-bold text-[#1e3a5f]">{tr.brand}</span>
          </div>

          {/* Auth method tabs */}
          <div className="flex rounded-xl bg-white border border-[#e2e8f0] p-1 mb-6 shadow-sm">
            {(["email", "phone"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setAuthMode(mode)
                  resetForm()
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all btn-press ${
                  authMode === mode
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "text-[#64748b] hover:text-[#1e3a5f]"
                }`}
              >
                {mode === "email"
                  ? (lang === "fa" ? "ایمیل" : "Email")
                  : (lang === "fa" ? "تلفن" : "Phone")}
              </button>
            ))}
          </div>

          {/* Email/Password tabs */}
          {authMode === "email" && (
            <>
              <div className="flex rounded-xl bg-white border border-[#e2e8f0] p-1 mb-8 shadow-sm">
                {(["login", "register"] as const).map((t2) => (
                  <button
                    key={t2}
                    onClick={() => {
                      setTab(t2)
                      resetForm()
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all btn-press ${
                      tab === t2
                        ? "bg-[#1e3a5f] text-white shadow-sm"
                        : "text-[#64748b] hover:text-[#1e3a5f]"
                    }`}
                  >
                    {t2 === "login" ? tr.auth.login : tr.auth.register}
                  </button>
                ))}
              </div>

              <div className="fade-in">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-1">
                  {tab === "login" ? tr.auth.loginTitle : tr.auth.registerTitle}
                </h2>
                <p className="text-[#64748b] text-sm mb-8">
                  {tab === "login" ? tr.auth.loginSub : tr.auth.registerSub}
                </p>

                {/* Role selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#0f172a] mb-3">
                    {tr.auth.role}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["employer", "admin"] as Role[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`p-4 rounded-xl border-2 text-start transition-all btn-press ${
                          role === r
                            ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                            : "border-[#e2e8f0] bg-white hover:border-[#1e3a5f]/40"
                        }`}
                      >
                        <div
                          className={`text-sm font-bold mb-1 ${
                            role === r ? "text-[#1e3a5f]" : "text-[#0f172a]"
                          }`}
                        >
                          {r === "employer" ? tr.auth.employer : tr.auth.admin}
                        </div>
                        <div className="text-xs text-[#64748b] leading-snug">
                          {r === "employer"
                            ? tr.auth.employerDesc
                            : tr.auth.adminDesc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4 mb-6">
                  {tab === "register" && (
                    <div>
                      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                        {tr.auth.name}
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={tr.auth.namePh}
                        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      />
                      {errors.nameEn && (
                        <p className="text-xs text-rose-600 mt-1">{errors.nameEn}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                      {tr.auth.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tr.auth.emailPh}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      dir="ltr"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-[#0f172a]">
                        {tr.auth.password}
                      </label>
                      {tab === "login" && (
                        <button className="text-xs text-[#1e3a5f] hover:underline">
                          {tr.auth.forgotPw}
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tr.auth.passwordPh}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      dir="ltr"
                    />
                    {errors.password && (
                      <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                {displayError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {displayError}
                  </div>
                )}

                <button
                  onClick={tab === "login" ? handleEmailLogin : handleEmailRegister}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#122435] transition-colors shadow-md btn-press mb-4 disabled:opacity-60"
                >
                  {isSubmitting
                    ? (lang === "fa" ? "در حال پردازش..." : "Processing...")
                    : (tab === "login" ? tr.auth.login : tr.auth.register)}
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm hover:bg-[#f2f5fa] transition-colors btn-press"
                >
                  {tr.auth.demo} →
                </button>

                <p className="text-center text-sm text-[#64748b] mt-6">
                  {tab === "login" ? tr.auth.noAccount : tr.auth.haveAccount}{" "}
                  <button
                    onClick={() => {
                      setTab(tab === "login" ? "register" : "login")
                      resetForm()
                    }}
                    className="text-[#1e3a5f] font-semibold hover:underline"
                  >
                    {tab === "login" ? tr.auth.register : tr.auth.login}
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Phone / OTP tab */}
          {authMode === "phone" && (
            <div className="fade-in">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-1">
                {lang === "fa" ? "ورود با تلفن همراه" : "Phone Login"}
              </h2>
              <p className="text-[#64748b] text-sm mb-8">
                {lang === "fa"
                  ? "کد یکبار مصرف به شماره شما ارسال می‌شود"
                  : "We'll send a one-time code to your phone"}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {lang === "fa" ? "شماره تلفن" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={lang === "fa" ? "۰۹۱۲۳۴۵۶۷۸۹" : "+98 912 345 6789"}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                    dir="ltr"
                    disabled={otpSent}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                      {lang === "fa" ? "کد تأیید" : "Verification Code"}
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder={lang === "fa" ? "کد ۶ رقمی" : "6-digit code"}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      dir="ltr"
                    />
                    {errors.code && (
                      <p className="text-xs text-rose-600 mt-1">{errors.code}</p>
                    )}
                  </div>
                )}

                {displayError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {displayError}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {!otpSent ? (
                  <button
                    onClick={handleSendCode}
                    disabled={isSubmitting || !phone}
                    className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#122435] transition-colors shadow-md btn-press disabled:opacity-60"
                  >
                    {isSubmitting
                      ? (lang === "fa" ? "در حال ارسال..." : "Sending...")
                      : (lang === "fa" ? "ارسال کد" : "Send Code")}
                  </button>
                ) : (
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#122435] transition-colors shadow-md btn-press disabled:opacity-60"
                  >
                    {isSubmitting
                      ? (lang === "fa" ? "در حال تأیید..." : "Verifying...")
                      : (lang === "fa" ? "تأیید کد" : "Verify Code")}
                  </button>
                )}

                {otpSent && (
                  <button
                    onClick={() => {
                      setOtpSent(false)
                      setOtpCode("")
                      setLocalError(null)
                    }}
                    className="w-full py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm hover:bg-[#f2f5fa] transition-colors btn-press"
                  >
                    {lang === "fa" ? "تغییر شماره تلفن" : "Change Phone Number"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
