ALTER TABLE "AuditEvent" ADD COLUMN "changes" JSONB;
CREATE TYPE "SchoolSegment" AS ENUM ('INFANTIL', 'FUNDAMENTAL');
CREATE TABLE "SchoolYear" (
  "id" UUID PRIMARY KEY, "year" INTEGER NOT NULL UNIQUE CHECK ("year" BETWEEN 1900 AND 2200),
  "startDate" VARCHAR(10) NOT NULL, "endDate" VARCHAR(10) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version" > 0),
  CHECK ("startDate" <= "endDate")
);
CREATE TABLE "SchoolStage" (
  "id" UUID PRIMARY KEY, "name" TEXT NOT NULL, "segment" "SchoolSegment" NOT NULL,
  "authorization" JSONB, "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version" > 0)
);
CREATE UNIQUE INDEX "SchoolStage_name_key" ON "SchoolStage" ("name");
CREATE UNIQUE INDEX "SchoolStage_name_normalized" ON "SchoolStage" (lower(trim("name")));
CREATE TABLE "SchoolGrade" (
  "id" UUID PRIMARY KEY, "name" TEXT NOT NULL,
  "stageId" UUID NOT NULL REFERENCES "SchoolStage"("id"),
  "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version" > 0), UNIQUE ("stageId", "name")
);
CREATE UNIQUE INDEX "SchoolGrade_name_normalized" ON "SchoolGrade" ("stageId", lower(trim("name")));
CREATE TABLE "Classroom" (
  "id" UUID PRIMARY KEY, "name" TEXT NOT NULL,
  "schoolYearId" UUID NOT NULL REFERENCES "SchoolYear"("id"),
  "gradeId" UUID NOT NULL REFERENCES "SchoolGrade"("id"),
  "capacity" INTEGER NOT NULL CHECK ("capacity" > 0),
  "occupied" INTEGER NOT NULL DEFAULT 0 CHECK ("occupied" >= 0 AND "occupied" <= "capacity"),
  "active" BOOLEAN NOT NULL DEFAULT false,
  "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version" > 0),
  UNIQUE ("schoolYearId", "gradeId", "name")
);
CREATE UNIQUE INDEX "Classroom_name_normalized" ON "Classroom" ("schoolYearId", "gradeId", lower(trim("name")));
