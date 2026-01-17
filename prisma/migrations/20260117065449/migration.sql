-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('FIRE', 'MEDICAL', 'CRIME', 'ACCIDENT', 'DISASTER', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportSource" AS ENUM ('VOICE', 'MANUAL', 'SENSOR', 'AI');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "source" "ReportSource" NOT NULL DEFAULT 'VOICE',
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeechStressData" (
    "id" TEXT NOT NULL,
    "wordsPerSecond" DOUBLE PRECISION NOT NULL,
    "repeatedWords" INTEGER NOT NULL,
    "pauseCount" INTEGER NOT NULL,
    "averagePauseDuration" DOUBLE PRECISION NOT NULL,
    "confidence" INTEGER NOT NULL,
    "stressIndicators" TEXT NOT NULL,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeechStressData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_category_idx" ON "Report"("category");

-- CreateIndex
CREATE INDEX "Report_severity_idx" ON "Report"("severity");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Report_latitude_longitude_idx" ON "Report"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "SpeechStressData_reportId_key" ON "SpeechStressData"("reportId");

-- CreateIndex
CREATE INDEX "SpeechStressData_reportId_idx" ON "SpeechStressData"("reportId");

-- CreateIndex
CREATE INDEX "SpeechStressData_confidence_idx" ON "SpeechStressData"("confidence");

-- CreateIndex
CREATE INDEX "SpeechStressData_createdAt_idx" ON "SpeechStressData"("createdAt");

-- AddForeignKey
ALTER TABLE "SpeechStressData" ADD CONSTRAINT "SpeechStressData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
