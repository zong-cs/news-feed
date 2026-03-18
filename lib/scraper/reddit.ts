import { BaseScraper, ScrapedArticle } from './base'

// Reddit — JSON API (r/investing + r/wallstreetbets)
export class RedditScraper extends BaseScraper {
  constructor() {
    super('reddit')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const subreddits = ['investing', 'wallstreetbets']
    const articles: ScrapedArticle[] = []

    for (const sub of subreddits) {
      const url = `https://www.reddit.com/r/${sub}/hot.json?limit=15`
      try {
        const res = await this.fetchWithRateLimit(url)
        if (!res.ok) continue

        const data = await res.json()
        const posts: any[] = data?.data?.children ?? []
        console.log(`[reddit] r/${sub} fetched`, posts.length, 'items')

        for (const { data: post } of posts) {
          if (post.stickied || !post.title) continue
          articles.push({
            url: `https://www.reddit.com${post.permalink}`,
            title: post.title,
            content: post.selftext ? post.selftext.slice(0, 1000) : post.title,
            source: 'reddit',
            publishedAt: new Date(post.created_utc * 1000),
          })
        }
      } catch (err) {
        console.error(`[reddit] r/${sub} error:`, err)
      }
    }

    return articles
  }
}
