import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './dev.db'
const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath)
const adapter = new PrismaLibSql({ url: `file:${absolutePath}` })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Seed some example instruments so the UI isn't empty
  const instruments = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
    { symbol: 'GOLD', name: 'Gold', type: 'commodity' },
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  ]

  for (const inst of instruments) {
    await prisma.tradingInstrument.upsert({
      where: { symbol: inst.symbol },
      create: inst,
      update: {},
    })
  }

  console.log('Seeded', instruments.length, 'instruments')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
