import { vi } from "vitest"

type SqlResult = any[] | undefined

export function createQueryBuilder(result: SqlResult = []) {
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

export function createMockDb() {
  return {
    select: vi.fn(() => createQueryBuilder([])),
    insert: vi.fn(() => createQueryBuilder([])),
    update: vi.fn(() => createQueryBuilder([])),
    delete: vi.fn(() => createQueryBuilder(undefined)),
  }
}
