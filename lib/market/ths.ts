/**
 * 同花顺 K 线数据抓取
 * API: https://d.10jqka.com.cn/v6/line/qh_{symbol}/{period}/last.js
 * period: '01' = 日线, '10' = 周线
 *
 * 自动探测主力合约月份（从当月起往后 12 个月枚举，找到有数据的合约）
 */

export interface KBar {
  date: string  // YYYYMMDD
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 期货品种名称 → 同花顺品种代码（不含月份）
const VARIETY_TO_CODE: Record<string, string> = {
  // 黑色金属 SHFE/DCE/ZCE
  '螺纹钢':  'rb',
  '热轧卷板': 'hc',
  '铁矿石':  'i',
  '焦炭':    'j',
  '焦煤':    'jm',
  '硅铁':    'sf',
  '锰硅':    'sm',
  // 有色金属 SHFE/GFEX
  '铜':      'cu',
  '铝':      'al',
  '锌':      'zn',
  '铅':      'pb',
  '镍':      'ni',
  '锡':      'sn',
  '氧化铝':  'ao',
  '工业硅':  'si',
  '碳酸锂':  'lc',
  '多晶硅':  'ps',
  // 贵金属 SHFE
  '黄金':    'au',
  '白银':    'ag',
  // 能源 SHFE/INE
  '原油':    'sc',
  '燃料油':  'fu',
  '沥青':    'bu',
  '天然气':  'ng',
  // 化工 ZCE/DCE/SHFE
  '甲醇':    'ma',
  '乙二醇':  'eg',
  'PTA':     'ta',
  '苯乙烯':  'eb',
  'PVC':     'v',
  '橡胶':    'ru',
  '纯碱':    'sa',
  '烧碱':    'sh',
  '尿素':    'ur',
  '纸浆':    'sp',
  '玻璃':    'fg',
  // 农产品 DCE/ZCE
  '豆粕':    'm',
  '豆油':    'y',
  '大豆':    'a',
  '玉米':    'c',
  '棉花':    'cf',
  '白糖':    'sr',
  '棕榈油':  'p',
  '菜粕':    'rm',
  '菜油':    'oi',
  '花生':    'pg',
  '鸡蛋':    'jd',
  '生猪':    'lh',
  '苹果':    'ap',
  '红枣':    'cj',
}

const PERIOD_DAILY  = '01'
const PERIOD_WEEKLY = '10'

/** Generate candidate contract months starting from current month, up to 14 months ahead */
function getCandidateMonths(): string[] {
  const now = new Date()
  const months: string[] = []
  for (let i = 0; i <= 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const yy = String(d.getFullYear()).slice(2)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${yy}${mm}`)
  }
  return months
}

async function fetchRaw(symbol: string, period: string): Promise<{ total: number; data: string; name: string } | null> {
  const url = `https://d.10jqka.com.cn/v6/line/qh_${symbol}/${period}/last.js`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null

    const buf = await res.arrayBuffer()
    const text = new TextDecoder('gbk').decode(buf)
    const match = text.match(/\((\{[\s\S]*\})\)/)
    if (!match) return null

    const json = JSON.parse(match[1])
    return { total: json.total ?? 0, data: json.data ?? '', name: json.name ?? '' }
  } catch {
    return null
  }
}

/** Auto-detect dominant contract: try candidate months until we find one with data */
async function findDominantContract(code: string): Promise<string | null> {
  const months = getCandidateMonths()
  for (const month of months) {
    const symbol = `${code}${month}`
    const result = await fetchRaw(symbol, PERIOD_DAILY)
    if (result && result.total > 50) {
      return symbol
    }
  }
  return null
}

function parseData(raw: string): KBar[] {
  const bars: KBar[] = []
  for (const row of raw.split(';')) {
    if (!row.trim()) continue
    const f = row.split(',')
    if (f.length < 6) continue
    const open  = parseFloat(f[1])
    const high  = parseFloat(f[2])
    const low   = parseFloat(f[3])
    const close = parseFloat(f[4])
    const vol   = parseFloat(f[5])
    if (isNaN(open) || isNaN(close)) continue
    bars.push({ date: f[0], open, high, low, close, volume: vol })
  }
  return bars
}

export interface VarietyKData {
  variety: string
  symbol: string
  daily:  KBar[]
  weekly: KBar[]
}

// Cache detected contracts for this process lifetime (reset daily via scheduler restart)
const contractCache: Record<string, string> = {}

export async function fetchVarietyKData(variety: string): Promise<VarietyKData | null> {
  const code = VARIETY_TO_CODE[variety]
  if (!code) return null

  // Find dominant contract
  let symbol = contractCache[code]
  if (!symbol) {
    symbol = await findDominantContract(code) ?? ''
    if (!symbol) {
      console.warn(`[ths] no dominant contract found for ${variety} (${code})`)
      return null
    }
    contractCache[code] = symbol
    console.log(`[ths] ${variety} → ${symbol}`)
  }

  try {
    const [dailyRaw, weeklyRaw] = await Promise.all([
      fetchRaw(symbol, PERIOD_DAILY),
      fetchRaw(symbol, PERIOD_WEEKLY),
    ])

    const daily  = dailyRaw  ? parseData(dailyRaw.data)  : []
    const weekly = weeklyRaw ? parseData(weeklyRaw.data) : []

    return { variety, symbol, daily, weekly }
  } catch (err) {
    console.error(`[ths] fetch failed for ${variety} (${symbol}):`, err)
    return null
  }
}

export { VARIETY_TO_CODE as VARIETY_TO_SYMBOL }
