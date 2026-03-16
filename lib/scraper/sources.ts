export const ALL_SOURCES = [
  'reuters',
  'ft',
  'bloomberg',
  'eastmoney',
  'cls',
  'stcn',
  'coindesk',
  'cointelegraph',
  'twitter',
] as const

export type SourceName = (typeof ALL_SOURCES)[number]
