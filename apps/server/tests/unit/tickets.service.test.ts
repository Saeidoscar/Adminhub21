import { vi, describe, it, expect, beforeEach } from "vitest"
import {
  createTicket,
  listTicketsForUser,
  getTicketById,
  updateTicket,
  createTicketMessage,
  listTicketMessages,
} from "../../src/modules/tickets/tickets.service"

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

describe("tickets.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.select.mockReturnValue(createQueryBuilder([]))
    mockDb.insert.mockReturnValue(createQueryBuilder([]))
    mockDb.update.mockReturnValue(createQueryBuilder([]))
    mockDb.delete.mockReturnValue(createQueryBuilder(undefined))
  })

  describe("createTicket", () => {
    it("should create a ticket and return it with user info", async () => {
      const ticket = {
        id: "ticket-1",
        userId: "user-1",
        subject: "Test",
        category: "support",
        priority: "medium",
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const user = {
        id: "user-1",
        nameEn: "Test",
        nameFa: "تست",
        email: "test@example.com",
      }

      mockDb.insert.mockReturnValueOnce(createQueryBuilder([ticket]))
      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))

      const result = await createTicket("user-1", {
        subject: "Test",
        category: "support",
        priority: "medium",
      })

      expect(result.id).toBe("ticket-1")
      expect(result.userName).toBe("تست")
      expect(result.userEmail).toBe("test@example.com")
    })

    it("should fallback to nameEn if nameFa is missing", async () => {
      const ticket = {
        id: "ticket-2",
        userId: "user-2",
        subject: "Test 2",
        category: "support",
        priority: "low",
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const user = {
        id: "user-2",
        nameEn: "Test EN",
        nameFa: null,
        email: "test2@example.com",
      }

      mockDb.insert.mockReturnValueOnce(createQueryBuilder([ticket]))
      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))

      const result = await createTicket("user-2", {
        subject: "Test 2",
        category: "support",
        priority: "low",
      })

      expect(result.userName).toBe("Test EN")
    })
  })

  describe("listTicketsForUser", () => {
    it("should return tickets for user", async () => {
      const tickets = [
        {
          id: "ticket-1",
          userId: "user-1",
          subject: "Test",
          category: "support",
          priority: "medium",
          status: "open",
          createdAt: new Date(),
          updatedAt: new Date(),
          userName: "تست",
          userEmail: "test@example.com",
        },
      ]

      mockDb.select.mockReturnValueOnce(createQueryBuilder(tickets))

      const result = await listTicketsForUser("user-1")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("ticket-1")
    })
  })

  describe("getTicketById", () => {
    it("should return ticket if user is owner", async () => {
      const ticket = {
        id: "ticket-1",
        userId: "user-1",
        subject: "Test",
        category: "support",
        priority: "medium",
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: "تست",
        userEmail: "test@example.com",
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([ticket]))

      const result = await getTicketById("ticket-1", "user-1", "employer")

      expect(result).not.toBeNull()
      expect(result?.id).toBe("ticket-1")
    })

    it("should return ticket if user is admin", async () => {
      const ticket = {
        id: "ticket-1",
        userId: "user-1",
        subject: "Test",
        category: "support",
        priority: "medium",
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: "تست",
        userEmail: "test@example.com",
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([ticket]))

      const result = await getTicketById("ticket-1", "user-2", "admin")

      expect(result).not.toBeNull()
      expect(result?.id).toBe("ticket-1")
    })

    it("should return null if user is not owner and not admin", async () => {
      const ticket = {
        id: "ticket-1",
        userId: "user-1",
        subject: "Test",
        category: "support",
        priority: "medium",
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: "تست",
        userEmail: "test@example.com",
      }

      mockDb.select.mockReturnValueOnce(createQueryBuilder([ticket]))

      const result = await getTicketById("ticket-1", "user-2", "employer")

      expect(result).toBeNull()
    })

    it("should return null if ticket not found", async () => {
      mockDb.select.mockReturnValueOnce(createQueryBuilder([]))

      const result = await getTicketById("nonexistent", "user-1", "employer")

      expect(result).toBeNull()
    })
  })

  describe("updateTicket", () => {
    it("should throw if ticket not found", async () => {
      mockDb.update.mockReturnValueOnce(createQueryBuilder([]))

      await expect(
        updateTicket("nonexistent", { status: "resolved" }),
      ).rejects.toThrow("Ticket not found")
    })

    it("should update ticket and return updated ticket", async () => {
      const ticket = {
        id: "ticket-1",
        userId: "user-1",
        subject: "Test",
        category: "support",
        priority: "medium",
        status: "resolved",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const user = {
        id: "user-1",
        nameEn: "Test",
        nameFa: "تست",
        email: "test@example.com",
      }

      mockDb.update.mockReturnValueOnce(createQueryBuilder([ticket]))
      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))

      const result = await updateTicket("ticket-1", { status: "resolved" })

      expect(result.status).toBe("resolved")
    })
  })

  describe("createTicketMessage", () => {
    it("should create a message and return it with sender name", async () => {
      const message = {
        id: "msg-1",
        ticketId: "ticket-1",
        senderId: "user-1",
        body: "Hello",
        createdAt: new Date(),
      }

      const user = {
        id: "user-1",
        nameEn: "Test",
        nameFa: "تست",
      }

      mockDb.insert.mockReturnValueOnce(createQueryBuilder([message]))
      mockDb.select.mockReturnValueOnce(createQueryBuilder([user]))

      const result = await createTicketMessage("ticket-1", "user-1", "Hello")

      expect(result.id).toBe("msg-1")
      expect(result.senderName).toBe("تست")
    })
  })

  describe("listTicketMessages", () => {
    it("should return messages for a ticket", async () => {
      const messages = [
        {
          id: "msg-1",
          ticketId: "ticket-1",
          senderId: "user-1",
          body: "Hello",
          createdAt: new Date(),
          senderName: "تست",
        },
      ]

      mockDb.select.mockReturnValueOnce(createQueryBuilder(messages))

      const result = await listTicketMessages("ticket-1")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("msg-1")
    })
  })
})
