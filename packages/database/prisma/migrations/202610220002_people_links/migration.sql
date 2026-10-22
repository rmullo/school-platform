CREATE TYPE "ParentageRole" AS ENUM ('MOTHER', 'FATHER', 'OTHER');
CREATE TYPE "RepresentationKind" AS ENUM ('LEGAL_GUARDIAN', 'LEGAL_REPRESENTATIVE');

CREATE TABLE "Person" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "birthDate" VARCHAR(10),
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Person_version_check" CHECK ("version" > 0),
  CONSTRAINT "Person_birthDate_check" CHECK ("birthDate" IS NULL OR "birthDate" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
);
CREATE INDEX "Person_name_idx" ON "Person"("name");

CREATE TABLE "StudentProfile" (
  "id" UUID NOT NULL,
  "personId" UUID NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentProfile_personId_key" UNIQUE ("personId"),
  CONSTRAINT "StudentProfile_version_check" CHECK ("version" > 0),
  CONSTRAINT "StudentProfile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "StudentParentage" (
  "id" UUID NOT NULL,
  "studentId" UUID NOT NULL,
  "personId" UUID NOT NULL,
  "role" "ParentageRole" NOT NULL,
  "evidence" TEXT NOT NULL,
  "validFrom" VARCHAR(10) NOT NULL,
  "validUntil" VARCHAR(10) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "StudentParentage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentParentage_studentId_personId_role_key" UNIQUE ("studentId", "personId", "role"),
  CONSTRAINT "StudentParentage_dates_check" CHECK ("validFrom" <= "validUntil"),
  CONSTRAINT "StudentParentage_version_check" CHECK ("version" > 0),
  CONSTRAINT "StudentParentage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StudentParentage_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "StudentParentage_personId_idx" ON "StudentParentage"("personId");

CREATE TABLE "StudentRepresentation" (
  "id" UUID NOT NULL,
  "studentId" UUID NOT NULL,
  "personId" UUID NOT NULL,
  "kind" "RepresentationKind" NOT NULL,
  "evidence" TEXT NOT NULL,
  "restrictions" TEXT,
  "validFrom" VARCHAR(10) NOT NULL,
  "validUntil" VARCHAR(10) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "StudentRepresentation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentRepresentation_studentId_personId_kind_key" UNIQUE ("studentId", "personId", "kind"),
  CONSTRAINT "StudentRepresentation_dates_check" CHECK ("validFrom" <= "validUntil"),
  CONSTRAINT "StudentRepresentation_version_check" CHECK ("version" > 0),
  CONSTRAINT "StudentRepresentation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StudentRepresentation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "StudentRepresentation_personId_idx" ON "StudentRepresentation"("personId");

CREATE TABLE "StudentFinancialResponsible" (
  "id" UUID NOT NULL,
  "studentId" UUID NOT NULL,
  "personId" UUID NOT NULL,
  "evidence" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "StudentFinancialResponsible_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentFinancialResponsible_studentId_key" UNIQUE ("studentId"),
  CONSTRAINT "StudentFinancialResponsible_version_check" CHECK ("version" > 0),
  CONSTRAINT "StudentFinancialResponsible_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StudentFinancialResponsible_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "StudentFinancialResponsible_personId_idx" ON "StudentFinancialResponsible"("personId");

CREATE TABLE "PickupAuthorization" (
  "id" UUID NOT NULL,
  "studentId" UUID NOT NULL,
  "personId" UUID NOT NULL,
  "evidence" TEXT NOT NULL,
  "restrictions" TEXT,
  "validFrom" VARCHAR(10) NOT NULL,
  "validUntil" VARCHAR(10) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "PickupAuthorization_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PickupAuthorization_studentId_personId_validFrom_key" UNIQUE ("studentId", "personId", "validFrom"),
  CONSTRAINT "PickupAuthorization_dates_check" CHECK ("validFrom" <= "validUntil"),
  CONSTRAINT "PickupAuthorization_version_check" CHECK ("version" > 0),
  CONSTRAINT "PickupAuthorization_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PickupAuthorization_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "PickupAuthorization_personId_idx" ON "PickupAuthorization"("personId");
