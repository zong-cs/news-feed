-- CreateTable
CREATE TABLE "FuturesVarietyAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variety" TEXT NOT NULL,
    "contradiction" TEXT NOT NULL,
    "opportunity" TEXT NOT NULL,
    "bullCase" TEXT NOT NULL,
    "bearCase" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "FuturesVarietyAnalysis_variety_key" ON "FuturesVarietyAnalysis"("variety");
