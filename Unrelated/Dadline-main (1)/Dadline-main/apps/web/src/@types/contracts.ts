export type ContractStatus = "draft" | "active" | "completed" | "expired" | "cancelled"

export type SignatureStatus = "pending" | "signed" | "removed"

export type ContractAttachment = {
  id: number
  attachmentId: number
  sortOrder: number
  originalName?: string | null
  mimeType?: string | null
  sizeBytes?: number | null
  url?: string | null
  createdAt?: string | null
}

export type ContractSignature = {
  id: number
  contractId: number
  userId?: number | null
  fullName?: string | null
  mobile?: string | null
  signatureStatus: SignatureStatus
  signatureStatusLabel: string
  activityStatusLabel?: string | null
  inviteSentAt?: string | null
  canResendInvitationAt?: string | null
  canResendInvitation?: boolean
  viewedAt?: string | null
  signatureId?: number | null
  signatureCode?: string | null
  signatureUrl?: string | null
  ipAddress?: string | null
  nationalId?: string | null
  birthDate?: string | null
  signedAt?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type Contract = {
  id: number
  uuid: string
  creatorId?: number | null
  creator?: {
    id?: number | null
    name?: string | null
    mobile?: string | null
  } | null
  title: string
  body?: string
  status: ContractStatus
  statusLabel: string
  trackingCode?: string | null
  pinCode?: string | null
  qrId?: number | null
  qrUrl?: string | null
  verificationUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  attachments?: ContractAttachment[]
  signatures?: ContractSignature[]
  snapshot?: {
    id: number
    bodyHash: string
    payloadHash: string
    hashAlgorithm: string
    createdAt?: string | null
  } | null
  aiAnalysis?: {
    id: number
    aiData: Record<string, unknown>
    aiContent?: string | null
  } | null
  currentUser?: {
    id?: number | null
    name?: string | null
    mobile?: string | null
    profile?: {
      avatarId?: number | null
      avatarUrl?: string | null
      signatureId?: number | null
      signatureUrl?: string | null
    } | null
    verification?: {
      verifiedLevel: number
      isLevelTwoVerified: boolean
      mobileVerified?: boolean
      nationalVerified?: boolean
      bankVerified?: boolean
    } | null
  } | null
}

export type PublicContractVerification = {
  trackingCode: string
  verificationUrl?: string | null
  qrUrl?: string | null
  title: string
  status: ContractStatus
  statusLabel: string
  creator?: {
    name?: string | null
  } | null
  createdAt?: string | null
  completedAt?: string | null
  hashAlgorithm: string
  bodyHash?: string | null
  currentBodyHash?: string | null
  payloadHash?: string | null
  hashMatchesCurrentBody: boolean
  snapshotCreatedAt?: string | null
  signatures: Array<{
    fullName?: string | null
    mobile?: string | null
    status: SignatureStatus
    statusLabel: string
    signedAt?: string | null
  }>
}

export type ContractPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type ContractPricingQuote = {
  baseAmount: number
  includedParties: number
  partiesCount: number
  extraParties: number
  extraPartyRate: number
  extraAmount: number
  totalAmount: number
  currency: string
  currencyLabel: string
}

export type ContractBasePricing = {
  baseAmount: number
  includedParties: number
  extraPartyRate: number
  currency: string
  currencyLabel: string
}

export type ContractAiPricing = {
  analysisAmount: number
  rewriteAmount: number
  currency: string
  currencyLabel: string
}

export type PublicContractPreview = {
  uuid: string
  title: string
  creator?: {
    name?: string | null
  } | null
  verified: boolean
  body?: string | null
  signatures: Array<{
    fullName?: string | null
    mobile?: string | null
    statusLabel?: string | null
  }>
  attachments: Array<{
    attachmentId: number
    originalName?: string | null
    mimeType?: string | null
    sizeBytes?: number | null
  }>
}

export type ContractListParams = {
  q?: string
  status?: ContractStatus | "all"
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

export type ContractFormValues = {
  title: string
  body: string
  attachments: Array<{
    id?: number
    attachmentId: number
  }>
  removedContractAttachmentIds?: number[]
  removedSignatureIds?: number[]
  signatures: Array<{
    id?: number
    fullName: string
    mobile: string
    userId?: number | null
  }>
}
