export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  activeNavTranslation: boolean
}

const appConfig: AppConfig = {
  apiPrefix: "/api",
  authenticatedEntryPath: "/home",
  unAuthenticatedEntryPath: "/sign-in",
  locale: "fa",
  activeNavTranslation: false,
}

export default appConfig
