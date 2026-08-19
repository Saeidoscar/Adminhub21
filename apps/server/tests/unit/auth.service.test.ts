import { vi, describe, it, expect, beforeEach } from "vitest"
import { register, login, refresh, me } from "../../src/modules/auth/auth.service"
import { ApiError } from "../../src/lib/errors"

const { mockDb, mockHashPassword, mockVerifyPassword, mockCreateApiToken, mockSignToken, createQueryBuilder } =
  vi.hoisted(() => {
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

    const mockHashPassword = vi.fn().mockResolvedValue("hashed")
    const mockVerifyPassword = vi.fn()
    const mockCreateApiToken = vi.fn().mockResolvedValue("access-token")
    const mockSignToken = vi.fn().mockResolvedValue("refresh-token")

    return {
      mockDb,
      mockHashPassword,
      mockVerifyPassword,
      mockCreateApiToken,
      mockSignToken,
      createQueryBuilder,
    }
  })

vi.mock("../../src/db", () => ({ db: mockDb }))
vi.mock("../../src/lib/password", () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
}))
vi.mock("../../src/lib/sanctum", () => ({
  createApiToken: mockCreateApiToken,
}))
vi.mock("../../src/lib/tokens", () => ({
  signToken: mockSignToken,
}))

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.select.mockReturnValue(createQueryBuilder([]))
    mockDb.insert.mockReturnValue(createQueryBuilder([]))
    mockDb.update.mockReturnValue(createQueryBuilder([]))
    mockDb.delete.mockReturnValue(createQueryBuilder(undefined))
  })

  describe("register", () => {
    it("should throw 409 if email already exists", async () => {
      mockDb.select.mockReturnValueOnce(
        createQueryBuilder([{ id: "user-1" }]),
      )

      await expect(
        register({
          email: "existing@example.com",
          password: "password123",
          role: "employer",
          nameEn: "Test",
          nameFa: "تست",
        }),
      ).rejects.toThrow(ApiError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it("should create a new user and return tokens", async () => {
      const newUser = {
        id: "user-new",
        email: "new@example.com",
        passwordHash: "hashed",
        role: "employer",
        nameEn: "New",
        nameFa: "جدید",
        phone: null,
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))
      mockDb.insert.mockReturnValueOnce(createQueryBuilder([newUser]))

      const result = await register({
        email: "new@example.com",
        password: "password123",
        role: "employer",
        nameEn: "New",
        nameFa: "جدید",
      })

      expect(result.user.email).toBe("new@example.com")
      expect(result.accessToken).toBe("access-token")
      expect(result.refreshToken).toBe("refresh-token")
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })

    it("should create admin profile for admin role", async () => {
      const newUser = {
        id: "user-admin",
        email: "admin@example.com",
        passwordHash: "hashed",
        role: "admin",
        nameEn: "Admin",
        nameFa: "ادمین",
        phone: null,
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))
      mockDb.insert
        .mockReturnValueOnce(createQueryBuilder([newUser]))
        .mockReturnValueOnce(createQueryBuilder([{ userId: "user-admin" }]))

      const result = await register({
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        nameEn: "Admin",
        nameFa: "ادمین",
      })

      expect(result.user.role).toBe("admin")
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
    })
  })

  describe("login", () => {
    it("should throw 401 if user not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      await expect(
        login({ email: "nouser@example.com", password: "password123" }),
      ).rejects.toThrow(ApiError)
    })

    it("should throw 401 if password is wrong", async () => {
      mockDb.select.mockReturnValueOnce(
        createQueryBuilder([{ id: "user-1", passwordHash: "hash" }]),
      )

      mockVerifyPassword.mockResolvedValueOnce(false)

      await expect(
        login({ email: "user@example.com", password: "wrong" }),
      ).rejects.toThrow(ApiError)
    })

    it("should return tokens on successful login", async () => {
      const user = {
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hash",
        role: "employer",
        nameEn: "User",
        nameFa: "کاربر",
        phone: null,
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))
      mockVerifyPassword.mockResolvedValueOnce(true)

      const result = await login({ email: "user@example.com", password: "password" })

      expect(result.user.email).toBe("user@example.com")
      expect(result.accessToken).toBe("access-token")
    })
  })

  describe("refresh", () => {
    it("should throw 401 if user not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      await expect(refresh("invalid-id")).rejects.toThrow(ApiError)
    })

    it("should return tokens for valid userId", async () => {
      const user = {
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hash",
        role: "employer",
        nameEn: "User",
        nameFa: "کاربر",
        phone: null,
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))

      const result = await refresh("user-1")

      expect(result.user.id).toBe("user-1")
      expect(result.accessToken).toBe("access-token")
    })
  })

  describe("me", () => {
    it("should throw 404 if user not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      await expect(me("invalid-id")).rejects.toThrow(ApiError)
    })

    it("should return safe user without passwordHash", async () => {
      const user = {
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hash",
        role: "employer",
        nameEn: "User",
        nameFa: "کاربر",
        phone: null,
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))

      const result = await me("user-1")

      expect(result.id).toBe("user-1")
      expect(result.email).toBe("user@example.com")
      expect(result.passwordHash).toBeUndefined()
    })
  })
})
