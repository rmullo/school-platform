CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "Campaign" (
  "id" UUID NOT NULL,
  "schoolYearId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "enrollmentStart" VARCHAR(10) NOT NULL,
  "enrollmentEnd" VARCHAR(10) NOT NULL,
  "disclosure" TEXT NOT NULL,
  "calendar" TEXT NOT NULL,
  "vacancyPolicy" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Campaign_dates_check" CHECK ("enrollmentStart" <= "enrollmentEnd"),
  CONSTRAINT "Campaign_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Campaign_schoolYearId_name_key" ON "Campaign"("schoolYearId", "name");
CREATE INDEX "Campaign_schoolYearId_status_idx" ON "Campaign"("schoolYearId", "status");

CREATE TABLE "ContractVersion" (
  "id" UUID NOT NULL,
  "campaignId" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "totalAnnualCents" INTEGER NOT NULL,
  "initialInstallmentCents" INTEGER NOT NULL,
  "remainingInstallmentCents" INTEGER NOT NULL,
  "remainingInstallmentCount" INTEGER NOT NULL,
  "siblingDiscountBps" INTEGER NOT NULL DEFAULT 0,
  "punctualityDiscountCents" INTEGER NOT NULL DEFAULT 0,
  "materialCollectiveRequired" BOOLEAN NOT NULL DEFAULT false,
  "terms" TEXT NOT NULL,
  "validFrom" VARCHAR(10) NOT NULL,
  "validUntil" VARCHAR(10) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractVersion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContractVersion_money_check" CHECK ("totalAnnualCents" >= 0 AND "initialInstallmentCents" >= 0 AND "remainingInstallmentCents" >= 0 AND "remainingInstallmentCount" > 0 AND "siblingDiscountBps" BETWEEN 0 AND 10000 AND "punctualityDiscountCents" >= 0),
  CONSTRAINT "ContractVersion_total_check" CHECK ("totalAnnualCents" = "initialInstallmentCents" + ("remainingInstallmentCents" * "remainingInstallmentCount")),
  CONSTRAINT "ContractVersion_dates_check" CHECK ("validFrom" <= "validUntil"),
  CONSTRAINT "ContractVersion_collective_material_check" CHECK (NOT "materialCollectiveRequired"),
  CONSTRAINT "ContractVersion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ContractVersion_campaignId_version_key" ON "ContractVersion"("campaignId", "version");
CREATE INDEX "ContractVersion_campaignId_validFrom_idx" ON "ContractVersion"("campaignId", "validFrom");

CREATE TABLE "CampaignOffer" (
  "id" UUID NOT NULL,
  "campaignId" UUID NOT NULL,
  "classroomId" UUID NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "CampaignOffer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CampaignOffer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CampaignOffer_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CampaignOffer_campaignId_classroomId_key" ON "CampaignOffer"("campaignId", "classroomId");
CREATE INDEX "CampaignOffer_classroomId_idx" ON "CampaignOffer"("classroomId");
