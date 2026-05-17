/**
 * 同花顺 K 线数据抓取
 * API: https://d.10jqka.com.cn/v6/line/qh_{symbol}/{period}/last.js
 * period: '01' = 日线, '10' = 周线
 */

export interface KBar {
  date: string  // YYYYMMDD
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 期货品种名称 → 同花顺合约代码（主力合约）
// 格式: 交易所品种代码 + 主力月份
const VARIETY_TO_SYMBOL: Record<string, string> = {
  // 黑色金属 (SHFE)
  '螺纹钢':  'rb2510',
  '热轧卷板': 'hc2510',
  '铁矿石':  'i2509',
  '焦炭':    'j2509',
  '焦煤':    'jm2509',
  '硅铁':    'sf2508',
  '锰硅':    'sm2508',
  // 有色金属 (SHFE/GFEX)
  '铜':      'cu2507',
  '铝':      'al2507',
  '锌':      'zn2507',
  '铅':      'pb2507',
  '镍':      'ni2507',
  '锡':      'sn2507',
  '氧化铝':  'ao2508',
  '工业硅':  'si2508',
  '碳酸锂':  'lc2508',
  '多晶硅':  'ps2507',
  // 贵金属 (SHFE)
  '黄金':    'au2508',
  '白银':    'ag2512',
  // 能源 (SHFE/INE)
  '原油':    'sc2507',
  '燃料油':  'fu2509',
  '沥青':    'bu2509',
  '天然气':  'ng2508',
  // 化工 (ZCE/DCE/SHFE)
  '甲醇':    'ma509',
  '乙二醇':  'eg2509',
  'PTA':     'ta509',
  '苯乙烯':  'eb2509',
  'PVC':     'v2509',
  '橡胶':    'ru2509',
  '纯碱':    'sa509',
  '烧碱':    'sh2508',
  '尿素':    'ur509',
  '纸浆':    'sp2509',
  '玻璃':    'fg509',
  // 农产品 (DCE/ZCE)
  '豆粕':    'm2509',
  '豆油':    'y2509',
  '大豆':    'a2509',
  '玉米':    'c2509',
  '棉花':    'cf509',
  '白糖':    'sr509',
  '棕榈油':  'p2509',
  '菜粕':    'rm509',
  '菜油':    'oi509',
  '花生':    'pg2509',
  '鸡蛋':    'jd2508',
  '生猪':    'lh2508',
  '苹果':    'ap510',
  '红枣':    'cj509',
}

const PERIOD_DAILY  = '01'
const PERIOD_WEEKLY = '10'

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

async function fetchKLine(symbol: string, period: string): Promise<KBar[]> {
  const url = `https://d.10jqka.com.cn/v6/line/qh_${symbol}/${period}/last.js`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)

  // Response is JSONP: quotebridge_v6_line_qh_xxx_01_last({...})
  // The body is GBK encoded — Node 18+ fetch returns text, we need to handle encoding
  const buf = await res.arrayBuffer()
  const text = new TextDecoder('gbk').decode(buf)

  const match = text.match(/\((\{[\s\S]*\})\)/)
  if (!match) throw new Error(`Unexpected response format for ${symbol}`)

  const json = JSON.parse(match[1])
  return parseData(json.data ?? '')
}

export interface VarietyKData {
  variety: string
  symbol: string
  daily:  KBar[]   // last 140 bars
  weekly: KBar[]   // last 140 bars
}

export async function fetchVarietyKData(variety: string): Promise<VarietyKData | null> {
  const symbol = VARIETY_TO_SYMBOL[variety]
  if (!symbol) return null

  try {
    const [daily, weekly] = await Promise.all([
      fetchKLine(symbol, PERIOD_DAILY),
      fetchKLine(symbol, PERIOD_WEEKLY),
    ])
    return { variety, symbol, daily, weekly }
  } catch (err) {
    console.error(`[ths] fetchVarietyKData failed for ${variety} (${symbol}):`, err)
    return null
  }
}

export { VARIETY_TO_SYMBOL }
