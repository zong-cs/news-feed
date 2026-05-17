import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './dev.db'
const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath)
const adapter = new PrismaLibSql({ url: `file:${absolutePath}` })
const prisma = new PrismaClient({ adapter } as any)

const instruments = [
  // ── 大宗商品：黑色金属 ──────────────────────────────────────────
  { symbol: '螺纹钢', name: '螺纹钢', type: 'commodity', exchange: 'SHFE' },
  { symbol: '热轧卷板', name: '热轧卷板', type: 'commodity', exchange: 'SHFE' },
  { symbol: '铁矿石', name: '铁矿石', type: 'commodity', exchange: 'DCE' },
  { symbol: '焦炭', name: '焦炭', type: 'commodity', exchange: 'DCE' },
  { symbol: '焦煤', name: '焦煤', type: 'commodity', exchange: 'DCE' },
  { symbol: '硅铁', name: '硅铁', type: 'commodity', exchange: 'ZCE' },
  { symbol: '锰硅', name: '锰硅', type: 'commodity', exchange: 'ZCE' },

  // ── 大宗商品：有色金属 ──────────────────────────────────────────
  { symbol: '铜', name: '铜', type: 'commodity', exchange: 'SHFE' },
  { symbol: '铝', name: '铝', type: 'commodity', exchange: 'SHFE' },
  { symbol: '锌', name: '锌', type: 'commodity', exchange: 'SHFE' },
  { symbol: '铅', name: '铅', type: 'commodity', exchange: 'SHFE' },
  { symbol: '镍', name: '镍', type: 'commodity', exchange: 'SHFE' },
  { symbol: '锡', name: '锡', type: 'commodity', exchange: 'SHFE' },
  { symbol: '氧化铝', name: '氧化铝', type: 'commodity', exchange: 'SHFE' },
  { symbol: '工业硅', name: '工业硅', type: 'commodity', exchange: 'GFEX' },
  { symbol: '碳酸锂', name: '碳酸锂', type: 'commodity', exchange: 'GFEX' },
  { symbol: '多晶硅', name: '多晶硅', type: 'commodity', exchange: 'GFEX' },

  // ── 大宗商品：贵金属 ────────────────────────────────────────────
  { symbol: '黄金', name: '黄金', type: 'commodity', exchange: 'SHFE' },
  { symbol: '白银', name: '白银', type: 'commodity', exchange: 'SHFE' },

  // ── 大宗商品：能源化工 ──────────────────────────────────────────
  { symbol: '原油', name: '原油', type: 'commodity', exchange: 'INE' },
  { symbol: '燃料油', name: '燃料油', type: 'commodity', exchange: 'SHFE' },
  { symbol: '沥青', name: '沥青', type: 'commodity', exchange: 'SHFE' },
  { symbol: '天然气', name: '天然气', type: 'commodity', exchange: 'SHFE' },
  { symbol: '甲醇', name: '甲醇', type: 'commodity', exchange: 'ZCE' },
  { symbol: '乙二醇', name: '乙二醇', type: 'commodity', exchange: 'DCE' },
  { symbol: 'PTA', name: 'PTA', type: 'commodity', exchange: 'ZCE' },
  { symbol: '苯乙烯', name: '苯乙烯', type: 'commodity', exchange: 'DCE' },
  { symbol: 'PVC', name: 'PVC', type: 'commodity', exchange: 'DCE' },
  { symbol: '橡胶', name: '天然橡胶', type: 'commodity', exchange: 'SHFE' },
  { symbol: '纯碱', name: '纯碱', type: 'commodity', exchange: 'ZCE' },
  { symbol: '烧碱', name: '烧碱', type: 'commodity', exchange: 'ZCE' },
  { symbol: '尿素', name: '尿素', type: 'commodity', exchange: 'ZCE' },
  { symbol: '纸浆', name: '纸浆', type: 'commodity', exchange: 'SHFE' },
  { symbol: '玻璃', name: '玻璃', type: 'commodity', exchange: 'ZCE' },

  // ── 大宗商品：农产品 ────────────────────────────────────────────
  { symbol: '豆粕', name: '豆粕', type: 'commodity', exchange: 'DCE' },
  { symbol: '豆油', name: '豆油', type: 'commodity', exchange: 'DCE' },
  { symbol: '大豆', name: '大豆', type: 'commodity', exchange: 'DCE' },
  { symbol: '玉米', name: '玉米', type: 'commodity', exchange: 'DCE' },
  { symbol: '棉花', name: '棉花', type: 'commodity', exchange: 'ZCE' },
  { symbol: '白糖', name: '白糖', type: 'commodity', exchange: 'ZCE' },
  { symbol: '棕榈油', name: '棕榈油', type: 'commodity', exchange: 'DCE' },
  { symbol: '菜粕', name: '菜粕', type: 'commodity', exchange: 'ZCE' },
  { symbol: '菜油', name: '菜油', type: 'commodity', exchange: 'ZCE' },
  { symbol: '花生', name: '花生', type: 'commodity', exchange: 'ZCE' },
  { symbol: '鸡蛋', name: '鸡蛋', type: 'commodity', exchange: 'DCE' },
  { symbol: '生猪', name: '生猪', type: 'commodity', exchange: 'DCE' },
  { symbol: '苹果', name: '苹果', type: 'commodity', exchange: 'ZCE' },
  { symbol: '红枣', name: '红枣', type: 'commodity', exchange: 'ZCE' },

  // ── 加密货币 ────────────────────────────────────────────────────
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { symbol: 'BNB', name: 'BNB', type: 'crypto' },
  { symbol: 'XRP', name: 'XRP', type: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
  { symbol: 'AVAX', name: 'Avalanche', type: 'crypto' },
  { symbol: 'LINK', name: 'Chainlink', type: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto' },

  // ── 股票：A股指数 ───────────────────────────────────────────────
  { symbol: '沪深300', name: '沪深300指数', type: 'stock', exchange: 'CSI' },
  { symbol: '中证500', name: '中证500指数', type: 'stock', exchange: 'CSI' },
  { symbol: '中证1000', name: '中证1000指数', type: 'stock', exchange: 'CSI' },
  { symbol: '上证50', name: '上证50指数', type: 'stock', exchange: 'SSE' },
  { symbol: '创业板', name: '创业板指数', type: 'stock', exchange: 'SZSE' },
  { symbol: '科创50', name: '科创50指数', type: 'stock', exchange: 'SSE' },

  // ── 股票：美股指数 ──────────────────────────────────────────────
  { symbol: 'SPX', name: 'S&P 500', type: 'stock', exchange: 'NYSE' },
  { symbol: 'NDX', name: 'Nasdaq 100', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'DJI', name: 'Dow Jones', type: 'stock', exchange: 'NYSE' },

  // ── 股票：热门个股 ──────────────────────────────────────────────
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'stock', exchange: 'NASDAQ' },
]

async function main() {
  let created = 0
  for (const inst of instruments) {
    await prisma.tradingInstrument.upsert({
      where: { symbol: inst.symbol },
      create: inst,
      update: { name: inst.name, exchange: inst.exchange ?? null },
    })
    created++
  }
  console.log(`Seeded ${created} instruments`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
