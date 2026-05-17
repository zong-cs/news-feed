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
import { SinaScraper } from './sina'
import { TongHuaShunScraper } from './tonghuashun'
import { XueQiuScraper } from './xueqiu'
import { WallStreetCNScraper } from './wallstreetcn'
import { TheBlockScraper } from './theblock'
import { DecryptScraper } from './decrypt'
import { BlockworksScraper } from './blockworks'
import { CNBCScraper } from './cnbc'
import { MarketWatchScraper } from './marketwatch'
import { SeekingAlphaScraper } from './seekingalpha'
import { CiticsFScraper } from './citicsf'
import { RedditScraper } from './reddit'
import { EAFuturesScraper } from './eafutures'
import { ZTQHScraper } from './ztqh'
import { ZLQHScraper } from './zlqh'
import { THSFuturesScraper } from './thsfutures'
import { EMFuturesScraper } from './emfutures'
import { NanhuaScraper } from './nanhua'
import { GTJAQHScraper } from './gtjaqh'
import { HTQHScraper } from './htqh'
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
  sina: () => new SinaScraper(),
  tonghuashun: () => new TongHuaShunScraper(),
  xueqiu: () => new XueQiuScraper(),
  wallstreetcn: () => new WallStreetCNScraper(),
  theblock: () => new TheBlockScraper(),
  decrypt: () => new DecryptScraper(),
  blockworks: () => new BlockworksScraper(),
  cnbc: () => new CNBCScraper(),
  marketwatch: () => new MarketWatchScraper(),
  seekingalpha: () => new SeekingAlphaScraper(),
  citicsf: () => new CiticsFScraper(),
  reddit: () => new RedditScraper(),
  eafutures: () => new EAFuturesScraper(),
  ztqh: () => new ZTQHScraper(),
  zlqh: () => new ZLQHScraper(),
  thsfutures: () => new THSFuturesScraper(),
  emfutures: () => new EMFuturesScraper(),
  nanhua: () => new NanhuaScraper(),
  gtjaqh: () => new GTJAQHScraper(),
  htqh: () => new HTQHScraper(),
}

export function getScraperForSource(source: string): BaseScraper {
  if (!(source in scraperMap)) {
    throw new Error(`Unknown source: ${source}`)
  }
  return scraperMap[source as SourceName]()
}
