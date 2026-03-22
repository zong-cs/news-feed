-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FuturesVarietyAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variety" TEXT NOT NULL,
    "sector" TEXT NOT NULL DEFAULT '其他',
    "contradiction" TEXT NOT NULL,
    "opportunity" TEXT NOT NULL,
    "bullCase" TEXT NOT NULL,
    "bearCase" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FuturesVarietyAnalysis" ("bearCase", "bullCase", "contradiction", "createdAt", "id", "opportunity", "sentiment", "updatedAt", "variety") SELECT "bearCase", "bullCase", "contradiction", "createdAt", "id", "opportunity", "sentiment", "updatedAt", "variety" FROM "FuturesVarietyAnalysis";
DROP TABLE "FuturesVarietyAnalysis";
ALTER TABLE "new_FuturesVarietyAnalysis" RENAME TO "FuturesVarietyAnalysis";
CREATE UNIQUE INDEX "FuturesVarietyAnalysis_variety_key" ON "FuturesVarietyAnalysis"("variety");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
