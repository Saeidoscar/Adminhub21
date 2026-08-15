import type {
  ProviderProduct,
  ProviderStory,
  ProviderType,
} from "@/@types/vendors"

export type ProviderProfileKind = ProviderType

export type ProviderResource = ProviderProduct & ProviderStory

export type ProviderProfileLabels = {
  singular: string
  verified: string
  about: string
  fallbackRole: string
}

export const PROVIDER_PROFILE_LABELS: Record<ProviderProfileKind, ProviderProfileLabels> =
  {
    lawyer: {
      singular: "وکیل",
      verified: "وکیل تأییدشده دادلاین",
      about: "درباره وکیل",
      fallbackRole: "وکیل پایه یک دادگستری",
    },
    expert: {
      singular: "کارشناس",
      verified: "کارشناس تأییدشده دادلاین",
      about: "درباره کارشناس",
      fallbackRole: "کارشناس حقوقی",
    },
  }
