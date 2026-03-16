import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './dev.db'
  const absolutePath = path.isAbsolute(dbPath)
    ? dbPath
    : path.join(process.cwd(), dbPath)

  const adapter = new PrismaLibSql({ url: `file:${absolutePath}` })
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
