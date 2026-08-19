import { vi, describe, it, expect, beforeEach } from "vitest"
import {
  createContract,
  listContractsForUser,
  getContractById,
  updateContractStatus,
} from "../../src/modules/contracts/contracts.service"

const { mockDb, createQueryBuilder } = vi.hoisted(() => {
  function createQueryBuilder(result: any[] = []) {
    const builder: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      having: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(result),
      offset: vi.fn().mockResolvedValue(result),
      returning: vi.fn().mockResolvedValue(result),
    }
    builder.then = (resolve: any, reject: any) =>
      Promise.resolve(result).then(resolve, reject)
    builder.catch = (reject: any) =>
      Promise.resolve(result).catch(reject)
    return builder
  }

  const mockDb = {
    select: vi.fn(() => createQueryBuilder([])),
    insert: vi.fn(() => createQueryBuilder([])),
    update: vi.fn(() => createQueryBuilder([])),
    delete: vi.fn(() => createQueryBuilder(undefined)),
  }

  return { mockDb, createQueryBuilder }
})

vi.mock("../../src/db", () => ({ db: mockDb }))

describe("contracts.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.select.mockReturnValue(createQueryBuilder([]))
    mockDb.insert.mockReturnValue(createQueryBuilder([]))
    mockDb.update.mockReturnValue(createQueryBuilder([]))
    mockDb.delete.mockReturnValue(createQueryBuilder(undefined))
  })

  describe("createContract", () => {
    it("should throw if neither offerId nor adminId is provided", async () => {
      await expect(
        createContract("user-1", "employer", {}),
      ).rejects.toThrow("offerId or adminId is required")
    })

    it("should throw if offer not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      await expect(
        createContract("user-1", "employer", { offerId: "offer-1" }),
      ).rejects.toThrow("Offer not found")
    })

    it("should throw if employer tries to use another employer's offer", async () => {
      const offer = {
        id: "offer-1",
        employerId: "employer-2",
        adminId: "admin-1",
        employerName: "Employer 2",
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([offer]))

      await expect(
        createContract("employer-1", "employer", { offerId: "offer-1" }),
      ).rejects.toThrow("Forbidden")
    })

    it("should create contract from offer for employer", async () => {
      const offer = {
        id: "offer-1",
        employerId: "user-1",
        adminId: "admin-1",
        employerName: "Employer 1",
      }

      const contract = {
        id: "contract-1",
        code: "CNT-123",
        employerId: "user-1",
        adminId: "admin-1",
        platform: "telegram",
        amountToman: 1000000,
        amountUSD: 0,
        hasInsurance: true,
        hasSubstitute: false,
        termClause: null,
        substituteClause: null,
        startDate: new Date(),
        endDate: new Date(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.select
        .mockReturnValueOnce(createQueryBuilder([offer]))
        .mockReturnValueOnce(createQueryBuilder([{ nameFa: "ادمین" }]))

      mockDb.insert.mockReturnValueOnce(createQueryBuilder([contract]))

      const result = await createContract("user-1", "employer", { offerId: "offer-1" })

      expect(result.code).toBe("CNT-123")
      expect(result.status).toBe("pending")
    })

    it("should create contract without offer for employer with adminId", async () => {
      const employer = {
        id: "user-1",
        nameEn: "Employer",
        nameFa: "کارفرما",
      }

      const contract = {
        id: "contract-2",
        code: "CNT-456",
        employerId: "user-1",
        adminId: "admin-1",
        platform: "telegram",
        amountToman: 2000000,
        amountUSD: 0,
        hasInsurance: false,
        hasSubstitute: true,
        termClause: "test",
        substituteClause: null,
        startDate: new Date(),
        endDate: new Date(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.select
        .mockReturnValueOnce(createQueryBuilder([employer]))
        .mockReturnValueOnce(createQueryBuilder([{ nameEn: "Admin", nameFa: "ادمین", photo: null }]))
        .mockReturnValueOnce(createQueryBuilder([employer]))

      mockDb.insert.mockReturnValueOnce(createQueryBuilder([contract]))

      const result = await createContract("user-1", "employer", { adminId: "admin-1", platform: "telegram", amountToman: 2000000 })

      expect(result.code).toBe("CNT-456")
      expect(result.employerName).toBe("کارفرما")
    })

    it("should throw if non-employer tries to create contract without offerId", async () => {
      await expect(
        createContract("admin-1", "admin", { adminId: "admin-1" }),
      ).rejects.toThrow("Only employer can create contract without offerId")
    })
  })

  describe("listContractsForUser", () => {
    it("should return contracts for employer", async () => {
      const contracts = [
        {
          id: "contract-1",
          code: "CNT-1",
          employerId: "user-1",
          adminId: "admin-1",
          adminNameEn: "Admin",
          adminNameFa: "ادمین",
          adminPhoto: null,
          employerName: "کارفرما",
          platform: "telegram",
          status: "active",
          amountToman: 1000000,
          amountUSD: 0,
          hasInsurance: true,
          hasSubstitute: false,
          termClause: null,
          substituteClause: null,
          startDate: new Date(),
          endDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValueOnce(createQueryBuilder(contracts))

      const result = await listContractsForUser("user-1", "employer")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("contract-1")
    })

    it("should return empty array for admin without profile", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      const result = await listContractsForUser("admin-1", "admin")

      expect(result).toHaveLength(0)
    })

    it("should return contracts for admin with profile", async () => {
      const contracts = [
        {
          id: "contract-1",
          code: "CNT-1",
          employerId: "user-1",
          adminId: "admin-profile-1",
          adminNameEn: "Admin",
          adminNameFa: "ادمین",
          adminPhoto: null,
          employerName: "کارفرما",
          platform: "telegram",
          status: "active",
          amountToman: 1000000,
          amountUSD: 0,
          hasInsurance: true,
          hasSubstitute: false,
          termClause: null,
          substituteClause: null,
          startDate: new Date(),
          endDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockDb.select
        .mockReturnValueOnce(createQueryBuilder([{ id: "admin-profile-1" }]))
        .mockReturnValueOnce(createQueryBuilder(contracts))

      const result = await listContractsForUser("admin-1", "admin")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("contract-1")
    })
  })

  describe("getContractById", () => {
    it("should return contract if found", async () => {
      const contract = {
        id: "contract-1",
        code: "CNT-1",
        employerId: "user-1",
        adminId: "admin-1",
        adminNameEn: "Admin",
        adminNameFa: "ادمین",
        adminPhoto: null,
        employerName: "کارفرما",
        platform: "telegram",
        status: "active",
        amountToman: 1000000,
        amountUSD: 0,
        hasInsurance: true,
        hasSubstitute: false,
        termClause: null,
        substituteClause: null,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([contract]))

      const result = await getContractById("contract-1")

      expect(result).not.toBeNull()
      expect(result?.code).toBe("CNT-1")
    })

    it("should return null if not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      const result = await getContractById("nonexistent")

      expect(result).toBeNull()
    })
  })

  describe("updateContractStatus", () => {
    it("should throw if contract not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      await expect(
        updateContractStatus("nonexistent", { status: "completed" }),
      ).rejects.toThrow("Contract not found")
    })

    it("should update contract status", async () => {
      const existing = {
        id: "contract-1",
        code: "CNT-1",
        adminId: "admin-1",
        employerId: "user-1",
        createdAt: new Date(),
      }

      const updated = {
        id: "contract-1",
        code: "CNT-1",
        employerId: "user-1",
        adminId: "admin-1",
        platform: "telegram",
        status: "completed",
        amountToman: 1000000,
        amountUSD: 0,
        hasInsurance: true,
        hasSubstitute: false,
        termClause: null,
        substituteClause: null,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([existing]))
      mockDb.update.mockReturnValueOnce(createQueryBuilder([updated]))
      mockDb.select
        .mockReturnValueOnce(createQueryBuilder([{ nameFa: "ادمین" }]))
        .mockReturnValueOnce(createQueryBuilder([{ nameFa: "کارفرما" }]))

      const result = await updateContractStatus("contract-1", { status: "completed" })

      expect(result.status).toBe("completed")
    })
  })
})
