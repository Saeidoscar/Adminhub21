import { z } from "zod"

const nullableDate = z.string().nullable().optional()

export const contractAttachmentSchema = z.object({
  id: z.number(),
  attachmentId: z.number(),
  sortOrder: z.number(),
  originalName: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().nullable().optional(),
  url: z.string().nullable().optional(),
  createdAt: nullableDate,
})

export const contractSignatureSchema = z.object({
  id: z.number(),
  contractId: z.number(),
  userId: z.number().nullable().optional(),
  fullName: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  signatureStatus: z.enum(["pending", "signed", "removed"]),
  signatureStatusLabel: z.string(),
  activityStatusLabel: z.string().nullable().optional(),
  inviteSentAt: nullableDate,
  canResendInvitationAt: nullableDate,
  canResendInvitation: z.boolean().optional(),
  viewedAt: nullableDate,
  signatureId: z.number().nullable().optional(),
  signatureCode: z.string().nullable().optional(),
  signatureUrl: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  signedAt: nullableDate,
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: nullableDate,
  updatedAt: nullableDate,
})

export const contractSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  creatorId: z.number().nullable().optional(),
  creator: z
    .object({
      id: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      mobile: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  title: z.string(),
  body: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "expired", "cancelled"]),
  statusLabel: z.string(),
  trackingCode: z.string().nullable().optional(),
  pinCode: z.string().nullable().optional(),
  qrId: z.number().nullable().optional(),
  qrUrl: z.string().nullable().optional(),
  verificationUrl: z.string().nullable().optional(),
  createdAt: nullableDate,
  updatedAt: nullableDate,
  attachments: z.array(contractAttachmentSchema).optional(),
  signatures: z.array(contractSignatureSchema).optional(),
  snapshot: z
    .object({
      id: z.number(),
      bodyHash: z.string(),
      payloadHash: z.string(),
      hashAlgorithm: z.string(),
      createdAt: nullableDate,
    })
    .nullable()
    .optional(),
  aiAnalysis: z
    .object({
      id: z.number(),
      aiData: z.record(z.string(), z.unknown()),
      aiContent: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  currentUser: z
    .object({
      id: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      mobile: z.string().nullable().optional(),
      profile: z
        .object({
          avatarId: z.number().nullable().optional(),
          avatarUrl: z.string().nullable().optional(),
          signatureId: z.number().nullable().optional(),
          signatureUrl: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
      verification: z
        .object({
          verifiedLevel: z.number(),
          isLevelTwoVerified: z.boolean(),
          mobileVerified: z.boolean().optional(),
          nationalVerified: z.boolean().optional(),
          bankVerified: z.boolean().optional(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
})

export const contractResponseSchema = z.object({
  data: contractSchema,
})

export const contractPaymentResponseSchema = z.object({
  data: z.object({
    status: z.string(),
    requiresGateway: z.boolean(),
    paymentUrl: z.string().nullable(),
    purchaseIntentId: z.number().nullable().optional(),
    purchaseIntentUuid: z.string().nullable().optional(),
    paymentId: z.number().nullable().optional(),
    gateway: z.string().nullable().optional(),
    gatewayToken: z.string().nullable().optional(),
    contract: contractSchema.nullable().optional(),
  }),
})

export const contractAiPaymentResponseSchema = z.object({
  data: z.object({
    status: z.string(),
    requiresGateway: z.boolean(),
    paymentUrl: z.string().nullable(),
    purchaseIntentId: z.number().nullable().optional(),
    purchaseIntentUuid: z.string().nullable().optional(),
    paymentId: z.number().nullable().optional(),
    gateway: z.string().nullable().optional(),
    gatewayToken: z.string().nullable().optional(),
    analysis: z
      .object({
        id: z.number(),
        aiData: z.record(z.string(), z.unknown()).optional(),
        aiContent: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
})

export const publicContractVerificationSchema = z.object({
  trackingCode: z.string(),
  verificationUrl: z.string().nullable().optional(),
  qrUrl: z.string().nullable().optional(),
  title: z.string(),
  status: z.enum(["draft", "active", "completed", "expired", "cancelled"]),
  statusLabel: z.string(),
  creator: z
    .object({
      name: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  createdAt: nullableDate,
  completedAt: nullableDate,
  hashAlgorithm: z.string(),
  bodyHash: z.string().nullable().optional(),
  currentBodyHash: z.string().nullable().optional(),
  payloadHash: z.string().nullable().optional(),
  hashMatchesCurrentBody: z.boolean(),
  snapshotCreatedAt: nullableDate,
  signatures: z.array(
    z.object({
      fullName: z.string().nullable().optional(),
      mobile: z.string().nullable().optional(),
      status: z.enum(["pending", "signed", "removed"]),
      statusLabel: z.string(),
      signedAt: nullableDate,
    }),
  ),
})

export const publicContractVerificationResponseSchema = z.object({
  data: publicContractVerificationSchema,
})

export const contractListResponseSchema = z.object({
  data: z.array(contractSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
})

export const genericMessageSchema = z.object({
  message: z.string().optional(),
})

export const contractPricingResponseSchema = z.object({
  data: z.object({
    base_amount: z.number(),
    included_parties: z.number(),
    parties_count: z.number(),
    extra_parties: z.number(),
    extra_party_rate: z.number(),
    extra_amount: z.number(),
    total_amount: z.number(),
    currency: z.string(),
    currency_label: z.string(),
  }),
})

export const contractBasePricingResponseSchema = z.object({
  data: z.object({
    base_amount: z.number(),
    included_parties: z.number(),
    extra_party_rate: z.number(),
    currency: z.string(),
    currency_label: z.string(),
  }),
})

export const contractAiPricingResponseSchema = z.object({
  data: z.object({
    analysis_amount: z.number(),
    rewrite_amount: z.number(),
    currency: z.string(),
    currency_label: z.string(),
  }),
})

export const publicContractPreviewResponseSchema = z.object({
  data: z.object({
    uuid: z.string(),
    title: z.string(),
    creator: z
      .object({
        name: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    verified: z.boolean(),
    body: z.string().nullable().optional(),
    signatures: z.array(
      z.object({
        fullName: z.string().nullable().optional(),
        mobile: z.string().nullable().optional(),
        statusLabel: z.string().nullable().optional(),
      }),
    ),
    attachments: z.array(
      z.object({
        attachmentId: z.number(),
        originalName: z.string().nullable().optional(),
        mimeType: z.string().nullable().optional(),
        sizeBytes: z.number().nullable().optional(),
      }),
    ),
  }),
})
