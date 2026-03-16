-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rawHtml" TEXT,
    "source" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "summary" TEXT,
    "sentiment" TEXT,
    "keyDataPoints" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TradingInstrument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "exchange" TEXT
);

-- CreateTable
CREATE TABLE "ArticleInstrument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "relevance" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "ArticleInstrument_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleInstrument_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "TradingInstrument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "lastRun" DATETIME,
    "count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_url_key" ON "NewsArticle"("url");

-- CreateIndex
CREATE UNIQUE INDEX "TradingInstrument_symbol_key" ON "TradingInstrument"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleInstrument_articleId_instrumentId_key" ON "ArticleInstrument"("articleId", "instrumentId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeJob_source_key" ON "ScrapeJob"("source");
