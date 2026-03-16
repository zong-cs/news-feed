import { BaseScraper } from './base'
import { ReutersScraper } from './reuters'
import { FTScraper } from './ft'
import { BloombergScraper } from './bloomberg'
import { EastMoneyScraper } from './eastmoney'
import { CLSScraper } from './cls'
import { STCNScraper } from './stcn'
import { CoinDeskScraper } from './coindesk'
import { CoinTelegraphScraper } from './cointelegraph'
import { TwitterScraper } from './twitter'
import { ALL_SOURCES, SourceName } from './sources'

export { ALL_SOURCES, type SourceName } from './sources'

const scraperMap: Record<SourceName, () => BaseScraper> = {
  reuters: () => new ReutersScraper(),
  ft: () => new FTScraper(),
  bloomberg: () => new BloombergScraper(),
  eastmoney: () => new EastMoneyScraper(),
  cls: () => new CLSScraper(),
  stcn: () => new STCNScraper(),
  coindesk: () => new CoinDeskScraper(),
  cointelegraph: () => new CoinTelegraphScraper(),
  twitter: () => new TwitterScraper(),
}

export function getScraperForSource(source: string): BaseScraper {
  if (!(source in scraperMap)) {
    throw new Error(`Unknown source: ${source}`)
  }
  return scraperMap[source as SourceName]()
}
